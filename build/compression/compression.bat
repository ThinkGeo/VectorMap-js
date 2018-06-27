@echo off
cd %~dp0
setlocal enabledelayedexpansion
set aa=
for /f "delims=" %%a in ('dir /b ".\*.js"') do (
set "aa=!aa! %%a"
)
call uglifyjs %aa% -o output.js 
call base62 output.js -c mapsuite-vectormap.js 
call del output.js 

