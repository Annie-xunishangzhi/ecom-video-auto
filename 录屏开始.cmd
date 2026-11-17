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
  echo [X] 没有找到 ffmpeg，录屏需要它。请安装 ffmpeg 并加入 PATH。> out\rec_log.txt
  exit /b 1
)
if not exist out\_rec\start.json (
  echo [X] 缺少 out\_rec\start.json（录屏参数：step、product、title、mask）。> out\rec_log.txt
  exit /b 1
)
echo 录屏开始 %date% %time% > out\rec_log.txt
start "录屏中-勿关" /min "%PY%" pipeline\record_screen.py start --config out\_rec\start.json
exit /b 0
