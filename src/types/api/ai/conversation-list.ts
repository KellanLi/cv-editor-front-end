import type {
  TAiConversation,
  TAiConversationPurpose,
} from '@/types/business/ai-conversation';
import type { IPagination } from '@/types/api/pagination';

export type TAiConversationListFilter = {
  resumeId: number;
  status?: string;
  purpose?: TAiConversationPurpose;
};

export type TAiConversationListReq = {
  filter: TAiConversationListFilter;
  pagination: IPagination;
};

export type TAiConversationListRes = {
  list: TAiConversation[];
  pagination: IPagination;
};
