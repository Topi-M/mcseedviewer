import SeedMap from '../components/SeedMap'
import '../css/Homepage.css'

function Homepage() {
  return (
    <div className='etusivunTausta'>
      <div>
        <div className='etusivuTitle'>
          Minecraft seed viewer
        </div>
        <SeedMap />
        <footer className="site-footer">
          Biome and structure map powered by <a href="https://github.com/Cubitect/cubiomes" target="_blank" rel="noopener noreferrer">Cubiomes</a>
        </footer>
      </div>
    </div>
  )
}

export default Homepage
