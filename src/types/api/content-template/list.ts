import type { TContentTemplate } from '@/types/business/content-template';
import type { IPagination } from '../pagination';

export type TContentTemplateListFilter = {
  name: string;
};

export type TContentTemplateListReq = {
  filter: TContentTemplateListFilter;
  pagination: IPagination;
};

export type TContentTemplateListRes = {
  list: TContentTemplate[];
  pagination: IPagination;
};
