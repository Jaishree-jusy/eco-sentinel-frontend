import L from 'leaflet';

// react-leaflet's default marker icon paths break under Vite bundling —
// rebuild the icon from CDN URLs instead of local asset imports.
export const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = defaultIcon;

export function divIcon(color: string, pulse = false) {
  return L.divIcon({
    className: 'custom-alert-icon',
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 2px ${color}55;${pulse ? 'animation:pulse-dot 1.8s ease-in-out infinite;' : ''}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}
