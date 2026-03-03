@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Set JAVA_HOME to Java 25 (Eclipse Adoptium Temurin)
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo.
echo ============================================
echo Exam Invigilator Backend - Build & Run
echo ============================================
echo Using JAVA_HOME: %JAVA_HOME%
echo.

REM Check if Maven exists
if not exist "%TEMP%\apache-maven-3.9.6\bin\mvn.cmd" (
    echo Downloading Maven 3.9.6...
    if not exist "%TEMP%\maven.zip" (
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip' -OutFile '%TEMP%\maven.zip'"
    )
    powershell -Command "Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%TEMP%' -Force"
)

echo.
echo [Step 1/3] Cleaning old build...
call "%TEMP%\apache-maven-3.9.6\bin\mvn.cmd" clean

echo.
echo [Step 2/3] Building project with Maven...
call "%TEMP%\apache-maven-3.9.6\bin\mvn.cmd" install -DskipTests

if %ERRORLEVEL% equ 0 (
    echo.
    echo ============================================
    echo ✅ Build Successful!
    echo ============================================
    echo.

    if exist "target\exam-invigilator-1.0.0.jar" (
        echo [Step 3/3] Starting Backend Server...
        echo.
        echo ============================================
        echo 📍 Server starting on http://localhost:8080
        echo 📚 API Base: http://localhost:8080/api
        echo.
        echo 🔑 Default Login Credentials:
        echo    Username: invigilator1
        echo    Password: password123
        echo ============================================
        echo.

        java -jar target\exam-invigilator-1.0.0.jar
    ) else (
        echo ❌ ERROR: JAR file not found at target\exam-invigilator-1.0.0.jar
        pause
    )
) else (
    echo.
    echo ❌ Build Failed! Check the errors above.
    echo.
    pause
)

endlocal

