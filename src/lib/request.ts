import storage from "./storage";

const BASE_URL = "/api/v1";

export async function request<T = unknown>(url: string, options: RequestInit = {}): Promise<T>{
  const token = storage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token.token}` } : {}),
  };

  const res = await fetch(BASE_URL + url, { ...options, headers });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return await res.json();
}
export async function get<T = unknown, D extends Record<string, string | number | boolean> = Record<string, string | number | boolean>>(url: string, param: D, options: RequestInit = {}): Promise<T> {
  const handledParam = Object.entries(param).reduce((acc, [key, value]) => {
    acc[key] = typeof value === "string" ? value : JSON.stringify(value);
    return acc;
  }, {} as Record<string, string>);
  const query = new URLSearchParams(handledParam);
  url += `?${query.toString()}`;
  return request(url, { ...options, method: "GET" });
}

export async function post<T = unknown, D = unknown>(url: string, data: D, options: RequestInit = {}): Promise<T> {
  return request(url, { ...options, method: "POST", body: JSON.stringify(data) });
}