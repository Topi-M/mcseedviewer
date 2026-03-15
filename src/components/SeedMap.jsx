import { useEffect, useRef, useState } from 'react'
import compassSvg from '../assets/compass.svg'
import '../css/SeedMap.css'

const BIOME_COLORS = {
  // 0-9
  0:   [0,   0,   112], // ocean
  1:   [141, 179, 96],  // plains
  2:   [250, 148, 24],  // desert
  3:   [96,  96,  96],  // windswept hills (mountains)
  4:   [5,   102, 33],  // forest
  5:   [11,  102, 89],  // taiga
  6:   [7,   149, 108], // swamp
  7:   [0,   0,   255], // river
  8:   [112, 2,   0],   // nether wastes
  9:   [128, 128, 255], // the end
  // 10-19
  10:  [144, 144, 160], // frozen ocean
  11:  [160, 210, 220], // frozen river
  12:  [255, 255, 255], // snowy plains (snowy tundra)
  13:  [160, 160, 160], // snowy mountains
  14:  [255, 0,   255], // mushroom fields
  15:  [160, 0,   255], // mushroom field shore
  16:  [250, 222, 85],  // beach
  17:  [210, 95,  18],  // desert hills
  18:  [34,  85,  28],  // wooded hills
  19:  [22,  83,  59],  // taiga hills
  // 20-29
  20:  [114, 120, 154], // mountain edge
  21:  [83,  123, 9],   // jungle
  22:  [44,  66,  5],   // jungle hills
  23:  [98,  139, 23],  // jungle edge (sparse jungle)
  24:  [0,   0,   48],  // deep ocean
  25:  [163, 163, 163], // stone shore (stony shore)
  26:  [250, 240, 192], // snowy beach
  27:  [196, 211, 148], // birch forest
  28:  [151, 175, 91],  // birch forest hills
  29:  [64,  81,  26],  // dark forest
  // 30-39
  30:  [49,  85,  74],  // snowy taiga
  31:  [36,  63,  54],  // snowy taiga hills
  32:  [89,  102, 81],  // giant tree taiga (old growth pine taiga)
  33:  [69,  79,  62],  // giant tree taiga hills
  34:  [80,  112, 80],  // wooded mountains (windswept forest)
  35:  [189, 178, 95],  // savanna
  36:  [167, 157, 100], // savanna plateau
  37:  [255, 128, 0],   // badlands (mesa)
  38:  [176, 128, 64],  // wooded badlands plateau
  39:  [255, 160, 64],  // badlands plateau
  // 40-50 (1.13+)
  40:  [100, 100, 200], // small end islands
  41:  [200, 200, 100], // end midlands
  42:  [150, 200, 150], // end highlands
  43:  [100, 100, 100], // end barrens
  44:  [0,   0,   172], // warm ocean
  45:  [0,   0,   144], // lukewarm ocean
  46:  [56,  56,  214], // cold ocean
  47:  [0,   0,   80],  // deep warm ocean
  48:  [0,   0,   64],  // deep lukewarm ocean
  49:  [32,  32,  112], // deep cold ocean
  50:  [32,  32,  56],  // deep frozen ocean
  // Alpha/Beta biomes (51-53)
  51:  [196, 152, 91],  // seasonal forest
  52:  [83,  123, 9],   // rainforest
  53:  [141, 179, 96],  // shrubland
  // 127
  127: [0,   0,   0],   // the void
  // Mutated variants (128+)
  129: [213, 237, 126],  // sunflower plains
  130: [128, 128, 128], // gravelly mountains (windswept gravelly hills)
  131: [47,  128, 36],  // flower forest
  132: [49,  102, 89],  // taiga mountains
  133: [34,  108, 77],  // swamp hills
  140: [178, 220, 255], // ice spikes
  149: [109, 119, 7],   // modified jungle
  151: [119, 136, 24],  // modified jungle edge
  155: [217, 228, 158], // tall birch forest (old growth birch forest)
  156: [170, 180, 115], // tall birch hills
  157: [49,  66,  21],  // dark forest hills
  158: [26,  63,  56],  // snowy taiga mountains
  160: [107, 122, 103], // giant spruce taiga (old growth spruce taiga)
  161: [83,  92,  79],  // giant spruce taiga hills
  162: [104, 108, 104], // modified gravelly mountains
  163: [219, 207, 114], // shattered savanna (windswept savanna)
  164: [195, 183, 90],  // shattered savanna plateau
  165: [255, 90,  0],   // eroded badlands
  166: [204, 160, 96],  // modified wooded badlands plateau (wooded badlands)
  167: [255, 195, 96],  // modified badlands plateau
  168: [83,  123, 9],   // bamboo jungle
  169: [44,  66,  5],   // bamboo jungle hills
  // 1.16 Nether biomes
  170: [78,  56,  79],  // soul sand valley
  171: [128, 37,  37],  // crimson forest
  172: [64,  128, 96],  // warped forest
  173: [64,  64,  96],  // basalt deltas
  // 1.17
  174: [125, 100, 80],  // dripstone caves
  175: [50,  153, 80],  // lush caves
  // 1.18
  177: [103, 148, 71],  // meadow
  178: [200, 220, 200], // grove
  179: [200, 220, 230], // snowy slopes
  180: [120, 140, 140], // jagged peaks
  181: [180, 210, 230], // frozen peaks
  182: [144, 128, 128], // stony peaks
  // 1.19
  183: [20,  10,  30],  // deep dark
  184: [78,  115, 85],  // mangrove swamp
  // 1.20
  185: [255, 183, 197], // cherry grove
  // 1.21
  186: [200, 200, 180], // pale garden
}
const BIOME_NAMES = {
  0: 'Ocean', 1: 'Plains', 2: 'Desert', 3: 'Windswept Hills', 4: 'Forest',
  5: 'Taiga', 6: 'Swamp', 7: 'River', 8: 'Nether Wastes', 9: 'The End',
  10: 'Frozen Ocean', 11: 'Frozen River', 12: 'Snowy Plains', 13: 'Snowy Mountains',
  14: 'Mushroom Fields', 15: 'Mushroom Field Shore', 16: 'Beach', 17: 'Desert Hills',
  18: 'Wooded Hills', 19: 'Taiga Hills', 20: 'Mountain Edge', 21: 'Jungle',
  22: 'Jungle Hills', 23: 'Sparse Jungle', 24: 'Deep Ocean', 25: 'Stony Shore',
  26: 'Snowy Beach', 27: 'Birch Forest', 28: 'Birch Forest Hills', 29: 'Dark Forest',
  30: 'Snowy Taiga', 31: 'Snowy Taiga Hills', 32: 'Old Growth Pine Taiga',
  33: 'Giant Tree Taiga Hills', 34: 'Windswept Forest', 35: 'Savanna',
  36: 'Savanna Plateau', 37: 'Badlands', 38: 'Wooded Badlands', 39: 'Badlands Plateau',
  40: 'Small End Islands', 41: 'End Midlands', 42: 'End Highlands', 43: 'End Barrens',
  44: 'Warm Ocean', 45: 'Lukewarm Ocean', 46: 'Cold Ocean', 47: 'Deep Warm Ocean',
  48: 'Deep Lukewarm Ocean', 49: 'Deep Cold Ocean', 50: 'Deep Frozen Ocean',
  127: 'The Void', 129: 'Sunflower Plains', 130: 'Windswept Gravelly Hills',
  131: 'Flower Forest', 132: 'Taiga Mountains', 133: 'Swamp Hills', 140: 'Ice Spikes',
  149: 'Modified Jungle', 151: 'Modified Jungle Edge', 155: 'Old Growth Birch Forest',
  156: 'Tall Birch Hills', 157: 'Dark Forest Hills', 158: 'Snowy Taiga Mountains',
  160: 'Old Growth Spruce Taiga', 161: 'Giant Spruce Taiga Hills',
  162: 'Modified Gravelly Mountains', 163: 'Windswept Savanna',
  164: 'Shattered Savanna Plateau', 165: 'Eroded Badlands',
  166: 'Wooded Badlands', 167: 'Modified Badlands Plateau',
  168: 'Bamboo Jungle', 169: 'Bamboo Jungle Hills',
  170: 'Soul Sand Valley', 171: 'Crimson Forest', 172: 'Warped Forest',
  173: 'Basalt Deltas', 174: 'Dripstone Caves', 175: 'Lush Caves',
  177: 'Meadow', 178: 'Grove', 179: 'Snowy Slopes', 180: 'Jagged Peaks',
  181: 'Frozen Peaks', 182: 'Stony Peaks', 183: 'Deep Dark',
  184: 'Mangrove Swamp', 185: 'Cherry Grove', 186: 'Pale Garden',
}

