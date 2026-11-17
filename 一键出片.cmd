@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "PYTHONUTF8=1"
set "PY=python"
if exist "D:\promgram\.ai_vedio\VoxCPM\.venv\Scripts\python.exe" set "PY=D:\promgram\.ai_vedio\VoxCPM\.venv\Scripts\python.exe"
set "SCRIPT=%~1"
if "%SCRIPT%"=="" if exist out\next_script.txt set /p SCRIPT=<out\next_script.txt
if "%SCRIPT%"=="" (
  echo [X] no script path: drop script.json on this file, or write it into out\next_script.txt> out\make_log.txt
  exit /b 1
)
"%PY%" pipeline\make.py "%SCRIPT%" --footage auto > out\make_log.txt 2>&1
exit /b %errorlevel%
