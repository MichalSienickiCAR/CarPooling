@echo off
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Instaluje zaleznosci...
    npm install
)
npm start