const DEFAULT_COLOR = [100, 100, 100]

const VIEW_W = 800
const VIEW_H = 500
const TILE_PX = 128
const VALID_CUBIOMES_SCALES = [1, 4, 16, 64, 256]
const FADE_MS = 250

const MC_VERSIONS = [
  { label: '1.21.11',   value: 28 },
  { label: '1.21.3',   value: 25 },
  { label: '1.21.1',   value: 24 },
  { label: '1.20',     value: 23 },
  { label: '1.19.4',   value: 22 },
  { label: '1.19.2',   value: 21 },
  { label: '1.18',     value: 20 },
  { label: '1.17',     value: 19 },
  { label: '1.16',     value: 18 },
  { label: '1.15',     value: 16 },
  { label: '1.14',     value: 15 },
  { label: '1.13',     value: 14 },
  { label: '1.12',     value: 13 },
  { label: '1.11',     value: 12 },
  { label: '1.10',     value: 11 },
  { label: '1.9',      value: 10 },
  { label: '1.8',      value: 9  },
  { label: '1.7',      value: 8  },
  { label: '1.6',      value: 7  },
  { label: '1.5',      value: 6  },
  { label: '1.4',      value: 5  },
  { label: '1.3',      value: 4  },
  { label: '1.2',      value: 3  },
  { label: '1.1',      value: 2  },
  { label: '1.0',      value: 1  },
  { label: 'Beta 1.7.3', value: 0  },
]

