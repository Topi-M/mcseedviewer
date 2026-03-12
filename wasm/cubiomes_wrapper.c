#include "cubiomes/generator.h"
#include "cubiomes/finders.h"
#include "cubiomes/util.h"
#include <emscripten.h>
#include <stdlib.h>
#include <string.h>

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

// Returns estimated spawn point for the current generator state
EMSCRIPTEN_KEEPALIVE
void getSpawnPoint(int mcVersion, int seed, int* outX, int* outZ) {
    Generator sg;
    setupGenerator(&sg, mcVersion, 0);
    applySeed(&sg, DIM_OVERWORLD, (uint64_t)(int64_t)seed);
    uint64_t rng = (uint64_t)(int64_t)seed;
    Pos spawn = estimateSpawn(&sg, &rng);
    *outX = spawn.x;
    *outZ = spawn.z;
}

// Find structures of a given type in a block area.
// Returns a malloc'd int array [x0,z0, x1,z1, ...], sets *outCount.
// Caller must free the returned pointer.
// biomeCheck=1 enables biome validation (slower but accurate).
EMSCRIPTEN_KEEPALIVE
int* findStructures(int structType, int mcVersion, int seed,
                    int blockX1, int blockZ1, int blockX2, int blockZ2,
                    int biomeCheck, int* outCount) {
    StructureConfig sc;
    if (!getStructureConfig(structType, mcVersion, &sc)) {
        *outCount = 0;
        return NULL;
    }

    int regionSize = sc.regionSize * 16; // region size in blocks
    int regX1 = (int)floor((double)blockX1 / regionSize) - 1;
    int regZ1 = (int)floor((double)blockZ1 / regionSize) - 1;
    int regX2 = (int)floor((double)blockX2 / regionSize) + 1;
    int regZ2 = (int)floor((double)blockZ2 / regionSize) + 1;

    int maxResults = (regX2 - regX1 + 1) * (regZ2 - regZ1 + 1);
    int* results = (int*)malloc(maxResults * 2 * sizeof(int));
    int count = 0;

    for (int rx = regX1; rx <= regX2; rx++) {
        for (int rz = regZ1; rz <= regZ2; rz++) {
            Pos pos;
            if (!getStructurePos(structType, mcVersion, (uint64_t)(int64_t)seed, rx, rz, &pos))
                continue;
            if (pos.x < blockX1 || pos.x > blockX2 || pos.z < blockZ1 || pos.z > blockZ2)
                continue;
            if (biomeCheck && !isViableStructurePos(structType, &g, pos.x, pos.z, 0))
                continue;
            // 1.18+: maastokorkeuteen perustuva lisätarkistus Desert Pyramid, Jungle Temple, Mansion
            if (biomeCheck && mcVersion >= 45 &&
                (structType == Desert_Pyramid || structType == Jungle_Temple || structType == Mansion) &&
                !isViableStructureTerrain(structType, &g, pos.x, pos.z))
                continue;
            // Eksplisiittinen biomitarkistus Desert Pyramidille:
            // Minecraft sallii vain desert
            if (biomeCheck && structType == Desert_Pyramid) {
                int bId = getBiomeAt(&g, 4, pos.x >> 2, 15, pos.z >> 2);
                int valid;
                if (mcVersion >= 45) { // 1.18+: vain desert
                    valid = (bId == desert);
                } else { // < 1.18: myös desert_hills
                    valid = (bId == desert || bId == desert_hills);
                }
                if (!valid) continue;
            }
            // Eksplisiittinen biomitarkistus Jungle Templelle:
            // Minecraft sallii vain jungle ja bamboo_jungle, ei sparse_jungle
            if (biomeCheck && structType == Jungle_Temple) {
                int bId = getBiomeAt(&g, 4, pos.x >> 2, 15, pos.z >> 2); // y=60
                int valid;
                if (mcVersion >= 45) { // 1.18+: vain jungle ja bamboo_jungle
                    valid = (bId == jungle || bId == bamboo_jungle);
                } else { // < 1.18: myös vanhat biomivariantit
                    valid = (bId == jungle || bId == bamboo_jungle ||
                             bId == jungle_hills || bId == modified_jungle ||
                             bId == bamboo_jungle_hills);
                }
                if (!valid) continue;
            }
            results[count * 2 + 0] = pos.x;
            results[count * 2 + 1] = pos.z;
            count++;
        }
    }

    *outCount = count;
    return results;
}

// Find first N strongholds. Returns malloc'd int array [x0,z0, x1,z1, ...].
// Caller must free the returned pointer.
EMSCRIPTEN_KEEPALIVE
int* findStrongholds(int mcVersion, int seed, int maxCount, int* outCount) {
    Generator sg;
    setupGenerator(&sg, mcVersion, 0);
    applySeed(&sg, DIM_OVERWORLD, (uint64_t)(int64_t)seed);

    int* results = (int*)malloc(maxCount * 2 * sizeof(int));
    int count = 0;

    StrongholdIter sh;
    initFirstStronghold(&sh, mcVersion, (uint64_t)(int64_t)seed);
    while (count < maxCount) {
        int more = nextStronghold(&sh, &sg);
        results[count * 2 + 0] = sh.pos.x;
        results[count * 2 + 1] = sh.pos.z;
        count++;
        if (!more) break;
    }

    *outCount = count;
    return results;
}

// Returns 1 if the chunk is a slime chunk, 0 otherwise.
EMSCRIPTEN_KEEPALIVE
int checkSlimeChunk(int seed, int chunkX, int chunkZ) {
    return isSlimeChunk((uint64_t)(int64_t)seed, chunkX, chunkZ);
}