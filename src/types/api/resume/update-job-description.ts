export type TResumeUpdateJobDescriptionReq = {
  id: number;
  /** JD 全文；`null` 清空（OpenAPI 为 object，实际以后端为准） */
  jobDescriptionText: unknown | null;
};
