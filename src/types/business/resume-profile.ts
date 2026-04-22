/** 与接口文档 `ResumeProfileTableDto` 字段一致 */
export type TResumeProfile = {
  id: number;
  resumeId: number;
  photoUrl?: string;
  fullName?: string;
  /** ISO date-time 字符串 */
  birthDate?: string;
  targetPosition?: string;
  email?: string;
  phone?: string;
  profileExtra?: string[];
};
