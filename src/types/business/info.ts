/**
 * 与接口文档 `InfoDto` 字段一致。
 * `values` 在文档中为 JSON；前端与信息层组件约定为 `string[]`。
 */
export type TInfo = {
  id: number;
  contentId: number;
  order: number;
  type: string;
  values: string[];
};
