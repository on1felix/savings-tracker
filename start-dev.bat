@echo off
chcp 65001 >nul
title Копилка — dev server
setlocal

cd /d "%~dp0"

echo.
echo ============================================
echo   Копилка — запуск локального dev-сервера
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ОШИБКА] Node.js не найден в PATH.
    echo Установи Node.js LTS с https://nodejs.org и перезапусти.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [i] node_modules не найден — ставлю зависимости...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ОШИБКА] npm install завершился с ошибкой.
        pause
        exit /b 1
    )
    echo.
)

echo [i] Стартую Vite (npm run dev)...
echo [i] Открой http://localhost:5173 в браузере
echo [i] Чтобы остановить — нажми Ctrl+C
echo.

call npm run dev

echo.
pause
