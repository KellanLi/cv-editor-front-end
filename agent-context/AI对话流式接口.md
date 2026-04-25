# AI 对话流式接口（`/api/v1/ai/chat/stream`）

与后端 `writeSse` 行为一致：每个 SSE **帧**由若干以 `\n` 结尾的行组成，**帧之间以空行 `\n\n` 结束**。典型行包括：

- `event: <name>`（可省略，解析时未出现则按 `message` 处理）
- `data: <单条 JSON 字符串>`，反序列化后为 `AiChatStreamEventDto`（前端类型名 `TAiChatStreamEvent`）

`data` 内通过 **`phase`** 区分子类型，常见值：

| `phase` | 含义 | 常见字段 |
|--------|------|----------|
| `message` | 模型增量 | `deltaText` |
| `meta` | 元信息 | `payload`（如 `threadId`、`userMessageId` 等，以后端为准） |
| `done` | 助手落库/流结束 | — |
| `error` | 错误 | 可读 `deltaText` 作提示 |

## 本仓库落点

- 类型：`src/types/business/ai-stream.ts`（`TAiChatStreamEvent`）
- 请求体：与 `sendChat` 相同，`TSendAiChatReq`（`src/types/api/ai/chat-send.ts`）
- 带解析的封装：`streamAiChat`、`parseSseChunk`（`src/lib/ai/stream-chat.ts`）  
  - 使用**相对**路径 `/api/v1/ai/chat/stream` + 与 `post` 相同的 `Authorization: Bearer`（`accessToken` 可显式传入覆盖）
- 仅取 `Response` 自读流：`import { streamChat } from '@/apis/ai'`

## 与后端示例代码的对应关系

示例中的 `import type { AiChatStreamEventDto } from './types/ai'` 对应本仓库的 **`TAiChatStreamEvent`**；`SendAiChatBody` 对应 **`TSendAiChatReq`**。示例里写死 `https://你的后端域名` 的部分，在本项目中由 Next 同源 `fetch` + 相对 `API` 路径替代，无需在浏览器中配置完整域名字符串。
