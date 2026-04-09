import { TContentTemplate } from '@/types/business/content-template';
import { TInfoTemplate } from '@/types/business/info-template';
import { IPagination } from '../pagination';

export type TContentTemplateItem = TContentTemplate & {
  infoTemplates: TInfoTemplate[];
};

export type TList = {
  filter: {
    name?: string;
  };
  pagination: IPagination;
};

export type TListRes = {
  list: TContentTemplateItem[];
  pagination: IPagination;
};
