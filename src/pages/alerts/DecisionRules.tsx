import { useState } from 'react';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { MOCK_DECISION_RULES } from '@/mocks/misc';
import { cx } from '@/utils/format';

export default function DecisionRules() {
  const [rules, setRules] = useState(MOCK_DECISION_RULES);

  return (
    <div>
      <PageHeader title="Decision Rules" description="Configurable rules that translate detection outputs into operational priority and alert annotations. Rules never assign legal status automatically." />
      <div className="space-y-3">
        {rules.map((r) => (
          <SectionCard key={r.id}>
            <div className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-gray-800">{r.name}</p>
                <p className="mt-1 text-sm text-gray-500">{r.description}</p>
                <div className="mt-2 grid grid-cols-1 gap-1 rounded-lg bg-[var(--color-sand-100)] p-2.5 text-xs font-mono text-gray-600 sm:grid-cols-2">
                  <p><span className="text-gray-400">IF </span>{r.condition}</p>
                  <p><span className="text-gray-400">THEN </span>{r.action}</p>
                </div>
              </div>
              <button
                onClick={() => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)))}
                className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors', r.enabled ? 'bg-[var(--color-canopy-600)]' : 'bg-gray-200')}
              >
                <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', r.enabled ? 'translate-x-5' : 'translate-x-0.5')} />
              </button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
