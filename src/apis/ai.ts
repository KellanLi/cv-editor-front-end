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

/**
 * 取原始 `Response`（`text/event-stream`）自行读流。多数场景用 {@link streamAiChat}（`@/lib/ai/stream-chat`）解析 `writeSse` 帧。
 */
export function streamChat(params: TSendAiChatReq) {
  return postSse('/ai/chat/stream', params);
}
