import storage from '@/lib/storage';
import type { TSendAiChatReq } from '@/types/api/ai/chat-send';
import type { TAiChatStreamEvent } from '@/types/business/ai-stream';

const API_V1 = '/api/v1';

const defaultHeaders = (
  accessToken: string | undefined,
): Record<string, string> => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  const token = accessToken ?? storage.getToken()?.value;
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
};

/** 与后端 `writeSse` 一致：若干 `event:` / `data:` 行，帧间以空行（`\n\n`）结束 */
export function parseSseChunk(buffer: string): {
  events: Array<{ event: string; data: TAiChatStreamEvent }>;
  rest: string;
} {
  const events: Array<{ event: string; data: TAiChatStreamEvent }> = [];
  let pos = 0;
  while (pos < buffer.length) {
    const end = buffer.indexOf('\n\n', pos);
    if (end === -1) break;
    const frame = buffer.slice(pos, end);
    pos = end + 2;

    let eventName = 'message';
    let dataLine = '';
    for (const line of frame.split('\n')) {
      if (line.startsWith('event: ')) {
        eventName = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        dataLine = line.slice(6);
      }
    }
    if (dataLine) {
      try {
        const data = JSON.parse(dataLine) as TAiChatStreamEvent;
        events.push({ event: eventName, data });
      } catch {
        // 忽略损坏帧
      }
    }
  }
  return { events, rest: buffer.slice(pos) };
}

/**
 * 消费 `/api/v1/ai/chat/stream` 的 SSE：鉴权与 {@link TSendAiChatReq} 与 `sendChat` 相同。
 * 可传入 `accessToken` 覆盖；否则用本地 storage 内 token（与 `post` 一致）。
 */
export async function streamAiChat(
  body: TSendAiChatReq,
  onEvent: (ev: { event: string; data: TAiChatStreamEvent }) => void,
  options?: { signal?: AbortSignal; accessToken?: string; basePath?: string },
): Promise<void> {
  const path = `${options?.basePath ?? API_V1}/ai/chat/stream`;
  const res = await fetch(path, {
    method: 'POST',
    headers: defaultHeaders(options?.accessToken),
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`stream failed: ${res.status} ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let carry = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (value) {
      carry += decoder.decode(value, { stream: true });
    }
    const { events, rest } = parseSseChunk(carry);
    carry = rest;
    for (const e of events) {
      onEvent(e);
    }
    if (done) break;
  }
}
