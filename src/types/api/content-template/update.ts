import type { TInfoTemplate } from '@/types/business/info-template';

export type TContentTemplateUpdateReq = {
  id: number;
  name: string;
  type: string;
  infoTemplates: TInfoTemplate[];
};
