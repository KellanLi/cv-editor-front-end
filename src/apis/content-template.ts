import { post } from '@/lib/request';
import type { TContentTemplateCreateReq } from '@/types/api/content-template/create';
import type { TContentTemplateDeleteReq } from '@/types/api/content-template/delete';
import type { TContentTemplate } from '@/types/business/content-template';
import type {
  TContentTemplateListReq,
  TContentTemplateListRes,
} from '@/types/api/content-template/list';
import type { TContentTemplateUpdateReq } from '@/types/api/content-template/update';

export function list(params: TContentTemplateListReq) {
  return post<TContentTemplateListRes>('/content-template/list', params);
}

export function create(params: TContentTemplateCreateReq) {
  return post<TContentTemplate>('/content-template/create', params);
}

export function update(params: TContentTemplateUpdateReq) {
  return post<TContentTemplate>('/content-template/update', params);
}

/** 删除模块（`delete` 为保留字，故用 `remove`） */
export function remove(params: TContentTemplateDeleteReq) {
  return post<TContentTemplate>('/content-template/delete', params);
}
