@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "PYTHONUTF8=1"
set "PY=python"
if exist "D:\promgram\.ai_vedio\VoxCPM\.venv\Scripts\python.exe" set "PY=D:\promgram\.ai_vedio\VoxCPM\.venv\Scripts\python.exe"
if not exist out\_rec mkdir out\_rec
where ffmpeg >nul 2>nul
if errorlevel 1 (
  echo [X] ffmpeg not found in PATH> out\rec_log.txt
  exit /b 1
)
if not exist out\_rec\start.json (
  echo [X] missing out\_rec\start.json> out\rec_log.txt
  exit /b 1
)
echo recording started %date% %time%> out\rec_log.txt
start "REC" /min "%PY%" pipeline\record_screen.py start --config out\_rec\start.json
exit /b 0
