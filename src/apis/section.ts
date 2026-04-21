import { post } from '@/lib/request';
import type { TSectionCreateReq } from '@/types/api/section/create';
import type { TSectionDeleteReq } from '@/types/api/section/delete';
import type { TSection } from '@/types/business/section';
import type { TSectionListReq, TSectionListRes } from '@/types/api/section/list';
import type { TUpdateSectionContentReq } from '@/types/api/section/update-content';

export function list(params: TSectionListReq) {
  return post<TSectionListRes>('/section/list', params);
}

export function create(params: TSectionCreateReq) {
  return post<TSection>('/section/create', params);
}

/** 删除模块（`delete` 为保留字，故用 `remove`） */
export function remove(params: TSectionDeleteReq) {
  return post<TSection>('/section/delete', params);
}

export function updateContent(params: TUpdateSectionContentReq) {
  return post<TSection>('/section/update-content', params);
}
