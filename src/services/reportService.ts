const API_BASE = (import.meta.env.VITE_BACKEND_URL + '');

export interface ReportJob {
  id: string;
  name: string;
  format: 'PDF' | 'CSV' | 'GeoJSON';
  status: 'Queued' | 'Generating' | 'Ready';
  requestedAt: string;
}

export async function listReports(): Promise<ReportJob[]> {
  return [];
}

export async function requestReport(
  name: string,
  format: ReportJob['format']
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/reports/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: name,
      format,
    }),
  });

  if (!response.ok) {
    let message = 'Export failed.';

    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const contentDisposition =
    response.headers.get('Content-Disposition');

  let filename = `${name}.${format.toLowerCase()}`;

  const match = contentDisposition?.match(
    /filename="?([^"]+)"?/i
  );

  if (match?.[1]) {
    filename = match[1];
  }

  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
}