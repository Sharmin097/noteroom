@echo off
for /f "delims=" %%A in ('git config --get core.hooksPath') do set "current_githooks=%%A"
if not "%current_githooks%"==".githooks" (
    git config core.hooksPath .githooks
    echo set githooks path to .githooks
)

exit /b 0
