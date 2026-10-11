# ECO-SENTINEL — Frontend Prototype

A frontend-only prototype for ECO-SENTINEL, a decentralized geospatial
intelligence system for AI-based forest-loss detection, verification, and
blockchain-backed traceability.

**This is a frontend only.** It does not implement the Python backend,
geospatial/ML pipeline, database, or blockchain layer. It is built to be
API-ready so an existing Flask backend can be connected later with minimal
changes.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn-style UI primitives ·
Recharts · React Leaflet / Leaflet · Lucide icons · React Router

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

## What's represented

The app follows the actual, documented ECO-SENTINEL pipeline:

```
Satellite Data -> Preprocessing -> Change Detection -> Random Forest
-> Polygon Generation -> Area Filtering -> Severity Estimation
-> Forest Boundary Verification -> Alert Generation -> Evidence Generation
-> SHA-256 Hashing -> Blockchain Record -> Dashboard / Analytics
```

- **Primary ML model**: supervised Random Forest (300 trees, max depth 40,
  threshold 0.45, 12 features) - accuracy 90.51%, precision 91.41%, recall
  89.42%, F1 90.41%. Shown as the production model everywhere in the UI.
- **Legacy Isolation Forest branch** is shown only at `/ai/anomaly-detection`,
  clearly labeled "Legacy / Auxiliary" - never as production confidence.
- **Polygon totals** (13,394 operational / 136,054 raw), **severity mix**
  (11,969 Unknown / 1,387 Mild / 38 Moderate / 0 Severe), and **forest-context
  counts** (10,457 inside forest x 8,045.83 ha / 2,937 outside forest x
  47,725.99 ha) are hard-coded pipeline totals sourced from your verified
  numbers - the individual polygon *records* shown in tables/maps are a
  320-record proportional sample (see `src/mocks/polygons.ts`) since the full
  13k+ row set isn't needed to prototype the UI.
- **Model confidence vs. severity vs. priority** are kept as three distinct,
  clearly-labeled concepts throughout (polygon detail, alert detail, risk
  assessment).
- **Detection != illegality.** Legality/permit status is shown as a separate,
  independently-tracked field (`Legal status unknown`, `Authorization
  found`, `Under investigation`, etc.) and is never inferred from ML output.
- **Blockchain layer** traces *forest-loss event records*
  (`LOSS-2025-XXXXX`), not a fabricated physical timber supply chain, per
  the 10-stage traceability lifecycle on each record's detail page.

## Project structure

```
src/
  api/          central fetch client (client.ts) - the only place that knows
                about VITE_API_BASE_URL
  services/     one file per domain (polygonService, alertService,
                evidenceService, blockchainService, traceabilityService,
                detectionService, analyticsService, ...) - every page calls
                these, never mocks directly
  mocks/        isolated mock data generators, calibrated to your verified
                pipeline statistics - this is the ONLY layer that should be
                deleted/replaced when the backend is connected
  types/        shared TypeScript interfaces mirroring expected API shapes
  hooks/        useAsync - generic data-fetching hook used by every page
  components/   reusable UI: Badge system, DataTable, StatCard, PageHeader,
                loading/empty/error states, form controls
  maps/         GISMap (Leaflet) + color scales + icon fixes
  charts/       Recharts wrappers (bar, donut, trend line)
  layouts/      AppLayout (sidebar + topbar shell)
  pages/        one folder per section - geospatial, ai, alerts, polygons,
                evidence, blockchain, analytics
```

## Connecting the real Flask backend

1. Set `VITE_API_BASE_URL` in a `.env` file (see `.env.example`).
2. In each `src/services/*.ts` file, replace the mock-backed function bodies
   (marked `// TODO(backend): ...`) with calls through `apiClient` from
   `src/api/client.ts`, e.g.:

   ```ts
   // before (mock)
   export async function listAlerts(query: AlertQuery = {}) {
     return resolveMock(MOCK_ALERTS.filter(...));
   }

   // after (real backend)
   export async function listAlerts(query: AlertQuery = {}) {
     const params = new URLSearchParams(query as Record<string, string>);
     return apiClient.get<Alert[]>(`/alerts?${params}`);
   }
   ```

3. No page or component code needs to change - every page consumes services,
   never mock data directly.
4. Delete or archive `src/mocks/` once all services are backend-backed.

## Notes

- Polygon footprints are synthetic square/diamond shapes generated around
  each centroid (`buildFootprint` in `src/mocks/polygons.ts`) sized to match
  each polygon's area - for map-rendering purposes only. Replace with real
  polygon GeoJSON from the backend.
- SHA-256 hashes and blockchain transaction IDs are deterministic pseudo-hashes
  for display purposes only - **not real cryptographic hashes**. All actual
  hashing and blockchain verification happens in the backend, as the UI
  states on the Evidence detail page.
- Satellite/before/after images are placeholder stock photography
  (`picsum.photos`), not real imagery.
