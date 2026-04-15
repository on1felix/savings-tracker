@echo off
setlocal enabledelayedexpansion

set ANTHROPIC_BASE_URL=http://localhost:20128/v1
set ANTHROPIC_AUTH_TOKEN=sk-06340d8b007fcd14-3a61c7-bfb02c6d
set ANTHROPIC_API_KEY=
set CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
set MODEL=kr/claude-sonnet-4.5

:: ===== ЗАПУСК OMNIROUTE =====
echo Starting omniroute...
start "" omniroute

:wait
timeout /t 1 /nobreak >nul
curl -s http://localhost:20128 >nul 2>&1
if errorlevel 1 goto :wait
echo Omniroute ready.
:: ============================

if "%1"=="-m" (
    set MODEL=%2
    goto :run
)

echo.
echo  [1] kr/claude-sonnet-4.5
echo  [2] cx/gpt-5.3-codex-xhigh
echo  [3] gh/claude-opus-4.6
echo.
set /p C="Select= "

if "!C!"=="2" set MODEL=cx/gpt-5.3-codex-xhigh
if "!C!"=="3" set MODEL=gh/claude-opus-4.6

:run
set ANTHROPIC_MODEL=%MODEL%
set ANTHROPIC_SMALL_FAST_MODEL=%MODEL%
echo Model: %MODEL%
claude %*