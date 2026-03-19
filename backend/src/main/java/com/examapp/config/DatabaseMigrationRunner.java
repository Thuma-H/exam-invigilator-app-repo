package com.examapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DatabaseMigrationRunner — executes SQL migration files on application startup.
 *
 * Why not Flyway?
 *   Flyway 10+ dropped built-in SQLite support. Rather than pulling in an
 *   unofficial community driver, we run the numbered V*.sql files ourselves.
 *
 * How it works:
 *   1. Creates a schema_version tracking table (if it doesn't exist)
 *   2. Scans classpath:db/migration/ for V*.sql files, sorted by version number
 *   3. Skips any migration that has already been applied (recorded in schema_version)
 *   4. Executes new migrations inside a transaction and records them
 *
 * Ordering: @Order(1) ensures migrations run BEFORE DataInitializer (@Order(2))
 * so that tables exist before seed data is inserted.
 */
@Component
@Order(1)
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            // Step 1: Create tracking table to remember which migrations ran
            try (Statement stmt = conn.createStatement()) {
                stmt.execute(
                    "CREATE TABLE IF NOT EXISTS schema_version (" +
                    "  version TEXT PRIMARY KEY, " +
                    "  description TEXT, " +
                    "  applied_at TEXT DEFAULT (datetime('now'))" +
                    ")"
                );
            }

            // Step 2: Find all migration files on the classpath, sorted by name
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:db/migration/V*.sql");
            Arrays.sort(resources, (a, b) -> a.getFilename().compareTo(b.getFilename()));

            System.out.println("\n    Database Migration Runner");
            System.out.println("   Found " + resources.length + " migration file(s)\n");

            // Step 3: Execute each migration that hasn't been applied yet
            for (Resource resource : resources) {
                String filename = resource.getFilename();
                String version = filename.split("__")[0];
                String description = filename.split("__")[1].replace(".sql", "").replace("_", " ");

                if (isAlreadyApplied(conn, version)) {
                    System.out.println("   [OK] " + filename + " (already applied)");
                    continue;
                }

                // Read the SQL file content
                String sql;
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                    sql = reader.lines().collect(Collectors.joining("\n"));
                }

                // Parse into individual SQL statements using a proper parser
                // that respects string literals, parentheses, and comments
                List<String> statements = parseSqlStatements(sql);

                System.out.println("   >> Applying " + filename + " (" + statements.size() + " statements)...");
                conn.setAutoCommit(false);
                try (Statement stmt = conn.createStatement()) {
                    for (String s : statements) {
                        try {
                            stmt.execute(s);
                        } catch (Exception stmtEx) {
                            // Skip "already exists" errors — Hibernate ddl-auto=update
                            // may have already created these tables/indexes
                            String msg = stmtEx.getMessage().toLowerCase();
                            if (msg.contains("already exists") || msg.contains("duplicate")) {
                                String preview = s.length() > 70 ? s.substring(0, 70) + "..." : s;
                                System.out.println("     -- Skipped (already exists): " + preview);
                            } else {
                                throw stmtEx;
                            }
                        }
                    }

                    // Record that this migration was applied
                    stmt.execute("INSERT INTO schema_version (version, description) " +
                                 "VALUES ('" + version + "', '" + description + "')");
                    conn.commit();
                    System.out.println("   [OK] " + filename + " applied successfully");
                } catch (Exception e) {
                    conn.rollback();
                    System.err.println("   [FAIL] " + filename + " FAILED: " + e.getMessage());
                    throw new RuntimeException("Migration " + filename + " failed", e);
                } finally {
                    conn.setAutoCommit(true);
                }
            }

            System.out.println("\n   Database migrations complete.\n");
        }
    }

    /**
     * Parse raw SQL text into individual executable statements.
     *
     * A simple semicolon-split breaks on SQL like:
     *   CHECK (status IN ('SCHEDULED','ACTIVE'))
     * because joining lines and splitting on ";" doesn't respect
     * parenthesized blocks or string literals.
     *
     * This parser tracks:
     *   - Parenthesis nesting depth (so semicolons inside CREATE TABLE
     *     CHECK constraints are not treated as statement terminators)
     *   - Single-quoted string literals (so parentheses inside strings
     *     like '(' don't mess up nesting)
     *   - Line comments (-- ...) which are stripped entirely
     */
    private List<String> parseSqlStatements(String sql) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        int parenDepth = 0;
        boolean inString = false;

        for (String line : sql.split("\n")) {
            String trimmedLine = line.trim();

            // Skip pure comment lines and blank lines
            if (trimmedLine.isEmpty() || trimmedLine.startsWith("--")) {
                continue;
            }

            // Strip inline comments (-- after SQL code) but not inside strings
            String processedLine = stripInlineComment(trimmedLine);

            // Walk character by character to track state
            for (int i = 0; i < processedLine.length(); i++) {
                char c = processedLine.charAt(i);

                if (inString) {
                    current.append(c);
                    // Two consecutive single quotes ('') is an escaped quote inside a string
                    if (c == '\'' && i + 1 < processedLine.length() && processedLine.charAt(i + 1) == '\'') {
                        current.append('\'');
                        i++; // skip the second quote
                    } else if (c == '\'') {
                        inString = false; // end of string literal
                    }
                } else {
                    if (c == '\'') {
                        inString = true;
                        current.append(c);
                    } else if (c == '(') {
                        parenDepth++;
                        current.append(c);
                    } else if (c == ')') {
                        parenDepth--;
                        current.append(c);
                    } else if (c == ';' && parenDepth == 0) {
                        // Statement terminator at top level
                        String stmt = current.toString().trim();
                        if (!stmt.isEmpty()) {
                            result.add(stmt);
                        }
                        current.setLength(0);
                    } else {
                        current.append(c);
                    }
                }
            }

            // Add a space between lines so they don't concatenate tokens
            if (current.length() > 0) {
                current.append(' ');
            }
        }

        // Handle any remaining statement without a trailing semicolon
        String last = current.toString().trim();
        if (!last.isEmpty()) {
            result.add(last);
        }

        return result;
    }

    /**
     * Remove inline SQL comments (-- ...) that appear after actual SQL code.
     * Does NOT remove comments inside string literals.
     */
    private String stripInlineComment(String line) {
        boolean inStr = false;
        for (int i = 0; i < line.length() - 1; i++) {
            char c = line.charAt(i);
            if (inStr) {
                if (c == '\'' && i + 1 < line.length() && line.charAt(i + 1) == '\'') {
                    i++; // escaped quote
                } else if (c == '\'') {
                    inStr = false;
                }
            } else {
                if (c == '\'') {
                    inStr = true;
                } else if (c == '-' && line.charAt(i + 1) == '-') {
                    return line.substring(0, i).trim();
                }
            }
        }
        return line;
    }

    /**
     * Check if a migration version has already been applied.
     */
    private boolean isAlreadyApplied(Connection conn, String version) throws Exception {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(
                 "SELECT 1 FROM schema_version WHERE version = '" + version + "'")) {
            return rs.next();
        }
    }
}

