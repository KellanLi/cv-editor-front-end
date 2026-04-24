import type { TSection } from '@/types/business/section';

/** 批量调整顺序：单项 */
export type TSectionReorderItem = {
  id: number;
  /** 同一简历内的展示顺序（升序） */
  order: number;
};

/** 批量调整模块顺序（按简历） */
export type TSectionReorderReq = {
  resumeId: number;
  items: TSectionReorderItem[];
};

/** 调整顺序后的模块列表（已按 order 升序） */
export type TSectionReorderRes = {
  list: TSection[];
};