const STRUCTURE_TYPES = [
  { id: 5,  label: 'Village',         color: '#ffff00' },
  { id: 1,  label: 'Desert Pyramid',  color: '#ffd700' },
  { id: 2,  label: 'Jungle Temple',   color: '#32cd32' },
  { id: 3,  label: 'Swamp Hut',       color: '#2e8b57' },
  { id: 4,  label: 'Igloo',           color: '#add8e6' },
  { id: 8,  label: 'Monument',        color: '#00ced1' },
  { id: 9,  label: 'Mansion',         color: '#8b4513' },
  { id: 10, label: 'Outpost',         color: '#a9a9a9' },
  { id: 13, label: 'Ancient City',    color: '#9370db' },
  { id: 6,  label: 'Ocean Ruin',      color: '#4169e1' },
  { id: 7,  label: 'Shipwreck',       color: '#deb887' },
  { id: 23, label: 'Trail Ruins',     color: '#cd853f' },
  { id: 24, label: 'Trial Chambers',  color: '#ff8c00' },
]

// Pick smallest cubiomes scale where 1 cubiomes pixel >= 1 screen pixel
function getCubiomesScale(screenPPB) {
  const bpp = 1 / screenPPB
  for (const s of VALID_CUBIOMES_SCALES) {
    if (s >= bpp) return s
  }
  return 256
}

// Mappaa UI-versio oikeaan cubiomes-arvoon
// Empirisesti testattu vertaamalla muihin seed mappeihin
function getCubiomesVersion(v) {
  if (v === 1)              return 2   // 1.0 → 1.1
  if (v >= 3 && v <= 7)    return 7   // 1.2–1.6 → 1.6
  if (v >= 8 && v <= 13)   return 13  // 1.7–1.12 → 1.12
  if (v >= 14 && v <= 19)  return 19  // 1.13–1.17 → 1.17
  if (v === 20)             return 22  // 1.18 → 1.19.4 generaattori
  if (v === 21 || v === 22) return 23  // 1.19.2–1.19.4 → 1.20 generaattori
  if (v === 23)             return 25  // 1.20 → 1.21.3 generaattori
  if (v === 24 || v === 25) return 26  // 1.21.1–1.21.3 → MC_1_21_WD generaattori
  if (v === 28) return 28  // Pale garden versio
  return v
}

