// Thin fetch wrapper. The JWT lives in an httpOnly cookie, so every request
// must include credentials; the client never touches the token itself.

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || `Request failed (${res.status})`);
  }
  return data;
}
