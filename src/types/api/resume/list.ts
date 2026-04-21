import type { TResume } from '@/types/business/resume';
import type { IPagination } from '../pagination';

export type TResumeListFilter = {
  title: string;
};

export type TResumeListReq = {
  filter: TResumeListFilter;
  pagination: IPagination;
};

export type TResumeListRes = {
  list: TResume[];
  pagination: IPagination;
};
