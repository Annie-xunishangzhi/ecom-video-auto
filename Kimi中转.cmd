@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "PYTHONUTF8=1"
set "PY=python"
if exist "D:\promgram\.ai_vedio\VoxCPM\.venv\Scripts\python.exe" set "PY=D:\promgram\.ai_vedio\VoxCPM\.venv\Scripts\python.exe"
if not exist out\_kimi mkdir out\_kimi
if exist "%USERPROFILE%\.kimi-webbridge\bin\kimi-webbridge.exe" "%USERPROFILE%\.kimi-webbridge\bin\kimi-webbridge.exe" status > out\_kimi\bridge_status.txt 2>&1
if exist "%USERPROFILE%\.kimi-webbridge\bin\kimi-webbridge.exe" "%USERPROFILE%\.kimi-webbridge\bin\kimi-webbridge.exe" start >> out\_kimi\bridge_status.txt 2>&1
"%PY%" tools\kimi_relay.py --nav-allow > out\_kimi\relay_log.txt 2>&1
