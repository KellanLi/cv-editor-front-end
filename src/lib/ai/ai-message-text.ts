import type { TAiMessage, TAiMessageRole } from '@/types/business/ai-conversation';

const ROLE_FOR_DISPLAY: ReadonlySet<TAiMessageRole> = new Set([
  'user',
  'assistant',
]);

/**
 * 与后端 `AiMessageTableDto.text` 一致：主展示为 **string | null**。
 * 无正文时再尝试 `contentJson`（如 ProseMirror `doc`）。
 * 运行期若仍为 object（旧数据），走 `readLegacyTextObject`。
 */
export function getAiMessageDisplayText(m: TAiMessage): string {
  const t: unknown = m.text;
  if (typeof t === 'string') return t;
  if (t != null && typeof t === 'object' && !Array.isArray(t)) {
    const legacy = readLegacyTextObject(t as Record<string, unknown>);
    if (legacy) return legacy;
  }
  if (m.contentJson != null && typeof m.contentJson === 'object') {
    if (isPmLike(m.contentJson)) {
      return collectProseText(
        (m.contentJson as { content: unknown[] }).content,
      );
    }
    return readLegacyTextObject(m.contentJson as Record<string, unknown>);
  }
  return '';
}

/**
 * 兼容旧版或误把 `text` 记成 object 的 payload：只认明文字段，不做全对象深扫。
 */
function readLegacyTextObject(t: Record<string, unknown> | null | undefined) {
  if (t == null) return '';
  for (const k of ['text', 'plain', 'content', 'body', 'value', 'message'] as const) {
    const v = t[k];
    if (typeof v === 'string' && v.length) return v;
  }
  if (t['type'] === 'doc' && isPmContent((t as { content?: unknown }).content)) {
    return collectProseText((t as { content: unknown[] }).content);
  }
  return '';
}

function isPmContent(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

function isPmLike(
  t: unknown,
): t is { type?: string; content: unknown[] } {
  if (t == null || typeof t !== 'object' || !('content' in t)) return false;
  return isPmContent((t as { content: unknown }).content);
}

function collectProseText(nodes: unknown, depth = 0): string {
  if (depth > 32 || !Array.isArray(nodes)) return '';
  const out: string[] = [];
  for (const n of nodes) {
    if (n != null && typeof n === 'object') {
      const o = n as { text?: string; content?: unknown[] };
      if (typeof o.text === 'string') {
        out.push(o.text);
      } else if (isPmContent(o.content)) {
        out.push(collectProseText(o.content, depth + 1));
      }
    }
  }
  return out.join('');
}

/**
 * 将接口返回的消息列表转为对话气泡数据（升序、仅 user/assistant，id 使用 `srv-${id}`）。
 */
export function toChatLinesFromServerMessages(msgs: TAiMessage[]) {
  const list = [...msgs]
    .filter((m) => ROLE_FOR_DISPLAY.has(m.role))
    .sort((a, b) => a.seq - b.seq);
  return list.map((m) => {
    const text = getAiMessageDisplayText(m);
    return {
      id: `srv-${m.id}`,
      role: m.role as 'user' | 'assistant',
      text,
    };
  });
}
