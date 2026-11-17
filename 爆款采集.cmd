@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "PYTHONUTF8=1"
set "PY=python"
where python >nul 2>nul || set "PY=py"
"%PY%" -c "import playwright" >nul 2>nul
if errorlevel 1 (
  echo 首次使用：正在安装 Playwright（需要联网，约 2 分钟）……
  "%PY%" -m pip install playwright
  "%PY%" -m playwright install chromium
)
echo 采集中，结果写入 out\research_log.txt
"%PY%" research\collect.py douyin > out\research_log.txt 2>&1
"%PY%" research\collect.py xhs >> out\research_log.txt 2>&1
exit /b 0
