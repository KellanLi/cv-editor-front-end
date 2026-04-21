import type { TInfoTemplate } from '@/types/business/info-template';

/** 创建/更新请求体中的信息层：仅需维度字段（文档 `InfoTemplateDto` 的子集） */
export type TContentTemplateInfoLayerInput = Pick<
  TInfoTemplate,
  'type' | 'names' | 'order'
>;

export type TContentTemplateCreateReq = {
  name: string;
  infoTemplates: TContentTemplateInfoLayerInput[];
};
