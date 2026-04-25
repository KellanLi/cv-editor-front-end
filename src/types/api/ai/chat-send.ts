import type {
  TAiConversationPurpose,
  TAiMessage,
} from '@/types/business/ai-conversation';

export type TSendAiChatReq = {
  resumeId: number;
  userMessage: string;
  conversationId?: number;
  purpose?: TAiConversationPurpose;
  selectedSectionIds?: number[];
  enableWebSearch?: boolean;
};

export type TSendAiChatRes = {
  conversationId: number;
  threadId: string;
  selectedSectionIds?: number[];
  userMessage: TAiMessage;
  assistantMessage: TAiMessage;
};
