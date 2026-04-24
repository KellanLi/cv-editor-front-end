import type { TResumeProfile } from './resume-profile';
import type { TSection } from './section';

/** 与接口文档 `ResumeDto` 字段一致 */
export type TResume = {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  profile?: TResumeProfile;
  /** `resume/detail` 可能不返回；请用 `section/list` 拉取后单独缓存 */
  sections?: TSection[];
};
