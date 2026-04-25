import type { TAiMessage } from '@/types/business/ai-conversation';
import type { IPagination } from '@/types/api/pagination';

export type TAiMessageListFilter = {
  conversationId: number;
};

export type TAiMessageListReq = {
  filter: TAiMessageListFilter;
  pagination: IPagination;
};

export type TAiMessageListRes = {
  list: TAiMessage[];
  pagination: IPagination;
};
