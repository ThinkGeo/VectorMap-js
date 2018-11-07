
@echo off
cd  %~dp0
setlocal enabledelayedexpansion
set classpath=
for %%c in (*.js) do @set classpath=!classpath! %%c
set classpath=base62 %classpath% -m vectormap-dev.js
%classpath% 
