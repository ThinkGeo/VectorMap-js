@echo off
cd %~pd0 
call npm install 
call npm install uglify-js -g 
call npm run build 
call copy style  "dist" 
move dist\ol.mapsuite.js  "build\compression" 
copy src\ol  "build\compression"   
cd %~pd0build\compression 
call npm link 
call merge.bat  
call move mapsuite-vectormap-dev.js  %~pd0dist   
call compression.bat 
call move mapsuite-vectormap.js  %~pd0dist 
del /q /s  *^ol*



