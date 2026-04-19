import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import { Navigation, Layers } from 'lucide-react';
import '../styles/MapView.css';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const layerOptions = [
  { id: 'streets',   name: 'Streets',   icon: '🗺️' },
  { id: 'satellite', name: 'Satellite', icon: '🛰️' },
  { id: 'terrain',   name: 'Terrain',   icon: '🏔️' },
];

const tileUrls = {
  streets:   { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                            attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '&copy; <a href="https://www.esri.com">Esri</a>' },
  terrain:   { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                              attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>' },
};

const MapView = ({
  treks = [],
  selectedTrek = null,
  onTrekSelect = () => {},
  height = '400px',
  showControls = true,
  center = null,
}) => {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const tileLayerRef  = useRef(null);
  const markersRef    = useRef([]);
  // Keep center stable — only read on init, never triggers re-init
  const initCenter    = useRef(center ? [center[1], center[0]] : [30.0668, 79.0193]);

  const [selectedLayer, setSelectedLayer] = useState('streets');

  // ── 1. Initialize map ONCE ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, { zoomAnimation: true })
      .setView(initCenter.current, 8);

    const { url, attr } = tileUrls.streets;
    tileLayerRef.current = L.tileLayer(url, { attribution: attr }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // empty dep — runs once

  // ── 2. Update markers when treks list changes ───────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (treks.length === 0) return;

    const valid = treks.filter(t => !isNaN(parseFloat(t.lat)) && !isNaN(parseFloat(t.lon)));
    markersRef.current = valid.map(trek =>
      L.marker([parseFloat(trek.lat), parseFloat(trek.lon)])
        .addTo(mapRef.current)
        .bindPopup(`<strong>${trek.name}</strong><br/>${trek.location}`)
    );

    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      // animate:false prevents the _leaflet_pos crash during view switches
      mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50], animate: false });
    }
  }, [treks]);

  // ── 3. Swap tile layer when user picks a different base layer ───────────────
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const { url, attr } = tileUrls[selectedLayer] ?? tileUrls.streets;
    tileLayerRef.current = L.tileLayer(url, { attribution: attr }).addTo(mapRef.current);
  }, [selectedLayer]);

  // ── 4. Pan to selected trek ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedTrek?.lat || !selectedTrek?.lon) return;

    const lat = parseFloat(selectedTrek.lat);
    const lon = parseFloat(selectedTrek.lon);
    mapRef.current.setView([lat, lon], 12, { animate: false });
    L.popup()
      .setLatLng([lat, lon])
      .setContent(`<strong>${selectedTrek.name}</strong><br/>${selectedTrek.location}`)
      .openOn(mapRef.current);
  }, [selectedTrek]);

  const centerOnLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      mapRef.current.setView([coords.latitude, coords.longitude], 12, { animate: false });
    });
  };

  return (
    <div className="map-container" style={{ height }}>
      <div ref={containerRef} className="map-placeholder" style={{ width: '100%', height: '100%' }} />

      {showControls && (
        <div className="map-controls">
          <div className="layer-selector">
            <div className="layer-selector-header">
              <Layers className="layer-selector-icon" />
              <span className="layer-selector-title">Layers</span>
            </div>
            <div className="layer-selector-options">
              {layerOptions.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`layer-button ${selectedLayer === layer.id ? 'active' : 'inactive'}`}
                >
                  <span className="layer-icon">{layer.icon}</span>
                  {layer.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={centerOnLocation} className="location-button" title="Center on my location">
            <Navigation className="location-icon" />
          </button>
        </div>
      )}

      {selectedTrek && (
        <div className="selected-trek">
          <div className="selected-trek-content">
            <div className="flex-1">
              <h3 className="selected-trek-title">{selectedTrek.name}</h3>
              <p className="selected-trek-location">{selectedTrek.location}</p>
              <div className="selected-trek-details">
                <span>{selectedTrek.duration} days</span>
                <span>₹{selectedTrek.price?.toLocaleString()}</span>
                <span className="capitalize">{selectedTrek.difficulty}</span>
              </div>
            </div>
            <button onClick={() => onTrekSelect(null)} className="close-button">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
