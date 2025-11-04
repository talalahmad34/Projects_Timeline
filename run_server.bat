@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM *** IMPORTANT: REPLACE THIS WITH YOUR ACTUAL PROJECT DIRECTORY PATH IF NOT IN THE SAME FOLDER ***
SET "PROJECT_DIR=%~dp0"
REM *************************************************************************************************

CD /D "%PROJECT_DIR%"
IF %ERRORLEVEL% NEQ 0 (
    ECHO ERROR: Could not navigate to project directory. Please check the path.
    PAUSE
    EXIT /B 1
)

ECHO Activating virtual environment...
call venv\Scripts\activate.bat
IF %ERRORLEVEL% NEQ 0 (
    ECHO ERROR: Failed to activate virtual environment. Ensure 'venv' exists and 'activate.bat' is correct.
    PAUSE
    EXIT /B 1
)

ECHO Setting FLASK_APP=run.py...
set FLASK_APP=run.py
IF %ERRORLEVEL% NEQ 0 (
    ECHO ERROR: Failed to set FLASK_APP environment variable.
    PAUSE
    EXIT /B 1
)

ECHO Starting Flask application with Waitress...
REM Use waitress-serve directly for production deployment
REM The 'run:app' refers to the 'app' object in your 'run.py' file
waitress-serve --listen=192.168.0.3:8000 run:app
IF %ERRORLEVEL% NEQ 0 (
    ECHO ERROR: Waitress server failed to start. Please check the output above for details.
    PAUSE
    EXIT /B 1
)

PAUSE
ENDLOCAL
