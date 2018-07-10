@echo off
setlocal enabledelayedexpansion
cd  %~dp0
call cd ..
call git pull
for /F %%i in ('git rev-parse --short HEAD') do ( set commitid=%%i)
set config=C:\config\config.json
set newversion=1
(for /f "tokens=* delims= " %%i in (%config%) do (
    set s=%%i
    if "!s:~12,7!" neq "%commitid%" (
        set  "cur=!s:~21,3!"
        set /a cur=1!cur!-1000+1
		if !cur! LEQ 9 (
			set cur=00!cur!
		)
		if !cur! GTR 9 if !cur! LEQ 99 (
			set cur=0!cur!)
        if "!s:~1,7!" == "version" (
            set "newversion=!s:~11,10!!cur!"
                echo "version":"!s:~11,10!!cur!")
        if "!s:~1,8!" == "lastHead" (
            echo "lastHead":"%commitid%",)
        if "!s:~1,7!" neq "version" if "!s:~1,8!" neq "lastHead" (echo %%i)
    ) else (goto end)
))>config.json
move config.json C:\config\config.json
call cd build
call build.bat
call cd ..
call upload.bat %newversion%
call cd ..\..\..\
call git clean -xdf
:end
