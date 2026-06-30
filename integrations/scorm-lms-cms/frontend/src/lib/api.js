// Lightweight fetch wrapper with JWT handling.

const TOKEN_KEY = 'lea_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('lea_user');
}
export function getStoredUser() {
  const raw = localStorage.getItem('lea_user');
  return raw ? JSON.parse(raw) : null;
}
export function setStoredUser(u) {
  localStorage.setItem('lea_user', JSON.stringify(u));
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    if (!path.startsWith('/auth')) window.location.href = '/login';
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.error || (data?.errors ? JSON.stringify(data.errors) : 'Request failed');
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
};
