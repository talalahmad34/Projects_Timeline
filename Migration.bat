@echo off
REM db_migration.bat_FINAL_20250724_1715

REM --- Database Migration Script ---
REM This script automates the Flask-Migrate process (init, migrate, upgrade).
REM IMPORTANT: Adjust the PROJECT_DIR variable to your actual project path.

SET "PROJECT_DIR=C:\Users\Administrator.DC\Documents\Timeline App\pes_projects_timeline"

echo.
echo ======================================================
echo == Starting PES Projects Timeline Database Migration ==
echo ======================================================
echo.

REM Navigate to the project directory
echo Navigating to project directory: %PROJECT_DIR%
cd "%PROJECT_DIR%"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not change to project directory. Please check the path.
    pause
    exit /b %ERRORLEVEL%
)
echo.

REM Activate the virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not activate virtual environment. Make sure 'venv' exists and path is correct.
    pause
    exit /b %ERRORLEVEL%
)
echo.

REM Set FLASK_APP environment variable
echo Setting FLASK_APP=run.py...
set FLASK_APP=run.py
echo.

REM --- Flask-Migrate Commands ---

REM 1. Initialize migration repository (only needed once per project)
echo Initializing Flask-Migrate repository (if not already exists)...
flask db init
echo.

REM 2. Create a new migration script (detects changes in models)
echo Creating new migration script based on model changes...
flask db migrate -m "Automated migration script"
echo.

REM 3. Apply pending migrations to the database
echo Applying pending database migrations...
flask db upgrade
echo.

echo ======================================================
echo == Database Migration Process Completed ==
echo ======================================================
echo.

pause
