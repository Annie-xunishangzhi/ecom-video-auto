@echo off
chcp 65001 >nul
cd /d "D:\promgram\.ai_vedio\VoxCPM"
set "PYTHONUTF8=1"
echo 正在启动 VoxCPM 网页版，模型加载约一两分钟，完成后打开 http://127.0.0.1:8808
".venv\Scripts\python.exe" local_webui.py --no-browser > "%~dp0out\webui_log.txt" 2>&1
pause
