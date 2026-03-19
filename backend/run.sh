#!/bin/bash
# Quick build and run script

cd "$(dirname "$0")"

# Define Maven
MAVEN_CMD="$TEMP/apache-maven-3.9.6/bin/mvn.cmd"

# Build
echo "=== Building Backend ==="
if [ -f "$MAVEN_CMD" ]; then
    "$MAVEN_CMD" clean install -DskipTests
    BUILD_STATUS=$?

    if [ $BUILD_STATUS -eq 0 ]; then
        echo "✅ Build successful!"

        # Try to run JAR
        if [ -f "target/exam-invigilator-1.0.0.jar" ]; then
            echo "=== Starting Backend ==="
            java --enable-native-access=ALL-UNNAMED -jar target/exam-invigilator-1.0.0.jar
        else
            echo "❌ JAR not found"
        fi
    else
        echo "❌ Build failed with status $BUILD_STATUS"
    fi
else
    echo "❌ Maven not found at $MAVEN_CMD"
fi

