import '../css/MapSettings.css'

export default function MapSettings({ showRegions, onToggleRegions }) {
  return (
    <div className="map-settings">
      <div className="map-settings-title">Kartta-asetukset</div>
      <div className="map-settings-toggles">
        <label className="map-settings-toggle">
          <input
            type="checkbox"
            checked={showRegions}
            onChange={onToggleRegions}
          />
          <span>Region-reunat (512x512)</span>
        </label>
      </div>
    </div>
  )
}
