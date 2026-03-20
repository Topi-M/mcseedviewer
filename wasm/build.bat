@echo off
REM Aktivoi emsdk ensin: D:\VS code projects\emsdk\emsdk_env.bat
REM Aja tämä skripti wasm-kansiosta: build.bat

emcc cubiomes_wrapper.c cubiomes\biomenoise.c cubiomes\biomes.c cubiomes\finders.c cubiomes\generator.c cubiomes\layers.c cubiomes\noise.c cubiomes\quadbase.c cubiomes\util.c -O2 -s WASM=1 -s EXPORTED_RUNTIME_METHODS="['cwrap','getValue','HEAPU8','HEAP32']" -s "EXPORTED_FUNCTIONS=['_malloc','_free','_initGenerator','_getBiomeMap','_freePtr','_getSpawnPoint','_findStructures','_findStrongholds','_checkSlimeChunk']" -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME="CubiomesModule" -lm -o ..\public\cubiomes.js

if %ERRORLEVEL% EQU 0 (
    echo Build OK
) else (
    echo Build FAILED with error %ERRORLEVEL%
)
