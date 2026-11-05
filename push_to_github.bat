@echo off
title KPOINT BINNSY - Push to GitHub (kpointbinnsy)
echo =========================================================================
echo   KPOINT HEDGE // FREE BET ^& QUALIFYING BET PERFECT HEDGE TERMINAL
echo   Repository: https://github.com/kazzo-program/kpointbinnsy
echo =========================================================================
echo.
cd /d "%~dp0"

git remote remove kpointbinnsy 2>nul
git remote add kpointbinnsy https://github.com/kazzo-program/kpointbinnsy.git

echo Pushing to kpointbinnsy...
git push -u kpointbinnsy main --force
if %ERRORLEVEL% equ 0 (
    echo [OK] Successfully synced to kpointbinnsy on GitHub!
) else (
    echo [ERROR] Failed to push to kpointbinnsy. Make sure https://github.com/kazzo-program/kpointbinnsy exists.
)
echo.
pause
