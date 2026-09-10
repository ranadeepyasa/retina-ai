@echo off
setlocal enabledelayedexpansion

title RetinaAI Launcher

:: 1. Detect project root directory safely (handles spaces in path)
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

cls
echo ========================================
echo        RETINAAI STARTING
echo ========================================
echo.

:: 2. Check Backend Folder
if not exist "%PROJECT_ROOT%\backend" (
    echo [ERROR] Backend folder not found at:
    echo "%PROJECT_ROOT%\backend"
    echo.
    echo Please ensure run.bat is located in the root of the RetinaAI project.
    echo.
    pause
    exit /b 1
)

:: 3. Check Frontend Folder
if not exist "%PROJECT_ROOT%\frontend" (
    echo [ERROR] Frontend folder not found at:
    echo "%PROJECT_ROOT%\frontend"
    echo.
    echo Please ensure run.bat is located in the root of the RetinaAI project.
    echo.
    pause
    exit /b 1
)

:: 4. Check Python Availability
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not found in system PATH.
    echo.
    echo Please install Python 3.11+ from https://www.python.org/
    echo and ensure "Add python.exe to PATH" is checked during setup.
    echo.
    pause
    exit /b 1
)

:: 5. Check Node / npm Availability
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not found in system PATH.
    echo.
    echo Please install Node.js 18+ from https://nodejs.org/
    echo and ensure npm is accessible from the command line.
    echo.
    pause
    exit /b 1
)

:: 6. Detect Python Virtual Environment (searches common locations)
set "VENV_ACTIVATE="
if exist "%PROJECT_ROOT%\backend\venv\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\backend\venv\Scripts\activate.bat"
) else if exist "%PROJECT_ROOT%\venv\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\venv\Scripts\activate.bat"
) else if exist "%PROJECT_ROOT%\.venv\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\.venv\Scripts\activate.bat"
) else if exist "%PROJECT_ROOT%\backend\.venv\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\backend\.venv\Scripts\activate.bat"
) else if exist "%PROJECT_ROOT%\env\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\env\Scripts\activate.bat"
)

if defined VENV_ACTIVATE (
    echo [Python Env] Virtual environment: "!VENV_ACTIVATE!"
) else (
    echo [Python Env] Using system Python from PATH.
)

:: 7. Detect Backend Port (from backend\.env if present, default: 8000)
set "BACKEND_PORT=8000"
if exist "%PROJECT_ROOT%\backend\.env" (
    for /f "usebackq tokens=1,2 delims==" %%A in ("%PROJECT_ROOT%\backend\.env") do (
        set "KEY=%%A"
        set "VAL=%%B"
        for /f "tokens=* delims= " %%K in ("!KEY!") do set "KEY=%%K"
        for /f "tokens=* delims= " %%V in ("!VAL!") do set "VAL=%%V"
        if /i "!KEY!"=="PORT" set "BACKEND_PORT=!VAL!"
    )
)

:: 8. Detect Frontend Port (defaults to 5173 per vite.config.ts)
set "FRONTEND_PORT=5173"

:: 9. Launch Backend in Separate Command Window
echo Starting Backend...
if defined VENV_ACTIVATE (
    start "RetinaAI - Backend API (FastAPI)" /d "%PROJECT_ROOT%\backend" cmd /k "echo ======================================== && echo  RetinaAI Backend (FastAPI + Uvicorn) && echo ======================================== && echo Activating virtual environment... && call "!VENV_ACTIVATE!" && echo Starting Uvicorn on http://127.0.0.1:%BACKEND_PORT%... && python -m uvicorn app.main:app --host 127.0.0.1 --port %BACKEND_PORT% --reload"
) else (
    start "RetinaAI - Backend API (FastAPI)" /d "%PROJECT_ROOT%\backend" cmd /k "echo ======================================== && echo  RetinaAI Backend (FastAPI + Uvicorn) && echo ======================================== && echo Starting Uvicorn on http://127.0.0.1:%BACKEND_PORT%... && python -m uvicorn app.main:app --host 127.0.0.1 --port %BACKEND_PORT% --reload"
)

:: 10. Launch Frontend in Separate Command Window
echo Starting Frontend...
start "RetinaAI - Frontend (Vite)" /d "%PROJECT_ROOT%\frontend" cmd /k "echo ======================================== && echo  RetinaAI Frontend (React + Vite) && echo ======================================== && echo Starting Vite dev server on port %FRONTEND_PORT%... && npm run dev"

:: 11. Display Active URLs
echo.
echo ========================================
echo        RETINAAI SERVICES ACTIVE
echo ========================================
echo   Frontend:  http://localhost:%FRONTEND_PORT%
echo   Backend:   http://localhost:%BACKEND_PORT%
echo   API Docs:  http://localhost:%BACKEND_PORT%/docs
echo ========================================
echo.
echo Both services are running in their own command windows.
echo Keep those windows open while testing or using RetinaAI.
echo.
echo Press any key to close this launcher window...
pause >nul
