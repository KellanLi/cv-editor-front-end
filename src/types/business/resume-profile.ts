/** 与接口文档 `ResumeProfileTableDto` 字段一致 */
export type TResumeProfile = {
  id: number;
  resumeId: number;
  photoUrl?: string;
  fullName?: string;
  /** ISO date-time 字符串 */
  birthDate?: string;
  /** 性别（设计稿必填；若接口暂未返回该字段，前端仍可编辑并随 update-profile 提交） */
  gender?: string;
  targetPosition?: string;
  email?: string;
  phone?: string;
  profileExtra?: string[];
};
