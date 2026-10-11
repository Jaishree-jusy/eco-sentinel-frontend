import { useEffect, useState } from 'react';

interface DetectionProperties {
  polygon_id?: string;
  prediction?: number;
  class?: number;
  area_ha?: number;
  area_lost_ha?: number;
  latitude?: number;
  longitude?: number;
  location?: { latitude?: number; longitude?: number };
  centroid_lat?: number;
  centroid_lon?: number;
  deforestation_probability?: number;
  ml_confidence?: number;
  detection_class?: string;
  model_source?: string;
  status?: string;
}

interface DetectionFeature {
  type: 'Feature';
  properties: DetectionProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | string;
    coordinates: any;
  };
}

interface GeoJSONResponse {
  type: 'FeatureCollection';
  features: DetectionFeature[];
}

function calculatePolygonArea(
  coordinates: any,
  geometryType: string
): number {
  const earthRadius = 6378137;

  function ringArea(ring: number[][]): number {
    let area = 0;

    for (let i = 0; i < ring.length - 1; i++) {
      const [lon1, lat1] = ring[i];
      const [lon2, lat2] = ring[i + 1];

      const x1 =
        (lon1 * Math.PI * earthRadius * Math.cos((lat1 * Math.PI) / 180)) /
        180;
      const y1 = (lat1 * Math.PI * earthRadius) / 180;

      const x2 =
        (lon2 * Math.PI * earthRadius * Math.cos((lat2 * Math.PI) / 180)) /
        180;
      const y2 = (lat2 * Math.PI * earthRadius) / 180;

      area += x1 * y2 - x2 * y1;
    }

    return Math.abs(area / 2);
  }

  if (geometryType === 'Polygon') {
    if (!coordinates?.length) return 0;

    const outerArea = ringArea(coordinates[0]);
    const holesArea = coordinates
      .slice(1)
      .reduce(
        (total: number, ring: number[][]) => total + ringArea(ring),
        0
      );

    return Math.max(0, outerArea - holesArea) / 10000;
  }

  if (geometryType === 'MultiPolygon') {
    if (!coordinates?.length) return 0;

    return coordinates.reduce(
      (total: number, polygon: any) =>
        total + calculatePolygonArea(polygon, 'Polygon'),
      0
    );
  }

  return 0;
}

function getArea(feature: DetectionFeature): number {
  const properties = feature.properties;
  const area = properties.area_lost_ha ?? properties.area_ha;

  if (typeof area === 'number' && Number.isFinite(area) && area >= 0) {
    return area;
  }

  if (
    feature.geometry &&
    (feature.geometry.type === 'Polygon' ||
      feature.geometry.type === 'MultiPolygon')
  ) {
    return calculatePolygonArea(
      feature.geometry.coordinates,
      feature.geometry.type
    );
  }

  return 0;
}

function getPolygonId(
  feature: DetectionFeature,
  index: number,
  prefix: string
): string {
  return (
    feature.properties.polygon_id ||
    `${prefix}-${String(index + 1).padStart(5, '0')}`
  );
}

function getPrediction(feature: DetectionFeature): string {
  const prediction =
    feature.properties.prediction ?? feature.properties.class;

  return prediction === 1 ? 'Deforestation' : 'Other';
}

function getProbability(feature: DetectionFeature): number | null {
  const value =
    feature.properties.deforestation_probability ??
    feature.properties.ml_confidence;

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  // The RF endpoint exposes probability as a value from 0 to 1.
  return Math.max(0, Math.min(1, value));
}

function getLatitude(properties: DetectionProperties): string {
  const latitude =
    properties.centroid_lat ??
    properties.latitude ??
    properties.location?.latitude;
  return typeof latitude === 'number' ? latitude.toFixed(6) : 'N/A';
}

function getLongitude(properties: DetectionProperties): string {
  const longitude =
    properties.centroid_lon ??
    properties.longitude ??
    properties.location?.longitude;
  return typeof longitude === 'number' ? longitude.toFixed(6) : 'N/A';
}

