import type { TSection } from '@/types/business/section';
import type { IPagination } from '../pagination';

export type TSectionListFilter = {
  resumeId: number;
};

export type TSectionListReq = {
  filter: TSectionListFilter;
  pagination: IPagination;
};

export type TSectionListRes = {
  list: TSection[];
  pagination: IPagination;
};
