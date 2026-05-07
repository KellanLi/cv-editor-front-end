import { post, postSse } from '@/lib/request';
import type { TSendAiChatReq, TSendAiChatRes } from '@/types/api/ai/chat-send';
import type { TAiConversationCreateReq } from '@/types/api/ai/conversation-create';
import type { TAiConversationDeleteReq } from '@/types/api/ai/conversation-delete';
import type { TAiConversationGetReq } from '@/types/api/ai/conversation-get';
import type {
  TAiConversationListReq,
  TAiConversationListRes,
} from '@/types/api/ai/conversation-list';
import type { TAiConversationUpdateReq } from '@/types/api/ai/conversation-update';
import type { TAiGlobalContextDeleteReq } from '@/types/api/ai/global-context-delete';
import type {
  TAiGlobalContextListReq,
  TAiGlobalContextListRes,
} from '@/types/api/ai/global-context-list';
import type { TAiGlobalContextUpsertReq } from '@/types/api/ai/global-context-upsert';
import type { TAiMessageListReq, TAiMessageListRes } from '@/types/api/ai/message-list';
import type {
  TAiResumeDiagnoseReq,
  TAiResumeDiagnoseRes,
} from '@/types/api/ai/resume-diagnose';
import type {
  TAiResumeDiagnoseStartReq,
  TAiResumeDiagnoseStartRes,
} from '@/types/api/ai/resume-diagnose-start';
import type {
  TAiResumeDiagnoseStatusReq,
  TAiResumeDiagnoseStatusRes,
} from '@/types/api/ai/resume-diagnose-status';
import type { TAiConversation } from '@/types/business/ai-conversation';
import type { TAiGlobalContext } from '@/types/business/ai-global-context';

export function listConversations(params: TAiConversationListReq) {
  return post<TAiConversationListRes>('/ai/conversation/list', params);
}

export function createConversation(params: TAiConversationCreateReq) {
  return post<TAiConversation>('/ai/conversation/create', params);
}

export function getConversation(params: TAiConversationGetReq) {
  return post<TAiConversation>('/ai/conversation/get', params);
}

export function updateConversation(params: TAiConversationUpdateReq) {
  return post<TAiConversation>('/ai/conversation/update', params);
}

/** 删除对话线程（级联消息与工具记录；`delete` 为保留字，故用 `remove`） */
export function removeConversation(params: TAiConversationDeleteReq) {
  return post<TAiConversation>('/ai/conversation/delete', params);
}

export function listMessages(params: TAiMessageListReq) {
  return post<TAiMessageListRes>('/ai/message/list', params);
}

export function listGlobalContexts(params: TAiGlobalContextListReq) {
  return post<TAiGlobalContextListRes>('/ai/global-context/list', params);
}

export function upsertGlobalContext(params: TAiGlobalContextUpsertReq) {
  return post<TAiGlobalContext>('/ai/global-context/upsert', params);
}

export function removeGlobalContext(params: TAiGlobalContextDeleteReq) {
  return post<TAiGlobalContext>('/ai/global-context/delete', params);
}

export function sendChat(params: TSendAiChatReq) {
  return post<TSendAiChatRes>('/ai/chat/send', params);
}

/** 简历 AI 诊断（同步）：JD → 编写思路 → 评价维度 → 打分 → 分块与整体建议 */
export function diagnoseResume(params: TAiResumeDiagnoseReq) {
  return post<TAiResumeDiagnoseRes>('/ai/resume/diagnose', params);
}

/** 发起简历 AI 诊断异步任务，返回可恢复的 `taskId`。 */
export function startResumeDiagnoseTask(params: TAiResumeDiagnoseStartReq) {
  return post<TAiResumeDiagnoseStartRes>('/ai/resume/diagnose/start', params);
}

/** 查询简历 AI 诊断异步任务状态与结果。 */
export function getResumeDiagnoseTaskStatus(params: TAiResumeDiagnoseStatusReq) {
  return post<TAiResumeDiagnoseStatusRes>('/ai/resume/diagnose/status', params);
}

/**
 * 取原始 `Response`（`text/event-stream`）自行读流。多数场景用 {@link streamAiChat}（`@/lib/ai/stream-chat`）解析 `writeSse` 帧。
 */
export function streamChat(params: TSendAiChatReq) {
  return postSse('/ai/chat/stream', params);
}
