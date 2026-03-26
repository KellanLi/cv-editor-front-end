import { TInfoTemplate } from '@/types/business/info-template';

export type TCreate = {
  name: string;
  type: string;
  infoTemplates: TInfoTemplate[];
};
