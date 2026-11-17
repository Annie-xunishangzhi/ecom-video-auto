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
echo 会打开一个单独的浏览器窗口：在里面登录抖音，再登录小红书（地址栏输入 xiaohongshu.com），都登录好后关掉这个浏览器窗口即可。
"%PY%" research\collect.py douyin --login
pause
