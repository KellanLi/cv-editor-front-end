/** 更新模块内容：单条信息层（`values` 与 `TInfo` 一致，为 `string[]`） */
export type TUpdateSectionContentInfoReq = {
  order: number;
  type: string;
  values: string[];
};

/** 更新模块内容：单条内容及其信息层 */
export type TUpdateSectionContentItemReq = {
  order: number;
  infos: TUpdateSectionContentInfoReq[];
};

/** 更新模块内容：请求体 */
export type TUpdateSectionContentReq = {
  sectionId: number;
  contents: TUpdateSectionContentItemReq[];
};
