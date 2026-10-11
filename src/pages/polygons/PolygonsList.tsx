import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listPolygons, getPolygonTotals } from '@/services/polygonService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Select, SearchInput, Toolbar, Button } from '@/components/ui/Controls';
import { SeverityBadge, ForestClassBadge } from '@/components/ui/Badge';
import { fmtHa, fmtPct, coord } from '@/utils/format';
import { GISMap } from '@/maps/GISMap';
import { KODAGU_DIVISIONS } from '@/mocks/geo';
import type { Polygon } from '@/types';

export default function PolygonsList() {
  const navigate = useNavigate();
  const totals = useAsync(() => getPolygonTotals(), []);
  const [layer, setLayer] = useState<'operational' | 'raw'>('operational');
  const [severity, setSeverity] = useState('all');
  const [forest, setForest] = useState('all');
  const [region, setRegion] = useState('all');
  const [search, setSearch] = useState('');
  const [showMap, setShowMap] = useState(true);

  const polys = useAsync(() => listPolygons({ pageSize: 500 }), []);

  if (polys.loading || totals.loading) return <LoadingState label="Loading polygon layer…" />;

  let rows = polys.data!.items;
  if (severity !== 'all') rows = rows.filter((p) => p.severityLevel === severity);
  if (forest !== 'all') rows = rows.filter((p) => p.forestClassification === forest);
  if (region !== 'all') rows = rows.filter((p) => p.division === region);
  if (search) rows = rows.filter((p) => p.polygonId.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Polygon>[] = [
    { key: 'id', header: 'Polygon ID', render: (p) => <span className="font-mono text-xs">{p.polygonId}</span> },
    { key: 'area', header: 'Area', align: 'right', render: (p) => fmtHa(p.areaHa), sortValue: (p) => p.areaHa },
    { key: 'confidence', header: 'ML confidence', align: 'right', render: (p) => fmtPct(p.meanMlProbability), sortValue: (p) => p.meanMlProbability },
    { key: 'severity', header: 'Severity', render: (p) => <SeverityBadge level={p.severityLevel} /> },
    { key: 'forest', header: 'Forest class', render: (p) => <ForestClassBadge level={p.forestClassification} /> },
    { key: 'region', header: 'Division', render: (p) => p.division },
    { key: 'centroid', header: 'Centroid', render: (p) => <span className="font-mono text-xs text-gray-500">{coord(p.centroidLat, p.centroidLon)}</span> },
    { key: 'evidence', header: 'Evidence', render: (p) => <span className="text-xs text-gray-500">{p.evidenceStatus}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Polygons"
        description={`${layer === 'operational' ? totals.data!.operationalPolygons.toLocaleString('en-IN') : totals.data!.rawPolygons.toLocaleString('en-IN')} ${layer} polygons · ${totals.data!.operationalThresholdHa} ha operational filter threshold`}
      />

      <Toolbar>
        <Select value={layer} onChange={(e) => setLayer(e.target.value as 'operational' | 'raw')}>
          <option value="operational">Operational (filtered)</option>
          <option value="raw" disabled>Raw ({totals.data!.rawPolygons.toLocaleString('en-IN')}) — not sampled in prototype</option>
        </Select>
        <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="all">All severities</option>
          {['Severe', 'Moderate', 'Mild', 'Unknown'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select value={forest} onChange={(e) => setForest(e.target.value)}>
          <option value="all">All forest classes</option>
          <option>Inside Forest</option>
          <option>Outside Forest</option>
          <option>Unknown / Needs Review</option>
        </Select>
        <Select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">All divisions</option>
          {KODAGU_DIVISIONS.map((d) => <option key={d.division}>{d.division}</option>)}
        </Select>
        <SearchInput placeholder="Search polygon ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <Button variant="secondary" onClick={() => setShowMap((s) => !s)} className="ml-auto">{showMap ? 'Hide map' : 'Show map'}</Button>
        <span className="text-xs text-gray-400">{rows.length.toLocaleString('en-IN')} shown</span>
      </Toolbar>

      {showMap && (
        <SectionCard className="mb-5">
          <div className="p-3">
            <GISMap polygons={rows} height="400px" />
          </div>
        </SectionCard>
      )}

      <SectionCard>
        <DataTable columns={columns} rows={rows} rowKey={(p) => p.polygonId} onRowClick={(p) => navigate(`/polygons/${p.polygonId}`)} pageSize={15} />
      </SectionCard>
    </div>
  );
}
