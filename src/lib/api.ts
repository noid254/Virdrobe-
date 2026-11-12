/** Tiny fetch wrapper: JSON in/out, cookies included, throws Error(message) on failure. */
export async function api<T = any>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: options.method || (options.body !== undefined ? 'POST' : 'GET'),
    headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'same-origin',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || !json || json.success === false) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json.data as T;
}

export const money = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;
export const pct = (rate: number) => `${Math.round(rate * 1000) / 10}%`;
