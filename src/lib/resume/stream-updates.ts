import type { TResumeUpdatedEvent } from '@/types/business/resume-stream';

type TStreamHandlers = {
  onMeta?: (data: unknown) => void;
  onResumeUpdated?: (data: TResumeUpdatedEvent) => void;
  onError?: (err: Error) => void;
};

type TSubscribeResumeUpdatesParams = {
  baseUrl: string;
  token: string;
  resumeId: number;
  handlers: TStreamHandlers;
  signal?: AbortSignal;
};

function parseSseChunk(buffer: string): {
  events: Array<{ event: string; dataText: string }>;
  rest: string;
} {
  const events: Array<{ event: string; dataText: string }> = [];
  let pos = 0;

  while (pos < buffer.length) {
    const end = buffer.indexOf('\n\n', pos);
    if (end === -1) break;

    const frame = buffer.slice(pos, end);
    pos = end + 2;

    const trimmed = frame.trim();
    if (!trimmed || trimmed.startsWith(':')) continue;

    let event = 'message';
    let dataText = '';

    for (const line of frame.split('\n')) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataText += line.slice(5).trim();
      }
    }

    if (dataText) {
      events.push({ event, dataText });
    }
  }

  return { events, rest: buffer.slice(pos) };
}

export async function subscribeResumeUpdates(
  params: TSubscribeResumeUpdatesParams,
): Promise<void> {
  const { baseUrl, token, resumeId, handlers, signal } = params;

  try {
    const res = await fetch(`${baseUrl}/resume/stream-updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resumeId }),
      signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`SSE connect failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let carry = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (value) {
        carry += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      }

      const { events, rest } = parseSseChunk(carry);
      carry = rest;

      for (const eventItem of events) {
        try {
          const data = JSON.parse(eventItem.dataText) as unknown;
          if (eventItem.event === 'meta') {
            handlers.onMeta?.(data);
          } else if (eventItem.event === 'resume.updated') {
            handlers.onResumeUpdated?.(data as TResumeUpdatedEvent);
          }
        } catch {
          // 忽略损坏帧
        }
      }

      if (done) break;
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('SSE stream failed');
    handlers.onError?.(err);
    if (signal?.aborted) return;
    throw err;
  }
}
