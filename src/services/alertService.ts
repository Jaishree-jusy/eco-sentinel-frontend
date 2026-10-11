import type { Alert } from '@/types';
import { getAlertById, MOCK_ALERTS } from '@/mocks/alerts';
import { resolveMock } from '@/api/client';

export interface AlertQuery {
  branch?: 'inside-forest' | 'outside-forest';
  status?: string;
  priority?: string;
  region?: string;
  search?: string;
}

// TODO(backend): GET /api/alerts
export async function listAlerts(query: AlertQuery = {}): Promise<Alert[]> {
  let items = [...MOCK_ALERTS];
  if (query.branch) items = items.filter((a) => a.branch === query.branch);
  if (query.status) items = items.filter((a) => a.status === query.status);
  if (query.priority) items = items.filter((a) => a.priority === query.priority);
  if (query.region) items = items.filter((a) => a.region === query.region);
  if (query.search) {
    const s = query.search.toLowerCase();
    items = items.filter((a) => a.alertId.toLowerCase().includes(s) || a.polygonId.toLowerCase().includes(s));
  }
  return resolveMock(items);
}

// TODO(backend): GET /api/alerts/:id
export async function getAlert(id: string): Promise<Alert | undefined> {
  return resolveMock(getAlertById(id));
}

// TODO(backend): PATCH /api/alerts/:id  { status }
export async function updateAlertStatus(id: string, status: Alert['status']): Promise<Alert | undefined> {
  const alert = getAlertById(id);
  if (alert) alert.status = status;
  return resolveMock(alert);
}