export default function GovernmentMLDetections() {
  const [detections, setDetections] = useState<DetectionFeature[]>([]);
  const [rfDetections, setRfDetections] = useState<DetectionFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [rfLoading, setRfLoading] = useState(true);
  const [error, setError] = useState('');
  const [rfError, setRfError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch((import.meta.env.VITE_BACKEND_URL + '/government/api/ml-detections.geojson'))
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch ML detections');
        }
        return response.json();
      })
      .then((data: GeoJSONResponse) => {
        if (!cancelled) {
          setDetections(data.features || []);
        }
      })
      .catch((err: unknown) => {
        console.error('ML Detection Error:', err);
        if (!cancelled) {
          setError('Unable to load ML detections. Make sure Flask is running.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetch((import.meta.env.VITE_BACKEND_URL + '/government/api/rf-detections.geojson'))
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `RF API request failed with status ${response.status}`
          );
        }
        return response.json();
      })
      .then((data: GeoJSONResponse) => {
        if (!cancelled) {
          console.log('RF Detection API Response:', data);
          setRfDetections(data.features || []);
        }
      })
      .catch((err: unknown) => {
        console.error('RF Detection Error:', err);
        if (!cancelled) {
          setRfError(
            'Unable to load RF predictions. Check that Flask is running and the RF endpoint is available.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setRfLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalArea = detections.reduce(
    (total, feature) => total + getArea(feature),
    0
  );

  const rfTotalArea = rfDetections.reduce(
    (total, feature) => total + getArea(feature),
    0
  );

  return (
    <div className="space-y-6">
      {/* EXISTING ML DETECTIONS */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Government ML Detections
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Existing ML detection polygons received from the Flask backend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total ML Detections
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? '—' : detections.length.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Existing ML-generated polygons
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total ML Area</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? '—' : totalArea.toFixed(2)}
            {!loading && <span className="ml-1 text-sm font-medium">ha</span>}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Calculated from existing ML polygons
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            ML Detection Records
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Existing detection records.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading ML detections...
          </div>
        ) : detections.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No ML detections available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Polygon ID</th>
                  <th className="px-6 py-4">Area</th>
                  <th className="px-6 py-4">Latitude</th>
                  <th className="px-6 py-4">Longitude</th>
                  <th className="px-6 py-4">Prediction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detections.slice(0, 100).map((feature, index) => {
                  const properties = feature.properties;

                  return (
                    <tr
                      key={getPolygonId(feature, index, 'ML-DETECTION')}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        {getPolygonId(feature, index, 'ML-DETECTION')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getArea(feature).toFixed(4)} ha
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {typeof properties.centroid_lat === 'number'
                          ? properties.centroid_lat.toFixed(6)
                          : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {typeof properties.centroid_lon === 'number'
                          ? properties.centroid_lon.toFixed(6)
                          : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          {getPrediction(feature)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && detections.length > 100 && (
          <div className="border-t border-gray-200 p-4 text-center text-xs text-gray-500">
            Showing the first 100 of {detections.length.toLocaleString()} ML
            detections.
          </div>
        )}
      </div>

      {/* SEPARATE RANDOM FOREST PREDICTIONS */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Random Forest Predictions
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Separate supervised Random Forest output. These are unverified
          predictions, not confirmed cases of deforestation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">RF Predictions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {rfLoading ? '—' : rfDetections.length.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Returned by the separate RF endpoint
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            RF Predicted Area
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {rfLoading ? '—' : rfTotalArea.toFixed(2)}
            {!rfLoading && (
              <span className="ml-1 text-sm font-medium">ha</span>
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Area of predicted polygons; not verified forest loss
          </p>
        </div>
      </div>

      {rfError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {rfError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            RF Prediction Records
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The first 100 predictions, with model probability where available.
          </p>
        </div>

        {rfLoading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading RF predictions...
          </div>
        ) : rfError ? (
          <div className="p-6 text-sm text-gray-500">
            RF predictions could not be loaded.
          </div>
        ) : rfDetections.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No RF predictions returned by the endpoint.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">RF Polygon ID</th>
                  <th className="px-6 py-4">Area</th>
                  <th className="px-6 py-4">Latitude</th>
                  <th className="px-6 py-4">Longitude</th>
                  <th className="px-6 py-4">Probability</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rfDetections.slice(0, 100).map((feature, index) => {
                  const properties = feature.properties;
                  const probability = getProbability(feature);

                  return (
                    <tr
                      key={getPolygonId(feature, index, 'RF-DETECTION')}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        {getPolygonId(feature, index, 'RF-DETECTION')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getArea(feature).toFixed(4)} ha
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getLatitude(properties)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getLongitude(properties)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {probability === null
                          ? 'N/A'
                          : `${(probability * 100).toFixed(2)}%`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                          {properties.status || 'unverified_prediction'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!rfLoading && rfDetections.length > 100 && (
          <div className="border-t border-gray-200 p-4 text-center text-xs text-gray-500">
            Showing the first 100 of {rfDetections.length.toLocaleString()} RF
            predictions.
          </div>
        )}
      </div>
    </div>
  );
}