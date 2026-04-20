import type { TInfoTemplate } from '@/types/business/info-template';

export type TContentTemplateCreateReq = {
  name: string;
  infoTemplates: TInfoTemplate[];
};
