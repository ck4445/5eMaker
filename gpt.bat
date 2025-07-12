@echo off
setlocal

REM Set base path
set "BASE=C:\Users\delia\OneDrive\Main\Temporary Files\dndmaker"
set "COMBINED=%BASE%\combined"

REM Create combined directory
if not exist "%COMBINED%" (
    mkdir "%COMBINED%"
)

REM Copy and rename files from 'static'
for %%F in ("%BASE%\static\*") do (
    copy "%%F" "%COMBINED%\static_%%~nF.txt" >nul
)

REM Copy and rename files from 'templates'
for %%F in ("%BASE%\templates\*") do (
    copy "%%F" "%COMBINED%\templates_%%~nF.txt" >nul
)

REM Copy and rename files from the main directory
for %%F in ("%BASE%\*") do (
    if /I not "%%~nxF"=="combine_and_convert.bat" if not "%%~nxF"=="" (
        copy "%%F" "%COMBINED%\main_%%~nF.txt" >nul
    )
)

echo All files copied and converted to .txt in "%COMBINED%".
pause
