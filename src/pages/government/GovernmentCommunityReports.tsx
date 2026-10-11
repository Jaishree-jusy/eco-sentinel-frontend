import { useEffect, useState } from 'react';

interface CommunityReport {
  id: string;
  activityType: string;
  location: string;
  district: string;
  date: string;
  trees: string;
  description: string;
  evidence: string;
  submittedBy: string;
  status: string;
  createdAt: string;
}

const STORAGE_KEY = 'eco_sentinel_community_reports';

const STATUS_OPTIONS = [
  'New',
  'Under Review',
  'Verified',
  'Action Taken',
  'Rejected',
];

export default function GovernmentCommunityReports() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selected, setSelected] =
    useState<CommunityReport | null>(null);

  const loadReports = () => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );

      setReports(Array.isArray(stored) ? stored : []);
    } catch (error) {
      console.error('Failed to load community reports:', error);
      setReports([]);
    }
  };

  useEffect(() => {
    loadReports();

    const handleStorage = () => loadReports();

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateStatus = (
    reportId: string,
    newStatus: string
  ) => {
    const updated = reports.map((report) =>
      report.id === reportId
        ? { ...report, status: newStatus }
        : report
    );

    setReports(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    if (selected?.id === reportId) {
      setSelected({
        ...selected,
        status: newStatus,
      });
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-50 text-green-700 border-green-200';

      case 'Action Taken':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';

      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Community Reports
        </h1>

        <p className="mt-2 text-gray-500">
          Review conservation activities, forest changes
          and community-reported environmental concerns.
        </p>
      </div>

      {/* Summary */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Reports
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {reports.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            New
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {reports.filter((r) => r.status === 'New').length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Under Review
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {
              reports.filter(
                (r) => r.status === 'Under Review'
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Verified
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {
              reports.filter(
                (r) =>
                  r.status === 'Verified' ||
                  r.status === 'Action Taken'
              ).length
            }
          </p>
        </div>

      </div>

      {/* Reports */}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Submitted Community Activities
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Reports submitted by citizens and community users.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-medium text-gray-700">
              No community reports yet
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Reports submitted through the Community Portal
              will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-500">

                  <th className="px-6 py-4">
                    Report
                  </th>

                  <th className="px-6 py-4">
                    Activity
                  </th>

                  <th className="px-6 py-4">
                    Location
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Trees
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {report.id}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {report.submittedBy}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {report.activityType}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {report.location}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {report.district}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.date}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.trees || '—'}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(report)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View Report
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Detail Modal */}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Community Report
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selected.id}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-6 p-6">

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Activity
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selected.activityType}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selected.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selected.location}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    District
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selected.district}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Trees
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selected.trees || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Submitted By
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selected.submittedBy}
                  </p>
                </div>

              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Description
                </p>

                <div className="mt-2 rounded-lg border border-gray-100 bg-[var(--color-sand-50)] p-4 text-sm leading-6 text-gray-700">
                  {selected.description}
                </div>
              </div>

              {selected.evidence && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Evidence
                  </p>

                  <p className="mt-2 break-all text-sm text-blue-600">
                    {selected.evidence}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-5">

                <p className="mb-3 text-sm font-semibold text-gray-800">
                  Review Status
                </p>

                <div className="flex flex-wrap gap-2">

                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        updateStatus(selected.id, status)
                      }
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        selected.status === status
                          ? getStatusClass(status)
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}