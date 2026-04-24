export type TSectionCreateReq = {
  resumeId: number;
  contentTemplateId: number;
  /** 同一简历内的展示顺序（升序） */
  order: number;
};
