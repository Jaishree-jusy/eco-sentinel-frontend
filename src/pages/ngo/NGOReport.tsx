import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const STORAGE_KEY = 'eco_sentinel_community_reports';

type ReportStatus =
  | 'New'
  | 'Under Review'
  | 'Verified'
  | 'Action Taken'
  | 'Rejected';

interface CommunityReport {
  id: string;
  activityType: string;
  location: string;
  district: string;
  date: string;
  trees: string;
  description: string;
  evidenceLink: string;
  submittedBy: string;
  status: ReportStatus;
  createdAt: string;
}

const ACTIVITY_TYPES = [
  'Tree Planting',
  'Tree Cutting',
  'Deforestation',
  'Suspected Illegal Activity',
  'Forest Restoration',
  'Wildlife/Biodiversity',
  'Other Conservation Activity',
];

function getReports(): CommunityReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function statusClasses(status: ReportStatus) {
  switch (status) {
    case 'Verified':
      return 'bg-green-50 text-green-700 border-green-200';

    case 'Under Review':
      return 'bg-amber-50 text-amber-700 border-amber-200';

    case 'Action Taken':
      return 'bg-blue-50 text-blue-700 border-blue-200';

    case 'Rejected':
      return 'bg-red-50 text-red-700 border-red-200';

    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function StatusIcon({ status }: { status: ReportStatus }) {
  if (status === 'Verified') {
    return <ShieldCheck size={16} />;
  }

  if (status === 'Under Review') {
    return <Clock3 size={16} />;
  }

  if (status === 'Action Taken') {
    return <CheckCircle2 size={16} />;
  }

  if (status === 'Rejected') {
    return <XCircle size={16} />;
  }

  return <AlertCircle size={16} />;
}

function StatusTracker({ status }: { status: ReportStatus }) {
  const steps: ReportStatus[] = [
    'New',
    'Under Review',
    'Verified',
    'Action Taken',
  ];

  if (status === 'Rejected') {
    return (
      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
          <XCircle size={17} />
          Report Rejected
        </div>
        <p className="mt-1 text-xs text-red-600">
          This report could not be verified by the reviewing authority.
        </p>
      </div>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <div className="mt-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Report Progress
      </p>

      <div className="flex items-center">
        {steps.map((step, index) => {
          const completed = index <= currentIndex;

          return (
            <div
              key={step}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    completed
                      ? 'border-[var(--color-canopy-600)] bg-[var(--color-canopy-600)] text-white'
                      : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {completed ? '✓' : index + 1}
                </div>

                <span
                  className={`mt-1 text-center text-[10px] ${
                    completed
                      ? 'font-medium text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-1 mb-5 h-0.5 flex-1 ${
                    index < currentIndex
                      ? 'bg-[var(--color-canopy-600)]'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function NGOReport() {
  const [reports, setReports] = useState<CommunityReport[]>([]);

  const [activityType, setActivityType] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [date, setDate] = useState('');
  const [trees, setTrees] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setReports(getReports());
  }, []);

  function submitReport(e: FormEvent) {
    e.preventDefault();

    if (
      !activityType ||
      !location ||
      !district ||
      !date ||
      !description
    ) {
      return;
    }

    const newReport: CommunityReport = {
      id: `CR-${Date.now()}`,
      activityType,
      location,
      district,
      date,
      trees,
      description,
      evidenceLink,
      submittedBy:
        localStorage.getItem('eco_sentinel_user_name') ||
        'Community User',
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    const updatedReports = [
      ...getReports(),
      newReport,
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedReports)
    );

    setReports(updatedReports);

    setActivityType('');
    setLocation('');
    setDistrict('');
    setDate('');
    setTrees('');
    setDescription('');
    setEvidenceLink('');

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  }

  return (
    <div className="mx-auto max-w-5xl">

      {/* ==================== HEADER ==================== */}

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-canopy-100)] text-[var(--color-canopy-700)]">
            <ClipboardCheck size={21} />
          </div>

          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-ink-900)]">
              Report & Participate
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Report conservation activities, tree planting,
              forest changes and suspected illegal activities.
            </p>
          </div>
        </div>
      </div>

      {/* ==================== SUCCESS ==================== */}

      {submitted && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={20}
              className="mt-0.5 text-green-600"
            />

            <div>
              <p className="text-sm font-semibold text-green-800">
                Report submitted successfully.
              </p>

              <p className="mt-1 text-xs text-green-700">
                Your information has been shared with the
                Government monitoring portal for review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FORM ==================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">

        <div className="mb-6 border-b border-gray-100 pb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Conservation Activity Report
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Provide accurate information so authorities can
            review and respond to community observations.
          </p>
        </div>

        <form
          onSubmit={submitReport}
          className="space-y-5"
        >

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Activity */}

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Activity Type *
              </label>

              <select
                value={activityType}
                onChange={(e) =>
                  setActivityType(e.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
              >
                <option value="">
                  Select activity
                </option>

                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Date *
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
              />
            </div>

            {/* Location */}

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Location / Village *
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                required
                placeholder="Example: Madikeri village"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
              />
            </div>

            {/* District */}

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                District *
              </label>

              <input
                type="text"
                value={district}
                onChange={(e) =>
                  setDistrict(e.target.value)
                }
                required
                placeholder="Example: Kodagu"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
              />
            </div>

            {/* Trees */}

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Number of Trees
              </label>

              <input
                type="number"
                min="0"
                value={trees}
                onChange={(e) =>
                  setTrees(e.target.value)
                }
                placeholder="Planted or affected"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
              />
            </div>

            {/* Evidence */}

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Evidence / Photo Link
              </label>

              <input
                type="url"
                value={evidenceLink}
                onChange={(e) =>
                  setEvidenceLink(e.target.value)
                }
                placeholder="Optional evidence link"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
              />
            </div>

          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">
              Description *
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
              rows={5}
              placeholder="Describe what you observed or the conservation activity carried out..."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[var(--color-canopy-500)]"
            />
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              className="rounded-lg bg-[var(--color-canopy-700)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-canopy-800)]"
            >
              Submit Report
            </button>
          </div>

        </form>
      </div>

      {/* ==================== MY REPORTS ==================== */}

      <div className="mt-8">

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink-900)]">
            My Submitted Reports
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Track the review status of reports you have submitted.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <ClipboardCheck
              size={28}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-medium text-gray-600">
              No reports submitted yet
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Your submitted conservation reports will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {reports
              .slice()
              .reverse()
              .map((report) => (
                <div
                  key={report.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >

                  {/* Report header */}

                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">
                          {report.activityType}
                        </h3>

                        <span className="text-xs text-gray-400">
                          {report.id}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        {report.location}, {report.district}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Submitted on{' '}
                        {new Date(
                          report.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                        report.status
                      )}`}
                    >
                      <StatusIcon status={report.status} />
                      {report.status}
                    </div>

                  </div>

                  {/* Report details */}

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 md:grid-cols-4">

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Date
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {report.date}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Trees
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {report.trees || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Submitted By
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {report.submittedBy}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Evidence
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {report.evidenceLink ? 'Provided' : 'Not provided'}
                      </p>
                    </div>

                  </div>

                  {/* Description */}

                  <div className="mt-4 rounded-lg bg-[var(--color-sand-50)] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Description
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {report.description}
                    </p>
                  </div>

                  {/* Progress */}

                  <StatusTracker status={report.status} />

                </div>
              ))}

          </div>
        )}

      </div>

    </div>
  );
}