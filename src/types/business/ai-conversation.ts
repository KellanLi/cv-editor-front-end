export type TAiConversationPurpose =
  | 'BASIC_QA'
  | 'DIALOGUE_EDIT'
  | 'RESUME_DIAGNOSIS';

export type TAiMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type TAiToolCall = {
  id: number;
  messageId: number;
  name: string;
  input: Record<string, unknown>;
  status: string;
  idempotencyKey?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  error?: Record<string, unknown> | null;
  externalId?: Record<string, unknown> | null;
  startedAt?: Record<string, unknown> | null;
  endedAt?: Record<string, unknown> | null;
};

export type TAiMessage = {
  id: number;
  conversationId: number;
  seq: number;
  role: TAiMessageRole;
  createdAt: string;
  /** 主展示文本，与存库/接口一致为普通字符串；历史上若曾返回 object 仍可在展示层做兼容。 */
  text?: string | null;
  contentJson?: unknown;
  providerMeta?: unknown;
  toolCalls?: TAiToolCall[];
};

export type TAiConversation = {
  id: number;
  resumeId: number;
  purpose: TAiConversationPurpose;
  threadId: string;
  title: string | null;
  status: string;
  lastMsgAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: TAiMessage[];
};
