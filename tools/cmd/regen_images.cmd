@echo off
cd /d "%~dp0..\.."
set PYTHONIOENCODING=utf-8
python tools\regen_images.py > out\_xfer\regen_images.log 2>&1
