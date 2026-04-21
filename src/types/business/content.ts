import type { TInfo } from './info';

/** 与接口文档 `ContentDto` 字段一致 */
export type TContent = {
  id: number;
  sectionId: number;
  order: number;
  infos: TInfo[];
};
