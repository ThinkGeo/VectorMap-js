@echo off
cd %~pd0 
goto start
    = %1 is the path to the dist file
	= %2 is version
	=%3 is package name
:start
call npm init -y 
call npm install %3
call cd node_modules\%3
call xcopy /y /c /h /r %1\"*"  
call setlocal enabledelayedexpansion
set f=package.json
(for /f "tokens=* delims= " %%i in (%f%) do (
set s=%%i
if "!s:~1,7!" =="version" (
for /f "tokens=1* delims=:" %%j in ('echo !s!') do (
echo %%j:"%2")
) 

if "!s:~1,7!" neq "version" echo !s!))>temp.json
del package.json
ren "temp.json" "package.json"
call npm publish
cd %~pd0
rd /s /q node_modules
for /f "delims=" %%i in ('dir/b/s/a-d^|findstr/ev "\.bat"') do del %%i

