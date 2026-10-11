const awarenessTopics = [
  {
    title: 'Forest Protection',
    description:
      'Support the protection and restoration of forest ecosystems through monitoring and community action.',
  },
  {
    title: 'Illegal Deforestation',
    description:
      'Use verified forest-loss information to identify areas that may require further investigation.',
  },
  {
    title: 'Community Participation',
    description:
      'Encourage local communities to participate in forest conservation, restoration, and reporting activities.',
  },
  {
    title: 'Biodiversity Conservation',
    description:
      'Promote conservation activities that protect habitats and support ecological diversity.',
  },
];

const activities = [
  'Tree plantation and restoration campaigns',
  'Community forest awareness programs',
  'Responsible forest-resource usage education',
  'Wildlife and habitat conservation initiatives',
  'Environmental monitoring and reporting',
];

export default function NGOAwareness() {
  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Awareness & Conservation
        </h1>

        <p className="mt-2 text-gray-500">
          Environmental awareness resources and conservation activities.
        </p>
      </div>

      {/* Awareness Topics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {awarenessTopics.map((topic) => (
          <div
            key={topic.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {topic.title}
            </h2>

            <p className="mt-3 leading-7 text-gray-500">
              {topic.description}
            </p>
          </div>
        ))}

      </div>

      {/* Suggested Activities */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold text-gray-900">
          Suggested Conservation Activities
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          {activities.map((activity, index) => (
            <div
              key={activity}
              className="flex items-start gap-4 rounded-lg border border-gray-200 bg-[var(--color-sand-50)] p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-canopy-50)] text-sm font-semibold text-[var(--color-canopy-700)]">
                {index + 1}
              </span>

              <p className="leading-6 text-gray-600">
                {activity}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* From Detection to Conservation */}
      <div className="mt-8 rounded-xl border border-[var(--color-canopy-200)] bg-[var(--color-canopy-50)] p-6">

        <h2 className="text-xl font-semibold text-[var(--color-canopy-800)]">
          From Detection to Conservation
        </h2>

        <p className="mt-3 leading-7 text-gray-600">
          EcoSentinel provides forest intelligence that can help
          conservation organizations understand detected forest
          changes and support informed environmental action.
        </p>

      </div>

    </div>
  );
}