@echo off
echo Setting up Java 21 environment...
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%

echo Java version:
java -version

echo.
echo Compiling application...
javac -cp "target/classes" -d target/classes src/main/java/com/sprintsync/api/TestApplication.java

echo.
echo Running application...
java -cp "target/classes" com.sprintsync.api.TestApplication

pause
