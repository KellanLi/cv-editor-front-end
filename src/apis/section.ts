import { post } from '@/lib/request';
import { TCreate } from '@/types/api/section/create';
import { TList, TListRes } from '@/types/api/section/list';
import { TContentTemplate } from '@/types/business/content-template';

export function create(params: TCreate) {
  return post<TContentTemplate>('/content-template/create', params);
}

export function list(params: TList) {
  return post<TListRes>('/content-template/list', params);
}