// 28 = Pale garden versio

function tileKey(tx, tz, cubiomesScale, seed, mcVersion) {
  return `${tx}_${tz}_${cubiomesScale}_${seed}_${getCubiomesVersion(mcVersion)}`
}

export default function SeedMap() {
  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const wasmRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [seedInput, setSeedInput] = useState('12345')
  const [seed, setSeed] = useState(12345)
  const [mcVersion, setMcVersion] = useState(28) // 28 = pale garden versio = uusin versio
  const [activeStructures, setActiveStructures] = useState(new Set())
  const [showSpawn, setShowSpawn] = useState(true)

  // View: centerX/Z in world blocks, screenPPB = screen pixels per block
  const viewRef = useRef({ centerX: 0, centerZ: 0, screenPPB: 0.25 })

  const tileCacheRef = useRef(new Map())
  const renderQueueRef = useRef([])
  const isProcessingRef = useRef(false)
  const generationRef = useRef(0)
  const biomeHoverRef = useRef(null)
  const dragRef = useRef(null)
  const rafRef = useRef(null)
  const seedRef = useRef(seed)
  const mcVersionRef = useRef(mcVersion)
  const activeStructuresRef = useRef(new Set())
  const showSpawnRef = useRef(true)
  const drawFrameRef = useRef(null)
  const scheduleDrawRef = useRef(null)
  const compassRef = useRef(null)
  const spawnRef = useRef({ x: 0, z: 0 })

  useEffect(() => { activeStructuresRef.current = activeStructures }, [activeStructures])
  useEffect(() => { showSpawnRef.current = showSpawn }, [showSpawn])

  useEffect(() => { seedRef.current = seed }, [seed])
  useEffect(() => { mcVersionRef.current = mcVersion }, [mcVersion])

  useEffect(() => {
    window.CubiomesModule().then(instance => {
      const malloc = instance.cwrap('malloc', 'number', ['number'])
      const free   = instance.cwrap('freePtr', null, ['number'])
      wasmRef.current = {
        initGenerator:  instance.cwrap('initGenerator', null, ['number', 'number']),
        getBiomeMap:    instance.cwrap('getBiomeMap', 'number', ['number', 'number', 'number', 'number', 'number']),
        freePtr:        free,
        getSpawnPoint:  instance.cwrap('getSpawnPoint', null, ['number', 'number', 'number', 'number']),
        findStructures: instance.cwrap('findStructures', 'number', ['number','number','number','number','number','number','number','number','number']),
        findStrongholds:instance.cwrap('findStrongholds', 'number', ['number','number','number','number']),
        checkSlimeChunk:instance.cwrap('checkSlimeChunk', 'number', ['number','number','number']),
        malloc,
        HEAP32:         instance.HEAP32,
        getValue:       instance.getValue,
      }

      // Hae spawn heti kun WASM on ladattu
      const pX = malloc(4), pZ = malloc(4)
      wasmRef.current.getSpawnPoint(48, seedRef.current, pX, pZ)
      spawnRef.current = { x: instance.getValue(pX, 'i32'), z: instance.getValue(pZ, 'i32') }
      free(pX); free(pZ)

      setLoaded(true)
    }).catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    if (!loaded || !canvasRef.current) return

    function generateTileCanvas(tx, tz, cubiomesScale) {
      const { initGenerator, getBiomeMap, freePtr, HEAP32 } = wasmRef.current
      const offscreen = new OffscreenCanvas(TILE_PX, TILE_PX)
      const octx = offscreen.getContext('2d')

      initGenerator(getCubiomesVersion(mcVersionRef.current), seedRef.current)
      const ptr = getBiomeMap(tx * TILE_PX, tz * TILE_PX, TILE_PX, TILE_PX, cubiomesScale)

      const imageData = octx.createImageData(TILE_PX, TILE_PX)
      for (let i = 0; i < TILE_PX * TILE_PX; i++) {
        const biomeId = HEAP32[ptr / 4 + i]
        const [r, g, b] = BIOME_COLORS[biomeId] ?? DEFAULT_COLOR
        imageData.data[i * 4 + 0] = r
        imageData.data[i * 4 + 1] = g
        imageData.data[i * 4 + 2] = b
        imageData.data[i * 4 + 3] = 255
      }
      octx.putImageData(imageData, 0, 0)
      freePtr(ptr)
      return offscreen
    }

    function drawFrame() {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const { centerX, centerZ, screenPPB } = viewRef.current
      const cubiomesScale = getCubiomesScale(screenPPB)
      const tileWorldSize = TILE_PX * cubiomesScale
      const tileScreenSize = tileWorldSize * screenPPB

      ctx.clearRect(0, 0, VIEW_W, VIEW_H)
      ctx.imageSmoothingEnabled = false

      const txMin = Math.floor((centerX - VIEW_W / 2 / screenPPB) / tileWorldSize)
      const txMax = Math.floor((centerX + VIEW_W / 2 / screenPPB) / tileWorldSize)
      const tzMin = Math.floor((centerZ - VIEW_H / 2 / screenPPB) / tileWorldSize)
      const tzMax = Math.floor((centerZ + VIEW_H / 2 / screenPPB) / tileWorldSize)

      let needsRedraw = false
      const needed = []
      for (let tx = txMin; tx <= txMax; tx++) {
        for (let tz = tzMin; tz <= tzMax; tz++) {
          const key = tileKey(tx, tz, cubiomesScale, seedRef.current, mcVersionRef.current)
          const cached = tileCacheRef.current.get(key)
          const sx = (tx * tileWorldSize - centerX) * screenPPB + VIEW_W / 2
          const sy = (tz * tileWorldSize - centerZ) * screenPPB + VIEW_H / 2

              if (cached && cached !== 'pending') {
            const alpha = Math.min(1, (Date.now() - cached.addedAt) / FADE_MS)
            ctx.globalAlpha = alpha
            ctx.drawImage(cached.canvas, sx, sy, tileScreenSize, tileScreenSize)
            ctx.globalAlpha = 1
            if (alpha < 1) needsRedraw = true
          } else if (!cached) {
            needed.push({ tx, tz, cubiomesScale })
            tileCacheRef.current.set(key, 'pending')
          }
        }
      }

      // Sort needed tiles center-out
      const tileCenterX = (txMin + txMax) / 2
      const tileCenterZ = (tzMin + tzMax) / 2
      needed.sort((a, b) => {
        const da = (a.tx - tileCenterX) ** 2 + (a.tz - tileCenterZ) ** 2
        const db = (b.tx - tileCenterX) ** 2 + (b.tz - tileCenterZ) ** 2
        return da - db
      })

      if (needed.length > 0) {
        renderQueueRef.current.unshift(...needed)
        if (!isProcessingRef.current) processQueue()
      }

      // Piirrä strukturit overlay-canvasille
      if (overlayCanvasRef.current && wasmRef.current) {
        const octx = overlayCanvasRef.current.getContext('2d')
        octx.clearRect(0, 0, VIEW_W, VIEW_H)
        const { initGenerator, findStructures, freePtr, HEAP32, malloc, getValue } = wasmRef.current
        initGenerator(getCubiomesVersion(mcVersionRef.current), seedRef.current)
        const bx1 = Math.floor(centerX - VIEW_W / 2 / screenPPB)
        const bz1 = Math.floor(centerZ - VIEW_H / 2 / screenPPB)
        const bx2 = Math.ceil(centerX + VIEW_W / 2 / screenPPB)
        const bz2 = Math.ceil(centerZ + VIEW_H / 2 / screenPPB)
        const pCount = malloc(4)
        for (const st of activeStructuresRef.current) {
          const stInfo = STRUCTURE_TYPES.find(s => s.id === st)
          if (!stInfo) continue
          const ptr = findStructures(st, getCubiomesVersion(mcVersionRef.current), seedRef.current, bx1, bz1, bx2, bz2, 1, pCount)
          const count = getValue(pCount, 'i32')
          octx.fillStyle = stInfo.color
          octx.strokeStyle = '#000'
          octx.lineWidth = 1
          for (let i = 0; i < count; i++) {
            const bx = HEAP32[ptr / 4 + i * 2]
            const bz = HEAP32[ptr / 4 + i * 2 + 1]
            const sx = (bx - centerX) * screenPPB + VIEW_W / 2
            const sy = (bz - centerZ) * screenPPB + VIEW_H / 2
            octx.beginPath()
            octx.arc(sx, sy, 5, 0, Math.PI * 2)
            octx.fill()
            octx.stroke()
          }
          if (ptr) freePtr(ptr)
        }
        freePtr(pCount)
      }

      // Position compass at world spawn
      if (compassRef.current) {
        const ox = (spawnRef.current.x - centerX) * screenPPB + VIEW_W / 2
        const oz = (spawnRef.current.z - centerZ) * screenPPB + VIEW_H / 2
        const inView = ox > -16 && ox < VIEW_W + 16 && oz > -16 && oz < VIEW_H + 16
        compassRef.current.style.display = (inView && showSpawnRef.current) ? 'block' : 'none'
        compassRef.current.style.left = `${ox - 16}px`
        compassRef.current.style.top = `${oz - 16}px`
      }

      if (needsRedraw) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(drawFrame)
      }
    }

    function processQueue() {
      const gen = generationRef.current
      isProcessingRef.current = true

      function processNext() {
        if (generationRef.current !== gen) return

        const item = renderQueueRef.current.shift()
        if (!item) {
          isProcessingRef.current = false
          return
        }

        const key = tileKey(item.tx, item.tz, item.cubiomesScale, seedRef.current, mcVersionRef.current)
        if (tileCacheRef.current.get(key) === 'pending') {
          tileCacheRef.current.set(key, { canvas: generateTileCanvas(item.tx, item.tz, item.cubiomesScale), addedAt: Date.now() })
          drawFrame()
        }

        setTimeout(processNext, 0)
      }

      processNext()
    }

    drawFrameRef.current = drawFrame
    scheduleDrawRef.current = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(drawFrame)
    }

    // Päivitä spawn uudelle seedille/versiolle
    if (wasmRef.current) {
      const { getSpawnPoint, malloc, freePtr, getValue } = wasmRef.current
      const pX = malloc(4), pZ = malloc(4)
      getSpawnPoint(getCubiomesVersion(mcVersionRef.current), seedRef.current, pX, pZ)
      spawnRef.current = { x: getValue(pX, 'i32'), z: getValue(pZ, 'i32') }
      freePtr(pX); freePtr(pZ)
    }

    // Invalidate cache and redraw
    generationRef.current++
    tileCacheRef.current = new Map()
    renderQueueRef.current = []
    isProcessingRef.current = false
    drawFrame()
  }, [loaded, seed, mcVersion])

  useEffect(() => {
    if (!loaded || !canvasRef.current) return
    const canvas = canvasRef.current

    function handleWheel(e) {
      e.preventDefault()
      if (!scheduleDrawRef.current) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left - VIEW_W / 2
      const my = e.clientY - rect.top - VIEW_H / 2
      const { centerX, centerZ, screenPPB } = viewRef.current
      const factor = e.deltaY > 0 ? 0.8 : 1.25
      const newPPB = Math.max(1 / 256, Math.min(4, screenPPB * factor))
      viewRef.current = {
        centerX: centerX + mx / screenPPB - mx / newPPB,
        centerZ: centerZ + my / screenPPB - my / newPPB,
        screenPPB: newPPB,
      }
      scheduleDrawRef.current()
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [loaded])

  function handleMouseDown(e) {
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      centerX: viewRef.current.centerX, centerZ: viewRef.current.centerZ,
    }

    function onMove(e) {
      if (!dragRef.current || !scheduleDrawRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const screenPPB = viewRef.current.screenPPB
      viewRef.current = {
        ...viewRef.current,
        centerX: dragRef.current.centerX - dx / screenPPB,
        centerZ: dragRef.current.centerZ - dy / screenPPB,
      }
      scheduleDrawRef.current()
    }

    function onUp() {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleGenerate() {
    const n = parseInt(seedInput)
    if (!isNaN(n)) setSeed(n)
  }

  if (error) return <div>WASM error: {error}</div>
  if (!loaded) return <div>Ladataan...</div>

  function onHoverMove(e) {
    if (!wasmRef.current || !biomeHoverRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const { centerX, centerZ, screenPPB } = viewRef.current
    const bx = Math.floor(centerX + (mx - VIEW_W / 2) / screenPPB)
    const bz = Math.floor(centerZ + (my - VIEW_H / 2) / screenPPB)
    const { getBiomeMap, freePtr, HEAP32 } = wasmRef.current
    const ptr = getBiomeMap(Math.floor(bx / 4), Math.floor(bz / 4), 1, 1, 4)
    const biomeId = HEAP32[ptr / 4]
    freePtr(ptr)
    const name = BIOME_NAMES[biomeId] ?? `Unknown (${biomeId})`
    biomeHoverRef.current.textContent = `${bx}, ${bz} — ${name}`
  }

  function onHoverLeave() {
    if (biomeHoverRef.current) biomeHoverRef.current.textContent = ''
  }

  function toggleStructure(id) {
    const next = new Set(activeStructuresRef.current)
    next.has(id) ? next.delete(id) : next.add(id)
    activeStructuresRef.current = next      // päivitä ref heti, ennen drawFramea
    setActiveStructures(new Set(next))      // päivitä state UI:ta varten
    if (scheduleDrawRef.current) scheduleDrawRef.current()
  }

  return (
    <div className="seedmap-wrapper" style={{ '--map-w': `${VIEW_W}px` }}>
      <div className="seedmap-controls">
        <input
          value={seedInput}
          onChange={e => setSeedInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          placeholder="Seed..."
        />
        <select value={mcVersion} onChange={e => setMcVersion(Number(e.target.value))}>
          {MC_VERSIONS.map(v => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
        <button onClick={handleGenerate}>Näytä</button>
      </div>

      <div
        className="seedmap-viewport"
        style={{ width: VIEW_W, height: VIEW_H }}
        onMouseDown={handleMouseDown}
        onMouseMove={onHoverMove}
        onMouseLeave={onHoverLeave}
      >
        <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="seedmap-canvas" />
        <canvas ref={overlayCanvasRef} width={VIEW_W} height={VIEW_H} className="seedmap-overlay" />
        <img ref={compassRef} src={compassSvg} className="seedmap-compass" alt="" />
      </div>

      <div className="seedmap-biome-hover" ref={biomeHoverRef} />

      <div className="seedmap-structures">
        <button
          className="structure-btn"
          onClick={() => {
            showSpawnRef.current = !showSpawn
            setShowSpawn(!showSpawn)
            if (scheduleDrawRef.current) scheduleDrawRef.current()
          }}
          style={{
            border: `2px solid #ff4444`,
            background: showSpawn ? '#ff4444' : 'transparent',
            opacity: showSpawn ? 1 : 0.5,
          }}
        >
          <img src={compassSvg} alt="Spawn" />
          <span className="structure-tooltip">Spawn</span>
        </button>
        {STRUCTURE_TYPES.map(s => {
          const active = activeStructures.has(s.id)
          return (
            <button
              key={s.id}
              className="structure-btn"
              onClick={() => toggleStructure(s.id)}
              style={{
                border: `2px solid ${s.color}`,
                background: active ? s.color : 'transparent',
                opacity: active ? 1 : 0.5,
              }}
            >
              <img src={compassSvg} alt={s.label} />
              <span className="structure-tooltip">{s.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}