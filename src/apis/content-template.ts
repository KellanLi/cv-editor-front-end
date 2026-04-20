import { post } from '@/lib/request';
import type { TContentTemplateCreateReq } from '@/types/api/content-template/create';
import type { TContentTemplateDeleteReq } from '@/types/api/content-template/delete';
import type { TContentTemplateDto } from '@/types/api/content-template/dto';
import type {
  TContentTemplateListReq,
  TContentTemplateListRes,
} from '@/types/api/content-template/list';
import type { TContentTemplateUpdateReq } from '@/types/api/content-template/update';

export function list(params: TContentTemplateListReq) {
  return post<TContentTemplateListRes>('/content-template/list', params);
}

export function create(params: TContentTemplateCreateReq) {
  return post<TContentTemplateDto>('/content-template/create', params);
}

export function update(params: TContentTemplateUpdateReq) {
  return post<TContentTemplateDto>('/content-template/update', params);
}

/** 删除模块（`delete` 为保留字，故用 `remove`） */
export function remove(params: TContentTemplateDeleteReq) {
  return post<TContentTemplateDto>('/content-template/delete', params);
}
