import { useEffect, useRef, useState } from 'react'
import compassSvg from '../assets/compass.svg'

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
  129: [255, 210, 60],  // desert lakes
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
const DEFAULT_COLOR = [100, 100, 100]

const VIEW_SIZE = 512
const TILE_PX = 128
const VALID_CUBIOMES_SCALES = [1, 4, 16, 64, 256]
const FADE_MS = 250

const MC_VERSIONS = [
  { label: '1.21', value: 48 },
  { label: '1.20', value: 47 },
  { label: '1.18', value: 45 },
  { label: '1.17', value: 44 },
  { label: '1.16', value: 43 },
  { label: '1.15', value: 42 },
  { label: '1.12', value: 38 },
]

// Pick smallest cubiomes scale where 1 cubiomes pixel >= 1 screen pixel
function getCubiomesScale(screenPPB) {
  const bpp = 1 / screenPPB
  for (const s of VALID_CUBIOMES_SCALES) {
    if (s >= bpp) return s
  }
  return 256
}

function tileKey(tx, tz, cubiomesScale, seed, mcVersion) {
  return `${tx}_${tz}_${cubiomesScale}_${seed}_${mcVersion}`
}

export default function SeedMap() {
  const canvasRef = useRef(null)
  const wasmRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [seedInput, setSeedInput] = useState('12345')
  const [seed, setSeed] = useState(12345)
  const [mcVersion, setMcVersion] = useState(48)

  // View: centerX/Z in world blocks, screenPPB = screen pixels per block
  const viewRef = useRef({ centerX: 0, centerZ: 0, screenPPB: 0.25 })

  const tileCacheRef = useRef(new Map())
  const renderQueueRef = useRef([])
  const isProcessingRef = useRef(false)
  const generationRef = useRef(0)
  const dragRef = useRef(null)
  const rafRef = useRef(null)
  const seedRef = useRef(seed)
  const mcVersionRef = useRef(mcVersion)
  const drawFrameRef = useRef(null)
  const scheduleDrawRef = useRef(null)
  const compassRef = useRef(null)
  const spawnRef = useRef({ x: 0, z: 0 })

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

      initGenerator(mcVersionRef.current, seedRef.current)
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

      ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE)
      ctx.imageSmoothingEnabled = false

      const txMin = Math.floor((centerX - VIEW_SIZE / 2 / screenPPB) / tileWorldSize)
      const txMax = Math.floor((centerX + VIEW_SIZE / 2 / screenPPB) / tileWorldSize)
      const tzMin = Math.floor((centerZ - VIEW_SIZE / 2 / screenPPB) / tileWorldSize)
      const tzMax = Math.floor((centerZ + VIEW_SIZE / 2 / screenPPB) / tileWorldSize)

      let needsRedraw = false
      const needed = []
      for (let tx = txMin; tx <= txMax; tx++) {
        for (let tz = tzMin; tz <= tzMax; tz++) {
          const key = tileKey(tx, tz, cubiomesScale, seedRef.current, mcVersionRef.current)
          const cached = tileCacheRef.current.get(key)
          const sx = (tx * tileWorldSize - centerX) * screenPPB + VIEW_SIZE / 2
          const sy = (tz * tileWorldSize - centerZ) * screenPPB + VIEW_SIZE / 2

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

      // Position compass at world spawn
      if (compassRef.current) {
        const ox = (spawnRef.current.x - centerX) * screenPPB + VIEW_SIZE / 2
        const oz = (spawnRef.current.z - centerZ) * screenPPB + VIEW_SIZE / 2
        const inView = ox > -16 && ox < VIEW_SIZE + 16 && oz > -16 && oz < VIEW_SIZE + 16
        compassRef.current.style.display = inView ? 'block' : 'none'
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
      getSpawnPoint(mcVersionRef.current, seedRef.current, pX, pZ)
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
      const mx = e.clientX - rect.left - VIEW_SIZE / 2
      const my = e.clientY - rect.top - VIEW_SIZE / 2
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

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
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
      <div style={{ position: 'relative', width: VIEW_SIZE, height: VIEW_SIZE, border: '1px solid #333' }}
        onMouseDown={handleMouseDown}>
        <canvas
          ref={canvasRef}
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          style={{ imageRendering: 'pixelated', display: 'block', cursor: 'grab' }}
        />
        <img
          ref={compassRef}
          src={compassSvg}
          width={32}
          height={32}
          style={{ position: 'absolute', pointerEvents: 'none' }}
          alt=""
        />
      </div>
    </div>
  )
}