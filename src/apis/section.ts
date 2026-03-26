import { post } from '@/lib/request';
import { TCreate } from '@/types/api/section/create';
import { TContentTemplate } from '@/types/business/content-template';

export function create(params: TCreate) {
  return post<TContentTemplate>('/content-template/create', params);
}
