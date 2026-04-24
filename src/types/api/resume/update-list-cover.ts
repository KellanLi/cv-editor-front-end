/**
 * 与 `UpdateResumeListCoverDto` 一致：`listCoverImageUrl` 传 `null` 表示清空，须与 `id` 同传。
 */
export type TResumeUpdateListCoverReq = {
  id: number;
  listCoverImageUrl: string | null;
};
