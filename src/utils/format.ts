export function fmtNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtHa(n: number): string {
  return `${fmtNumber(n, n < 100 ? 2 : 1)} ha`;
}

export function fmtPct(n: number, decimals = 1): string {
  // n is expected 0-1
  return `${(n * 100).toFixed(decimals)}%`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function truncateHash(hash: string, lead = 10, trail = 8): string {
  if (hash.length <= lead + trail + 3) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-trail)}`;
}

export function coord(lat: number, lon: number): string {
  return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
