import type { TInfoTemplate } from './info-template';

/** 与接口文档 `ContentTemplateDto` 字段一致 */
export type TContentTemplate = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  infoTemplates: TInfoTemplate[];
};
