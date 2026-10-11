import { useEffect, useState } from 'react';

interface BlockchainBlock {
  block_index: number;
  alert_id: string;
  content_hash: string;
  previous_block_hash: string;
  timestamp: string;
  block_hash: string;
}

interface BlockchainIssue {
  alert_id?: string;
  block_index?: number;
  issue?: string;
}

interface BlockchainResponse {
  chain_exists: boolean;
  valid: boolean;
  issues: BlockchainIssue[] | string[];
  chain: BlockchainBlock[];
}

export default function GovernmentBlockchain() {
  const [data, setData] =
    useState<BlockchainResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchBlockchain = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          (import.meta.env.VITE_BACKEND_URL + '/api/dashboard/blockchain')
        );

        if (!response.ok) {
          throw new Error(
            'Failed to fetch blockchain data'
          );
        }

        const result: BlockchainResponse =
          await response.json();

        setData(result);
      } catch (err) {
        console.error(
          'Blockchain fetch error:',
          err
        );

        setError(
          'Unable to load blockchain data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchain();
  }, []);

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Government Blockchain
        </h1>

        <p className="mt-2 text-gray-500">
          Blockchain integrity and evidence verification
        </p>

        <div className="mt-10 text-center text-gray-500">
          Loading blockchain...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Government Blockchain
        </h1>

        <p className="mt-2 text-gray-500">
          Blockchain integrity and evidence verification
        </p>

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || 'No blockchain data available.'}
        </div>
      </div>
    );
  }

  const chainLength = data.chain?.length || 0;

  const latestBlock =
    chainLength > 0
      ? data.chain[chainLength - 1]
      : null;

  const getIssueText = (
    issue: BlockchainIssue | string
  ) => {
    if (typeof issue === 'string') {
      return issue;
    }

    return issue.issue || 'Unknown verification issue';
  };

  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">

      {/* ==================== HEADER ==================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Government Blockchain
        </h1>

        <p className="mt-2 text-gray-500">
          Blockchain integrity and evidence verification
        </p>
      </div>

      {/* ==================== STATUS CARDS ==================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Chain Status
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              data.chain_exists
                ? 'text-[var(--color-canopy-700)]'
                : 'text-red-600'
            }`}
          >
            {data.chain_exists
              ? 'Available'
              : 'Missing'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Integrity
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              data.valid
                ? 'text-[var(--color-canopy-700)]'
                : 'text-red-600'
            }`}
          >
            {data.valid
              ? 'Verified'
              : 'Issues Found'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Chain Length
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {chainLength.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Blockchain blocks
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Verification Issues
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              data.issues.length === 0
                ? 'text-[var(--color-canopy-700)]'
                : 'text-red-600'
            }`}
          >
            {data.issues.length}
          </p>
        </div>

      </div>

      {/* ==================== VERIFICATION STATUS ==================== */}

      <div
        className={`mt-6 rounded-xl border p-6 ${
          data.valid
            ? 'border-[var(--color-canopy-200)] bg-[var(--color-canopy-50)]'
            : 'border-red-200 bg-red-50'
        }`}
      >
        <div className="flex items-start gap-4">

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              data.valid
                ? 'bg-[var(--color-canopy-100)] text-[var(--color-canopy-700)]'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {data.valid ? '✓' : '!'}
          </div>

          <div>

            <h2
              className={`text-lg font-semibold ${
                data.valid
                  ? 'text-[var(--color-canopy-800)]'
                  : 'text-red-700'
              }`}
            >
              {data.valid
                ? 'Blockchain integrity verified'
                : 'Blockchain verification reported issues'}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {data.valid
                ? 'The blockchain chain and evidence integrity checks have passed.'
                : 'One or more blockchain verification checks require attention.'}
            </p>

          </div>

        </div>
      </div>

      {/* ==================== VERIFICATION ISSUES ==================== */}

      {data.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-red-700">
            Verification Issues
          </h2>

          <div className="mt-4 space-y-3">

            {data.issues.map((issue, index) => (
              <div
                key={index}
                className="rounded-lg border border-red-200 bg-red-50 p-4"
              >

                <p className="text-sm text-red-700">
                  {getIssueText(issue)}
                </p>

                {typeof issue !== 'string' &&
                  issue.alert_id && (
                    <p className="mt-2 text-xs text-gray-500">
                      Alert ID: {issue.alert_id}
                    </p>
                  )}

                {typeof issue !== 'string' &&
                  issue.block_index !== undefined && (
                    <p className="mt-1 text-xs text-gray-500">
                      Block: #{issue.block_index}
                    </p>
                  )}

              </div>
            ))}

          </div>
        </div>
      )}

      {/* ==================== LATEST BLOCK ==================== */}

      {latestBlock && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Latest Blockchain Block
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Most recently recorded evidence integrity block
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <p className="text-xs text-gray-400">
                Block Index
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {latestBlock.block_index}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Alert ID
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {latestBlock.alert_id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Timestamp
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {latestBlock.timestamp}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Content Hash
              </p>

              <p className="mt-1 break-all font-mono text-xs text-gray-700">
                {latestBlock.content_hash}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Previous Block Hash
              </p>

              <p className="mt-1 break-all font-mono text-xs text-gray-700">
                {latestBlock.previous_block_hash}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Block Hash
              </p>

              <p className="mt-1 break-all font-mono text-xs text-gray-700">
                {latestBlock.block_hash}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ==================== RECENT BLOCKS ==================== */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Blockchain Records
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest evidence integrity records
          </p>
        </div>

        {data.chain.length === 0 ? (
          <p className="text-gray-500">
            No blockchain blocks available.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-400">

                  <th className="px-4 py-3">
                    Block
                  </th>

                  <th className="px-4 py-3">
                    Alert ID
                  </th>

                  <th className="px-4 py-3">
                    Timestamp
                  </th>

                  <th className="px-4 py-3">
                    Block Hash
                  </th>

                </tr>
              </thead>

              <tbody>

                {data.chain
                  .slice(-10)
                  .reverse()
                  .map((block) => (
                    <tr
                      key={block.block_index}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >

                      <td className="px-4 py-4 text-sm font-medium text-gray-800">
                        #{block.block_index}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {block.alert_id}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-500">
                        {block.timestamp}
                      </td>

                      <td className="max-w-xs px-4 py-4">
                        <span className="block truncate font-mono text-xs text-gray-500">
                          {block.block_hash}
                        </span>
                      </td>

                    </tr>
                  ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}