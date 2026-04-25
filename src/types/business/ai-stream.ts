/**
 * 与后端 `AiChatStreamEventDto` 及 `writeSse` 帧内 `data` JSON 一致。
 * 常见 `phase`：`message`（`deltaText`）、`meta`（`payload`）、`done`、`error`。
 */
export type TAiChatStreamEvent = {
  phase: string;
  deltaText?: string;
  payload?: unknown;
};
