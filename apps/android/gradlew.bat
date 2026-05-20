@echo off
setlocal
set DIRNAME=%~dp0
set APP_HOME=%DIRNAME%
if defined JAVA_HOME (
	set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
	set "JAVA_EXE=java"
)

"%JAVA_EXE%" -cp "%APP_HOME%gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
exit /b %ERRORLEVEL%
