/** 更新模块（目前仅支持更新 `order`） */
export type TSectionUpdateReq = {
  id: number;
  /** 同一简历内的展示顺序（升序） */
  order: number;
};
