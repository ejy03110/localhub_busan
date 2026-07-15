@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo [LocalHub Busan] Vue 3 개발 서버를 준비합니다.
if not exist node_modules (
  echo 필요한 패키지를 처음 한 번 설치합니다.
  call npm install --registry=https://registry.npmjs.org/
  if errorlevel 1 (
    echo.
    echo npm install에 실패했습니다. 위 오류 메시지를 확인해 주세요.
    pause
    exit /b 1
  )
)

echo 브라우저를 실행합니다.
call npm run dev -- --open
pause
