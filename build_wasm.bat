@echo off
call "D:\VS code projects\emsdk\emsdk_env.bat"
cd /d "D:\VS code projects\mcseedviewer\wasm"
echo In directory: %CD%
emcc --version
emcc cubiomes_wrapper.c cubiomes\*.c -O2 -s WASM=1 -s "EXPORTED_RUNTIME_METHODS=['cwrap','getValue','HEAPU8','HEAP32']" -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s "EXPORT_NAME='CubiomesModule'" -lm -o ..\public\cubiomes.js
echo Done. Exit code: %ERRORLEVEL%
