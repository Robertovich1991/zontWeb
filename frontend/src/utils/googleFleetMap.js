// Shared Google Maps helpers for Fleet & GPS-Admin tracking maps.
// Reuses the same Google Maps script loader as address autocomplete.
import { loadGoogleMaps } from '@/components/PlacesAutocomplete';

export { loadGoogleMaps };

// Clean, light/minimal style tuned for fleet tracking (roads visible, POI muted).
export const LIGHT_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e9e4d8' }] },
  { featureType: 'road.highway', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d6e0' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9fb3c4' }] },
];

// Car marker as an SVG data-URI icon, rotation baked in (works with google.maps.Marker).
export function carIcon(color, heading, size = 34) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="${size}" height="${size}">
  <g transform="rotate(${heading || 0} 18 18)">
    <rect x="9" y="3" width="18" height="30" rx="6" fill="${color}" stroke="white" stroke-width="2"/>
    <rect x="12.5" y="7" width="11" height="6" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="12.5" y="23" width="11" height="4" rx="1.5" fill="rgba(255,255,255,0.3)"/>
    <rect x="7" y="9" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="7" y="21" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="25.5" y="9" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="25.5" y="21" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
  </g></svg>`;
  const g = window.google;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new g.maps.Size(size, size),
    anchor: new g.maps.Point(size / 2, size / 2),
  };
}

// Simple circular dot icon (start/end/history points).
export function dotIcon(color, size = 18) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="${color}" stroke="white" stroke-width="3"/>
  </svg>`;
  const g = window.google;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new g.maps.Size(size, size),
    anchor: new g.maps.Point(size / 2, size / 2),
  };
}

// Smoothly animate a google.maps.Marker from one LatLng to another.
export function animateMarkerG(marker, from, to, duration = 1000) {
  const [fLat, fLng] = from;
  const [tLat, tLng] = to;
  if (Math.abs(fLat - tLat) < 0.000001 && Math.abs(fLng - tLng) < 0.000001) return;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = t * (2 - t);
    marker.setPosition({ lat: fLat + (tLat - fLat) * ease, lng: fLng + (tLng - fLng) * ease });
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Create a styled Google map instance in `el`.
export function createFleetMap(el, { center = { lat: 48.86, lng: 2.35 }, zoom = 10 } = {}) {
  const g = window.google;
  return new g.maps.Map(el, {
    center,
    zoom,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: { position: g.maps.ControlPosition.RIGHT_BOTTOM },
    styles: LIGHT_MAP_STYLE,
    clickableIcons: false,
    gestureHandling: 'greedy',
    maxZoom: 19,
  });
}
