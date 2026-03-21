import '../css/MapSettings.css'

export default function MapSettings({ showRegions, onToggleRegions, showCoords, onToggleCoords }) {
  return (
    <div className="map-settings">
      <div className="map-settings-title">Map Settings</div>
      <div className="map-settings-toggles">
        <label className="map-settings-toggle">
          <input
            type="checkbox"
            checked={showRegions}
            onChange={onToggleRegions}
          />
          <span>Show Regions (512x512)</span>
        </label>
        <label className="map-settings-toggle">
          <input
            type="checkbox"
            checked={showCoords}
            onChange={onToggleCoords}
          />
          <span>Show Coordinates</span>
        </label>
      </div>
    </div>
  )
}
