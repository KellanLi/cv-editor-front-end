import type { TContentTemplateInfoLayerInput } from './create';

export type TContentTemplateUpdateReq = {
  id: number;
  name: string;
  infoTemplates: TContentTemplateInfoLayerInput[];
};
