import { BaseResponse } from '@/types/api/base-response';
import storage from './storage';

const BASE_URL = '/api/v1';

export async function request<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = storage.getToken();
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token.value}` } : {}),
  };

  const requestUrl = BASE_URL + url;
  const res = await fetch(requestUrl, { ...options, headers });

  // 某些运行时/中间层异常情况下可能返回非标准 Response，避免直接读取 `.ok` 崩溃。
  if (res == null || typeof res.ok !== 'boolean') {
    throw new Error('请求失败：未收到有效响应');
  }

  if (!res.ok) {
    throw new Error(res.statusText || `请求失败（${res.status}）`);
  }

  return await res.json();
}
export async function get<
  T = unknown,
  D extends Record<string, string | number | boolean> = Record<
    string,
    string | number | boolean
  >,
>(url: string, param: D, options: RequestInit = {}): Promise<BaseResponse<T>> {
  const handledParam = Object.entries(param).reduce(
    (acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
      return acc;
    },
    {} as Record<string, string>,
  );
  const query = new URLSearchParams(handledParam);
  url += `?${query.toString()}`;
  return request(url, { ...options, method: 'GET' });
}

export async function post<T = unknown, D = unknown>(
  url: string,
  data?: D,
  options: RequestInit = {},
): Promise<BaseResponse<T>> {
  return request(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * 与 `post` 相同鉴权，但不解析 body；用于 SSE 等流式端点（如 `/ai/chat/stream`）。
 */
export async function postSse(
  url: string,
  data?: unknown,
  options: RequestInit = {},
): Promise<Response> {
  const token = storage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token.value}` } : {}),
  };

  const requestUrl = BASE_URL + url;
  const res = await fetch(requestUrl, {
    ...options,
    method: 'POST',
    body: data !== undefined ? JSON.stringify(data) : undefined,
    headers,
  });

  if (res == null || typeof res.ok !== 'boolean') {
    throw new Error('请求失败：未收到有效响应');
  }

  if (!res.ok) {
    throw new Error(res.statusText || `请求失败（${res.status}）`);
  }

  return res;
}
