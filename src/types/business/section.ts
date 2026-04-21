import type { TContent } from './content';

/** 与接口文档 `SectionDto` 字段一致 */
export type TSection = {
  id: number;
  resumeId: number;
  contentTemplateId: number;
  contents: TContent[];
};
