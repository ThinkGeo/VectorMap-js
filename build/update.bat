@echo off
setlocal enabledelayedexpansion
call cd ..
call git pull
for /F %%i in ('git rev-parse --short HEAD') do ( set commitid=%%i)
set config=C:\config\config.json
set newversion=1
(for /f "tokens=* delims= " %%i in (%config%) do (
    set s=%%i
    if "!s:~12,7!" neq "%commitid%" (
        set  "cur=!s:~15,1!"
        set /a cur=cur+1
        if "!s:~1,7!" == "version" (
            set "newversion=!s:~11,4!!cur!"
                echo "version":"!s:~11,4!!cur!")
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
