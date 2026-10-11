import type { BlockchainTransaction } from '@/types';

const API_BASE = (import.meta.env.VITE_BACKEND_URL + '');

interface BackendBlock {
  alert_id: string;
  block_hash: string;
  block_index: number;
  content_hash: string;
  previous_block_hash: string;
  timestamp: string;
}

interface BlockchainResponse {
  chain: BackendBlock[];
}

/*
 * =========================================================
 * CACHE
 * =========================================================
 *
 * The blockchain currently contains 10,457 blocks.
 *
 * We download and convert it only once per frontend session.
 */

let transactionsCache: BlockchainTransaction[] | null = null;

let transactionsPromise:
  | Promise<BlockchainTransaction[]>
  | null = null;


/*
 * =========================================================
 * MAP BACKEND BLOCK
 * =========================================================
 */

function mapBlockToTransaction(
  block: BackendBlock
): BlockchainTransaction {
  return {
    txId: block.block_hash,
    recordId: block.alert_id,
    blockNumber: block.block_index,
    hash: block.content_hash,
    timestamp: block.timestamp,
    status: 'Confirmed',
    verification: 'Verified',
  };
}


/*
 * =========================================================
 * LOAD BLOCKCHAIN
 * =========================================================
 */

export async function listTransactions(): Promise<
  BlockchainTransaction[]
> {
  /*
   * Already loaded → return immediately.
   */
  if (transactionsCache) {
    return transactionsCache;
  }

  /*
   * Another component is already loading it →
   * reuse the same request.
   */
  if (transactionsPromise) {
    return transactionsPromise;
  }

  transactionsPromise = fetch(
    `${API_BASE}/api/dashboard/blockchain`
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          'Failed to load blockchain transactions'
        );
      }

      const data: BlockchainResponse =
        await response.json();

      transactionsCache = (data.chain || []).map(
        mapBlockToTransaction
      );

      return transactionsCache;
    })
    .finally(() => {
      transactionsPromise = null;
    });

  return transactionsPromise;
}


/*
 * =========================================================
 * GET TRANSACTIONS FOR RECORD
 * =========================================================
 */

export async function getTransactionsFor(
  recordId: string
): Promise<BlockchainTransaction[]> {
  const transactions = await listTransactions();

  return transactions.filter(
    (transaction) =>
      transaction.recordId === recordId
  );
}


/*
 * =========================================================
 * CACHE CLEAR
 * =========================================================
 *
 * IMPORTANT for Live Monitoring later.
 *
 * When new blockchain blocks are generated,
 * call this before refreshing blockchain data.
 */

export function clearBlockchainServiceCache() {
  transactionsCache = null;
  transactionsPromise = null;
}