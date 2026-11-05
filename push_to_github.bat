@echo off
title KPOINT POLYMARKET HEDGE - Push to GitHub (kpointpolymarkethedge)
echo =========================================================================
echo   KPOINT POLYMARKET HEDGE // TOP 10 DAILY QUANT HEDGING TERMINAL
echo   Repository: https://github.com/kazzo-program/kpointpolymarkethedge
echo =========================================================================
echo.
cd /d "%~dp0"

git remote remove kpointpolymarkethedge 2>nul
git remote add kpointpolymarkethedge https://github.com/kazzo-program/kpointpolymarkethedge.git

echo Pushing to kpointpolymarkethedge...
git push -u kpointpolymarkethedge main --force
if %ERRORLEVEL% equ 0 (
    echo [OK] Successfully synced to kpointpolymarkethedge on GitHub!
) else (
    echo [ERROR] Failed to push to kpointpolymarkethedge. Make sure https://github.com/kazzo-program/kpointpolymarkethedge exists.
)
echo.
pause
