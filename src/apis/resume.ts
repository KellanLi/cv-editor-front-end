import { post } from '@/lib/request';
import type { TResumeCreateReq } from '@/types/api/resume/create';
import type { TResumeDeleteReq } from '@/types/api/resume/delete';
import type { TResume } from '@/types/business/resume';
import type { TResumeListReq, TResumeListRes } from '@/types/api/resume/list';

export function list(params: TResumeListReq) {
  return post<TResumeListRes>('/resume/list', params);
}

export function create(params: TResumeCreateReq) {
  return post<TResume>('/resume/create', params);
}

/** 删除简历（`delete` 为保留字，故用 `remove`） */
export function remove(params: TResumeDeleteReq) {
  return post<TResume>('/resume/delete', params);
}
