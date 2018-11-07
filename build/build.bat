@echo off
cd ..
call npm install 
call npm install uglify-js -g 
call npm run build 
call copy style  "dist"
move dist\ol.mapsuite.js  %~pd0compression
copy src\ol  %~pd0compression   
cd %~pd0compression 
call npm link 
call merge.bat  
call move vectormap-dev.js  ../../dist   
call compression.bat 
call move vectormap.js  ../../dist 
del /q /s  *^ol*




