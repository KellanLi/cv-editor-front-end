import type { TResumeProfile } from '@/types/business/resume-profile';

/**
 * 更新简历个人信息。
 * `id` 为简历 ID（非 `ResumeProfile` 主键），其余字段均为可选的覆盖项。
 */
export type TResumeUpdateProfileReq = {
  id: number;
} & Partial<Omit<TResumeProfile, 'id' | 'resumeId'>>;
