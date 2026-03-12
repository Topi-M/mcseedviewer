#include "cubiomes/generator.h"
#include "cubiomes/util.h"
#include <emscripten.h>
#include <stdlib.h>

static Generator g;

EMSCRIPTEN_KEEPALIVE
void initGenerator(int mcVersion, int seed) {
    setupGenerator(&g, mcVersion, 0);
    applySeed(&g, DIM_OVERWORLD, (uint64_t)(int64_t)seed);
}

EMSCRIPTEN_KEEPALIVE
int* getBiomeMap(int x, int z, int width, int height, int scale) {
    int* biomes = (int*)malloc(width * height * sizeof(int));
    Range r;
    r.scale = scale;
    r.x = x;
    r.z = z;
    r.sx = width;
    r.sz = height;
    r.y = 63;
    r.sy = 1;
    genBiomes(&g, biomes, r);
    return biomes;
}

EMSCRIPTEN_KEEPALIVE
void freePtr(void* ptr) {
    free(ptr);
}
