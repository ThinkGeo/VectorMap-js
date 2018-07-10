@echo off
cd %~pd0 
goto start
:start
call npm init -y 
call npm install vectormap-js
call xcopy /y /c /h /r ..\dist\"*"  node_modules\vectormap-js
call cd node_modules\vectormap-js
call setlocal enabledelayedexpansion
set f=package.json
(for /f "tokens=* delims= " %%i in (%f%) do (
set s=%%i
if "!s:~1,7!" =="version" (
for /f "tokens=1* delims=:" %%j in ('echo !s!') do (
echo %%j:"%1")
) 

if "!s:~1,7!" neq "version" echo !s!))>temp.json
del package.json
ren "temp.json" "package.json"
del mapsuite-vectormap-dev.js
npm publish 





