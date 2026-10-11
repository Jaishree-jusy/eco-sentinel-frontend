
import { useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon as LeafletPolygon,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import {
  Maximize2,
  Minimize2,
  Layers as LayersIcon,
  Compass,
} from 'lucide-react';
import '@/maps/icons';
import { divIcon } from '@/maps/icons';
import type { Alert, Polygon as PolygonT } from '@/types';
import {
  SEVERITY_COLORS,
  FOREST_COLORS,
  confidenceColor,
} from '@/maps/colors';
import { STUDY_AREA_CENTER } from '@/mocks/geo';
import { fmtHa, fmtPct, coord, cx } from '@/utils/format';
import { Link } from 'react-router-dom';

type ColorMode = 'severity' | 'forest' | 'confidence';

interface GISMapProps {
  polygons?: PolygonT[];
  rfPolygons?: PolygonT[];
  alerts?: Alert[];
  colorBy?: ColorMode;
  height?: string;
  center?: [number, number];
  zoom?: number;
  showLegend?: boolean;
  showLayerControl?: boolean;
  onPolygonClick?: (p: PolygonT) => void;
  maxVisiblePolygons?: number;
}

function colorFor(p: PolygonT, mode: ColorMode): string {
  if (mode === 'severity') {
    return SEVERITY_COLORS[p.severityLevel] ?? '#8a8f94';
  }

  if (mode === 'forest') {
    return FOREST_COLORS[p.forestClassification] ?? '#8a8f94';
  }

  return confidenceColor(p.meanMlProbability);
}

function FitBoundsControl() {
  const map = useMap();

  return (
    <button
      onClick={() =>
        map.setView(STUDY_AREA_CENTER as [number, number], 6)
      }
      className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 shadow hover:bg-gray-50"
      title="Recenter to Karnataka overview"
      aria-label="Recenter map"
    >
      <Compass size={15} />
    </button>
  );
}

export function GISMap({
  polygons = [],
  rfPolygons = [],
  alerts = [],
  colorBy = 'severity',
  height = '480px',
  center = STUDY_AREA_CENTER,
  zoom = 6,
  showLegend = true,
  showLayerControl = true,
  onPolygonClick,
  maxVisiblePolygons = 120,
}: GISMapProps) {
  const [basemap, setBasemap] = useState<'satellite' | 'street'>(
    'satellite'
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [layers, setLayers] = useState({
    polygons: true,
    rf: true,
    alerts: true,
    admin: true,
  });
  const [mode, setMode] = useState<ColorMode>(colorBy);

  const visiblePolygons = useMemo(
    () => polygons.slice(0, maxVisiblePolygons),
    [polygons, maxVisiblePolygons]
  );

  const visibleRfPolygons = useMemo(
    () => rfPolygons.slice(0, maxVisiblePolygons),
    [rfPolygons, maxVisiblePolygons]
  );

  const visibleAlerts = useMemo(() => alerts.slice(0, 60), [alerts]);

  const preparePolygons = (items: PolygonT[], isRf = false) =>
    items
      .filter(
        (p) =>
          p.geometry?.type === 'Polygon' &&
          p.geometry.coordinates?.[0]?.length
      )
      .map((p) => ({
        polygon: p,
        positions: p.geometry!.coordinates[0].map(
          ([lon, lat]) => [lat, lon] as [number, number]
        ),
        color: isRf ? '#f59e0b' : colorFor(p, mode),
      }));

  const preparedPolygons = useMemo(
    () => preparePolygons(visiblePolygons),
    [visiblePolygons, mode]
  );

  const preparedRfPolygons = useMemo(
    () => preparePolygons(visibleRfPolygons, true),
    [visibleRfPolygons]
  );

  const legendEntries = useMemo(() => {
    if (mode === 'severity') return Object.entries(SEVERITY_COLORS);
    if (mode === 'forest') return Object.entries(FOREST_COLORS);

    return [
      ['High (≥0.80)', confidenceColor(0.85)],
      ['Medium (0.60–0.79)', confidenceColor(0.65)],
      ['Low (0.45–0.59)', confidenceColor(0.5)],
      ['Below threshold', confidenceColor(0.2)],
    ];
  }, [mode]);

  const tileUrl =
    basemap === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-xl border border-[var(--color-canopy-100)]',
        fullscreen && 'fixed inset-4 z-50 bg-white shadow-2xl'
      )}
      style={{ height: fullscreen ? undefined : height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        preferCanvas
      >
        <TileLayer
          url={tileUrl}
          attribution={
            basemap === 'satellite'
              ? 'Tiles &copy; Esri'
              : '&copy; OpenStreetMap contributors'
          }
        />

        {layers.polygons &&
          preparedPolygons.map(({ polygon: p, positions, color }) => (
            <LeafletPolygon
              key={`ml-${p.polygonId}`}
              positions={positions}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.45,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => onPolygonClick?.(p),
              }}
            >
              <Popup>
                <div className="min-w-[190px] text-xs">
                  <p className="mb-1 font-mono font-semibold">
                    {p.polygonId}
                  </p>
                  <p>Area: {fmtHa(p.areaHa)}</p>
                  <p>Severity: {p.severityLevel}</p>
                  <p>ML confidence: {fmtPct(p.meanMlProbability)}</p>
                  <p>{p.forestClassification}</p>
                  <Link
                    to={`/polygons/${p.polygonId}`}
                    className="mt-1 inline-block font-medium text-[var(--color-canopy-700)] underline"
                  >
                    View polygon →
                  </Link>
                </div>
              </Popup>
            </LeafletPolygon>
          ))}

        {layers.rf &&
          preparedRfPolygons.map(({ polygon: p, positions }) => (
            <LeafletPolygon
              key={`rf-${p.polygonId}`}
              positions={positions}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.25,
                weight: 2,
                dashArray: '5 4',
              }}
            >
              <Popup>
                <div className="min-w-[190px] text-xs">
                  <p className="mb-1 font-mono font-semibold">
                    {p.polygonId}
                  </p>
                  <p>Model: Supervised Random Forest</p>
                  <p>Predicted area: {fmtHa(p.areaHa)}</p>
                  <p>Probability: {fmtPct(p.meanMlProbability)}</p>
                  <p className="mt-1 font-semibold text-amber-700">
                    Unverified prediction — not confirmed forest loss
                  </p>
                </div>
              </Popup>
            </LeafletPolygon>
          ))}

        {layers.alerts &&
          visibleAlerts.map((a) => (
            <Marker
              key={a.alertId}
              position={[a.lat, a.lon]}
              icon={divIcon(
                a.priority === 'High'
                  ? '#c22a2a'
                  : a.priority === 'Medium'
                    ? '#c17a1e'
                    : '#2456a6',
                a.priority === 'High'
              )}
            >
              <Popup>
                <div className="min-w-[190px] text-xs">
                  <p className="mb-1 font-mono font-semibold">
                    {a.alertId}
                  </p>
                  <p>{a.region}</p>
                  <p>Area lost: {fmtHa(a.areaLostHa)}</p>
                  <p>{coord(a.lat, a.lon)}</p>
                  <Link
                    to={`/alerts/${a.alertId}`}
                    className="mt-1 inline-block font-medium text-[var(--color-canopy-700)] underline"
                  >
                    View alert →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}

        <div
          className="leaflet-top leaflet-right"
          style={{ marginTop: 10, marginRight: 10 }}
        >
          <div className="leaflet-control flex flex-col gap-1.5">
            <FitBoundsControl />
            <button
              onClick={() => setFullscreen((f) => !f)}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 shadow hover:bg-gray-50"
              title="Toggle fullscreen"
              aria-label="Toggle fullscreen"
            >
              {fullscreen ? (
                <Minimize2 size={14} />
              ) : (
                <Maximize2 size={14} />
              )}
            </button>
          </div>
        </div>
      </MapContainer>

      {showLayerControl && (
        <div className="absolute left-3 top-3 z-[500] w-56 rounded-lg border border-gray-200 bg-white/95 p-3 text-xs shadow backdrop-blur">
          <p className="mb-2 flex items-center gap-1.5 font-semibold text-gray-600">
            <LayersIcon size={12} />
            Layers
          </p>

          {[
            ['polygons', 'Deforestation polygons'],
            ['rf', 'RF predictions (amber)'],
            ['alerts', 'Alert markers'],
            ['admin', 'Admin boundaries (GADM)'],
          ].map(([key, label]) => (
            <label key={key} className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={layers[key as keyof typeof layers]}
                onChange={(e) =>
                  setLayers((previous) => ({
                    ...previous,
                    [key]: e.target.checked,
                  }))
                }
              />
              {label}
            </label>
          ))}

          <div className="mt-3 border-t border-gray-100 pt-2">
            <p className="mb-1 font-semibold text-gray-600">Basemap</p>
            <div className="flex gap-1">
              <button
                onClick={() => setBasemap('satellite')}
                className={cx(
                  'flex-1 rounded px-2 py-1',
                  basemap === 'satellite'
                    ? 'bg-[var(--color-canopy-700)] text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                Satellite
              </button>
              <button
                onClick={() => setBasemap('street')}
                className={cx(
                  'flex-1 rounded px-2 py-1',
                  basemap === 'street'
                    ? 'bg-[var(--color-canopy-700)] text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                Street
              </button>
            </div>
          </div>

          <div className="mt-3 border-t border-gray-100 pt-2">
            <p className="mb-1 font-semibold text-gray-600">
              Color polygons by
            </p>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ColorMode)}
              className="w-full rounded border border-gray-200 px-1.5 py-1 text-xs"
            >
              <option value="severity">Severity</option>
              <option value="forest">Forest classification</option>
              <option value="confidence">ML confidence</option>
            </select>
          </div>
        </div>
      )}

      {showLegend && (
        <div className="absolute bottom-3 left-3 z-[500] rounded-lg border border-gray-200 bg-white/95 p-2.5 text-[11px] shadow backdrop-blur">
          {legendEntries.map(([label, color]) => (
            <div
              key={label}
              className="flex items-center gap-1.5 py-0.5"
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: color }}
              />
              {label}
            </div>
          ))}
          <div className="mt-1 flex items-center gap-1.5 border-t pt-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
            RF prediction (unverified)
          </div>
        </div>
      )}
    </div>
  );
}
