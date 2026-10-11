import { useNavigate } from 'react-router-dom';
import {
  TreePine,
  Hexagon,
  ShieldAlert,
  MapPinned,
  FlagTriangleRight,
  FileCheck2,
} from 'lucide-react';

import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { LoadingState } from '@/components/ui/States';
import { GISMap } from '@/maps/GISMap';
import { useAsync } from '@/hooks/useAsync';

import {
  listPolygons,
  getPolygonTotals,
} from '@/services/polygonService';

import { listAlerts } from '@/services/alertService';
import { listEvidence } from '@/services/evidenceService';

import {
  SeverityBadge,
  ForestClassBadge,
  StatusBadge,
} from '@/components/ui/Badge';

import { fmtHa, fmtPct, fmtDate } from '@/utils/format';

import type { Polygon, Alert } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();

  /*
   * Keep the dashboard map lightweight.
   * We only need enough polygons for an overview.
   */
  const polys = useAsync(
    () => listPolygons({ pageSize: 60 }),
    []
  );

  /*
   * Summary/statistics data is lightweight compared with
   * the GeoJSON polygon layer.
   */
  const totals = useAsync(
    () => getPolygonTotals(),
    []
  );

  /*
   * Alerts are needed for the overview and recent-alert table.
   */
  const alerts = useAsync(
    () => listAlerts(),
    []
  );

  /*
   * Evidence is intentionally NOT part of the blocking
   * loading condition below.
   *
   * This means the dashboard can render immediately while
   * evidence statistics continue loading in the background.
   */
  const evidence = useAsync(
    () => listEvidence(),
    []
  );

  /*
   * Only block the dashboard on the core dashboard data.
   */
  if (
    polys.loading ||
    totals.loading ||
    alerts.loading
  ) {
    return (
      <LoadingState label="Loading Eco-Sentinel dashboard…" />
    );
  }

  if (
    !polys.data ||
    !totals.data ||
    !alerts.data
  ) {
    return (
      <LoadingState label="Preparing dashboard data…" />
    );
  }

  const totalsData = totals.data;

  const insideForestHa =
    totalsData.forestContext.insideForest.areaHa;

  const outsideForestHa =
    totalsData.forestContext.outsideForest.areaHa;

  const monitoredHa =
    insideForestHa + outsideForestHa;

  const insideAlerts =
    alerts.data.filter(
      (a) => a.branch === 'inside-forest'
    ).length;

  const outsideAlerts =
    alerts.data.filter(
      (a) => a.branch === 'outside-forest'
    ).length;

  const highPriority =
    alerts.data.filter(
      (a) => a.priority === 'High'
    ).length;

  const evidenceRecords =
    evidence.data ?? [];

  const verifiedEvidence =
    evidenceRecords.filter(
      (e) => e.verificationStatus === 'Verified'
    ).length;

  const recentPolygons = [
    ...polys.data.items,
  ]
    .sort(
      (a, b) =>
        +new Date(b.detectedDate) -
        +new Date(a.detectedDate)
    )
    .slice(0, 6);

  const recentAlerts =
    alerts.data.slice(0, 6);

  const polygonColumns: Column<Polygon>[] = [
    {
      key: 'id',
      header: 'Polygon ID',
      render: (p) => (
        <span className="font-mono text-xs">
          {p.polygonId}
        </span>
      ),
    },
    {
      key: 'area',
      header: 'Area',
      align: 'right',
      render: (p) => fmtHa(p.areaHa),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (p) => (
        <SeverityBadge
          level={p.severityLevel}
        />
      ),
    },
    {
      key: 'confidence',
      header: 'ML Confidence',
      align: 'right',
      render: (p) =>
        fmtPct(p.meanMlProbability),
    },
    {
      key: 'forest',
      header: 'Forest class',
      render: (p) => (
        <ForestClassBadge
          level={p.forestClassification}
        />
      ),
    },
    {
      key: 'region',
      header: 'Region',
      render: (p) => p.division,
    },
  ];

  const alertColumns: Column<Alert>[] = [
    {
      key: 'id',
      header: 'Alert ID',
      render: (a) => (
        <span className="font-mono text-xs">
          {a.alertId}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (a) => a.region,
    },
    {
      key: 'area',
      header: 'Area',
      align: 'right',
      render: (a) =>
        fmtHa(a.areaLostHa),
    },
    {
      key: 'confidence',
      header: 'ML confidence',
      align: 'right',
      render: (a) =>
        fmtPct(a.mlConfidence),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <StatusBadge status={a.status} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Forest-Loss Intelligence Dashboard"
        description="Live summary of the Random Forest detection pipeline for the Kodagu study area — from polygon generation through alert and evidence status."
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Forest area monitored"
          value={fmtHa(monitoredHa)}
          sublabel="Inside + outside forest"
          icon={TreePine}
          accent="canopy"
        />

        <StatCard
          label="Deforestation polygons"
          value={totalsData.operationalPolygons.toLocaleString(
            'en-IN'
          )}
          sublabel={`${totalsData.rawPolygons.toLocaleString(
            'en-IN'
          )} raw detections`}
          icon={Hexagon}
          accent="canopy"
        />

        <StatCard
          label="Inside-forest alerts"
          value={insideAlerts.toString()}
          sublabel="Requires context review"
          icon={ShieldAlert}
          accent="critical"
        />

        <StatCard
          label="Outside-forest detections"
          value={outsideAlerts.toString()}
          sublabel="Urban / rural / other"
          icon={MapPinned}
          accent="info"
        />

        <StatCard
          label="High-priority cases"
          value={highPriority.toString()}
          sublabel="Operational priority = High"
          icon={FlagTriangleRight}
          accent="moderate"
        />

        <StatCard
          label="Verified evidence records"
          value={
            evidence.loading
              ? '…'
              : verifiedEvidence.toString()
          }
          sublabel={
            evidence.loading
              ? 'Loading evidence status'
              : `of ${evidenceRecords.length} generated`
          }
          icon={FileCheck2}
          accent="blockchain"
        />
      </div>

      {/* MAP + SEVERITY */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Study area — Kodagu, Karnataka">
            <div className="p-3">
              <GISMap
                polygons={polys.data.items}
                alerts={alerts.data.slice(0, 60)}
                height="420px"
                maxVisiblePolygons={60}
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Severity mix (operational layer)">
          <div className="p-4 text-sm">
            {(
              [
                'Severe',
                'Moderate',
                'Mild',
                'Unknown',
              ] as const
            ).map((level) => (
              <div
                key={level}
                className="mb-3 last:mb-0"
              >
                <div className="mb-1 flex items-center justify-between">
                  <SeverityBadge level={level} />

                  <span className="font-mono text-xs text-gray-500">
                    {totalsData.severity[
                      level
                    ].toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${
                        totalsData.operationalPolygons
                          ? (totalsData.severity[level] /
                              totalsData.operationalPolygons) *
                            100
                          : 0
                      }%`,
                      background:
                        {
                          Severe: '#c22a2a',
                          Moderate: '#c17a1e',
                          Mild: '#b79a1e',
                          Unknown: '#8a8f94',
                        }[level],
                    }}
                  />
                </div>
              </div>
            ))}

            <p className="mt-4 rounded-lg bg-[var(--color-sand-100)] p-2.5 text-xs text-gray-500">
              Severity reflects NDVI-difference magnitude
              against the project's fixed thresholds — it
              is a separate measurement from Random Forest
              ML confidence.
            </p>
          </div>
        </SectionCard>
      </div>

      {/* TABLES */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Recent detections">
          <DataTable
            columns={polygonColumns}
            rows={recentPolygons}
            rowKey={(p) => p.polygonId}
            onRowClick={(p) =>
              navigate(`/polygons/${p.polygonId}`)
            }
            pageSize={6}
          />
        </SectionCard>

        <SectionCard title="Recent alerts">
          <DataTable
            columns={alertColumns}
            rows={recentAlerts}
            rowKey={(a) => a.alertId}
            onRowClick={(a) =>
              navigate(`/alerts/${a.alertId}`)
            }
            pageSize={6}
          />
        </SectionCard>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Detected dates shown are placeholder mock
        timestamps (
        {recentPolygons[0]
          ? fmtDate(
              recentPolygons[0].detectedDate
            )
          : ''}
        most recent) — replace with backend detection
        dates on integration.
      </p>
    </div>
  );
}