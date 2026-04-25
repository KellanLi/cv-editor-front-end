import type { TAiConversationPurpose } from '@/types/business/ai-conversation';

export type TAiConversationCreateReq = {
  resumeId: number;
  purpose?: TAiConversationPurpose;
  title?: string;
};
