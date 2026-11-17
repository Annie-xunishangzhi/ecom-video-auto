@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "PYTHONUTF8=1"
set "PY=python"
where python >nul 2>nul || set "PY=py"
"%PY%" -c "import playwright" >nul 2>nul
if errorlevel 1 (
  echo Installing Playwright, about 2 minutes...
  "%PY%" -m pip install playwright
  "%PY%" -m playwright install chromium
)
echo A separate browser window will open. Log in to Douyin, then open xiaohongshu.com and log in. Close that browser window when done.
"%PY%" research\collect.py douyin --login
pause
