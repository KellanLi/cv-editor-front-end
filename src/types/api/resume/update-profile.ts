import type { TResumeProfile } from '@/types/business/resume-profile';

/**
 * 将字段变为「可选 + 可显式置空」：传 `null` 表示清空该字段，
 * 不传（`undefined`）则不更新。
 */
type TNullable<T> = {
  [K in keyof T]?: T[K] | null;
};

/**
 * 更新简历个人信息。
 * `id` 为简历 ID（非 `ResumeProfile` 主键）；其余字段可选且允许为 `null`（显式清空）。
 */
export type TResumeUpdateProfileReq = {
  id: number;
} & TNullable<Omit<TResumeProfile, 'id' | 'resumeId'>>;
