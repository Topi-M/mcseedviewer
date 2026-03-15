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
      </div>
    </div>
  )
}

export default Homepage
