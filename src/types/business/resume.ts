import type { TResumeProfile } from './resume-profile';
import type { TSection } from './section';

/** 与接口文档 `ResumeDto` 字段一致 */
export type TResume = {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** 列表/卡片等场景用封面；与 `ResumeDto.listCoverImageUrl` 一致 */
  listCoverImageUrl?: string;
  /** 职位描述（JD）全文；该简历下 AI 对话复用；与 `ResumeDto.jobDescriptionText` 一致 */
  jobDescriptionText?: unknown | null;
  profile?: TResumeProfile;
  /** `resume/detail` 可能不返回；请用 `section/list` 拉取后单独缓存 */
  sections?: TSection[];
};
