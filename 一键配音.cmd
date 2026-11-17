@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "PYTHONUTF8=1"
set "VOX=D:\promgram\.ai_vedio\VoxCPM"
set "PY=%VOX%\.venv\Scripts\python.exe"
set "VOXCPM_MODEL_DIR=%VOX%\pretrained_models\VoxCPM2"
set "VOXCPM_DEVICE=cuda"
set "HF_HOME=%VOX%\.cache\huggingface"
set "MODELSCOPE_CACHE=%VOX%\.cache\modelscope"
if not exist "%PY%" (
  echo [X] 找不到 VoxCPM 的 Python：%PY%
  pause
  exit /b 1
)
echo 用固定音色合成三条视频的配音，需要几分钟...
"%PY%" pipeline\tts.py out\2026-11-17-s4-a\script.json out\2026-11-17-s2-a\script.json out\2026-11-17-s5-a\script.json > out\tts_log.txt 2>&1
if errorlevel 1 goto fail
type out\tts_log.txt
echo.
echo 完成。回到 Claude 说一声"配音好了"即可。
pause
exit /b 0
:fail
type out\tts_log.txt
echo.
echo 出错了。日志已保存在 out\tts_log.txt，回到 Claude 说一声，它会自己读日志。
pause
exit /b 1
