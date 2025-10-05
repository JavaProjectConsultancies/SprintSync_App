@echo off
echo Starting SprintSync API Backend...
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or later
    pause
    exit /b 1
)

REM Check if Maven wrapper exists
if not exist "mvnw.cmd" (
    echo ERROR: Maven wrapper not found
    echo Please run: mvn clean install
    pause
    exit /b 1
)

REM Compile and run the application
echo Compiling and starting the application...
call mvnw.cmd spring-boot:run

pause
