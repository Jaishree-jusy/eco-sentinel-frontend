import { useState } from 'react';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Controls';
import { requestReport } from '@/services/reportService';
import { Download, Loader2 } from 'lucide-react';

const EXPORTABLE = [
  {
    key: 'polygons-operational',
    label: 'Operational polygons (13,394)',
    formats: ['GeoJSON', 'CSV'],
  },
  {
    key: 'polygons-raw',
    label: 'Raw polygons (136,054)',
    formats: ['GeoJSON', 'CSV'],
  },
  {
    key: 'alerts',
    label: 'Alert register',
    formats: ['CSV', 'PDF'],
  },
  {
    key: 'evidence',
    label: 'Evidence package index',
    formats: ['CSV'],
  },
  {
    key: 'blockchain',
    label: 'Forest-loss records + transactions',
    formats: ['CSV', 'PDF'],
  },
];

export default function AnalyticsExport() {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleExport(key: string, format: string) {
    const id = key + format;

    setBusy(id);
    setError(null);

    try {
      await requestReport(
        key,
        format as 'PDF' | 'CSV' | 'GeoJSON'
      );

      setDone((current) => ({
        ...current,
        [id]: true,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Export failed.'
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Export"
        description="Export pipeline outputs for offline analysis or handoff to other systems."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {EXPORTABLE.map((item) => (
          <SectionCard key={item.key}>
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-gray-700">
                  {item.label}
                </p>

                <p className="text-xs text-gray-400">
                  Available formats:{' '}
                  {item.formats.join(', ')}
                </p>
              </div>

              <div className="flex gap-2">
                {item.formats.map((format) => {
                  const id = item.key + format;

                  return (
                    <Button
                      key={format}
                      variant="secondary"
                      disabled={busy === id}
                      onClick={() =>
                        handleExport(item.key, format)
                      }
                    >
                      {busy === id ? (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <Download size={13} />
                      )}

                      {done[id]
                        ? 'Downloaded ✓'
                        : format}
                    </Button>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Exports are generated directly from the current
        ECO-SENTINEL system data.
      </p>
    </div>
  );
}