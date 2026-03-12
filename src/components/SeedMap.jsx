import { useEffect, useRef, useState } from 'react'

const BIOME_COLORS = {
  0:   [0,   0,   112], // ocean
  1:   [141, 179, 96],  // plains
  2:   [250, 148, 24],  // desert
  3:   [96,  96,  96],  // mountains
  4:   [5,   102, 33],  // forest
  5:   [11,  102, 89],  // taiga
  6:   [7,   149, 108], // swamp
  7:   [0,   0,   255], // river
  10:  [173, 216, 230], // frozen ocean
  11:  [160, 210, 220], // frozen river
  12:  [255, 255, 255], // snowy plains
  13:  [160, 160, 160], // snowy mountains
  14:  [255, 0,   255], // mushroom fields
  21:  [83,  123, 9],   // jungle
  24:  [0,   0,   48],  // deep ocean
  25:  [163, 163, 163], // stony shore
  26:  [250, 222, 85],  // snowy beach
  27:  [34,  85,  28],  // birch forest
  29:  [0,   0,   48],  // deep ocean variant
  30:  [49,  85,  74],  // snowy taiga
  32:  [49,  85,  74],  // old growth pine taiga
  35:  [141, 179, 96],  // savanna
  37:  [255, 128, 0],   // badlands
  44:  [0,   0,   172], // warm ocean
  45:  [0,   0,   144], // lukewarm ocean
  46:  [56,  56,  214], // cold ocean
  47:  [0,   0,   112], // deep warm ocean (unused)
  48:  [0,   0,   80],  // deep lukewarm ocean
  50:  [32,  32,  112], // deep cold ocean
  57:  [0,   0,   48],  // deep frozen ocean
}

const DEFAULT_COLOR = [100, 100, 100]

const MC_VERSIONS = [
  { label: '1.21', value: 48 },
  { label: '1.20', value: 47 },
  { label: '1.18', value: 45 },
  { label: '1.17', value: 44 },
  { label: '1.16', value: 43 },
  { label: '1.15', value: 42 },
  { label: '1.12', value: 38 },
]

export default function SeedMap() {
  const canvasRef = useRef(null)
  const wasmRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [seedInput, setSeedInput] = useState('12345')
  const [seed, setSeed] = useState(12345)
  const [mcVersion, setMcVersion] = useState(48)
  const [scale, setScale] = useState(4)

  useEffect(() => {
    window.CubiomesModule().then(instance => {
      wasmRef.current = {
        initGenerator: instance.cwrap('initGenerator', null, ['number', 'number']),
        getBiomeMap:   instance.cwrap('getBiomeMap', 'number', ['number', 'number', 'number', 'number', 'number']),
        freePtr:       instance.cwrap('freePtr', null, ['number']),
        HEAP32:        instance.HEAP32,
      }
      setLoaded(true)
    }).catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    if (!loaded || !canvasRef.current) return
    const { initGenerator, getBiomeMap, freePtr, HEAP32 } = wasmRef.current

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    const startX = -Math.floor(W / 2) * scale
    const startZ = -Math.floor(H / 2) * scale

    initGenerator(mcVersion, seed)
    const ptr = getBiomeMap(startX, startZ, W, H, scale)

    const imageData = ctx.createImageData(W, H)
    for (let i = 0; i < W * H; i++) {
      const biomeId = HEAP32[ptr / 4 + i]
      const [r, g, b] = BIOME_COLORS[biomeId] ?? DEFAULT_COLOR
      imageData.data[i * 4 + 0] = r
      imageData.data[i * 4 + 1] = g
      imageData.data[i * 4 + 2] = b
      imageData.data[i * 4 + 3] = 255
    }
    ctx.putImageData(imageData, 0, 0)
    freePtr(ptr)
  }, [loaded, seed, mcVersion, scale])

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
        <select value={scale} onChange={e => setScale(Number(e.target.value))}>
          <option value={1}>1:1</option>
          <option value={2}>1:2</option>
          <option value={4}>1:4</option>
          <option value={8}>1:8</option>
          <option value={16}>1:16</option>
        </select>
        <button onClick={handleGenerate}>Näytä</button>
      </div>
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        style={{ imageRendering: 'pixelated', display: 'block', border: '1px solid #333' }}
      />
    </div>
  )
}