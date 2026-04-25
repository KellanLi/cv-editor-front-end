import type { TAiGlobalContext } from '@/types/business/ai-global-context';
import type { IPagination } from '@/types/api/pagination';

export type TAiGlobalContextListFilter = {
  resumeId: number;
};

export type TAiGlobalContextListReq = {
  filter: TAiGlobalContextListFilter;
  pagination: IPagination;
};

export type TAiGlobalContextListRes = {
  list: TAiGlobalContext[];
  pagination: IPagination;
};
