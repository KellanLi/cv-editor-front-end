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
  sections: TSection[];
};
