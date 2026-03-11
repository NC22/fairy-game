@echo off

:: Установите Build Tools for Visual Studio
:: https://visualstudio.microsoft.com/downloads/
:: Укажите путь к vcvarsall.bat, может отличатся подпапка

set VCVARS_PATH="C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"
:: set VCVARS_PATH="C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"

set ARCH=x64

:: Для релиза DEBUG = 0
set DEBUG=0

if "%1"=="Release" (
    set DEBUG=0
)

if "%1"=="Debug" (
    set DEBUG=1
)

call %VCVARS_PATH% %ARCH%
set SDL=C:\SDL_DEV\SDL3-3.4.2
set SDL_INCLUDE=%SDL%\include
set SDL_LIB=%SDL%\lib\x64

set SDLIMG=C:\SDL_DEV\SDL3_image-3.4.0
set SDLIMG_INCLUDE=%SDLIMG%\include
set SDLIMG_LIB=%SDLIMG%\lib\x64


set SRC=main.cpp
set OUT=main.exe

if "%DEBUG%"=="0" (
    cl.exe /EHsc /O2 /MD %SRC% ^
    /I "%SDL_INCLUDE%" ^
    /I "%SDLIMG_INCLUDE%" ^
    /link ^
    /LIBPATH:"%SDL_LIB%" ^
    /LIBPATH:"%SDLIMG_LIB%" ^
    SDL3.lib SDL3_image.lib ^
    user32.lib gdi32.lib kernel32.lib ^
    /SUBSYSTEM:CONSOLE ^
    /OUT:%OUT%
) else (
    cl.exe /EHsc /MDd %SRC% ^
    /I C:\SDL_DEV\SDL3_image-3.4.0\include ^
    /I "%SDL_INCLUDE%" ^
    /I "%SDLIMG_INCLUDE%" ^
    /link ^
    /LIBPATH:"%SDL_LIB%" ^
    /LIBPATH:"%SDLIMG_LIB%" ^
    SDL3.lib SDL3_image.lib ^
    user32.lib gdi32.lib kernel32.lib ^
    /SUBSYSTEM:CONSOLE ^
    /OUT:%OUT%
)

if %ERRORLEVEL% equ 0 (
    echo Compilation successful.
    echo Run the program using %OUT%
) else (
    echo Compilation failed.
)

pause