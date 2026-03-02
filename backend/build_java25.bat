@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Using JAVA_HOME: %JAVA_HOME%
echo.
"%JAVA_HOME%\bin\java.exe" --version
echo.
call "%TEMP%\apache-maven-3.9.6\bin\mvn.cmd" clean compile

