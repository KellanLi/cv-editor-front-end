import { post } from '@/lib/request';
import type { TResumeCreateReq } from '@/types/api/resume/create';
import type { TResumeDeleteReq } from '@/types/api/resume/delete';
import type { TResumeDetailReq } from '@/types/api/resume/detail';
import type { TResumeListReq, TResumeListRes } from '@/types/api/resume/list';
import type { TResumeUpdateProfileReq } from '@/types/api/resume/update-profile';
import type { TResumeUpdateTitleReq } from '@/types/api/resume/update-title';
import type { TResume } from '@/types/business/resume';

export function list(params: TResumeListReq) {
  return post<TResumeListRes>('/resume/list', params);
}

export function detail(params: TResumeDetailReq) {
  return post<TResume>('/resume/detail', params);
}

export function create(params: TResumeCreateReq) {
  return post<TResume>('/resume/create', params);
}

/** 删除简历（`delete` 为保留字，故用 `remove`） */
export function remove(params: TResumeDeleteReq) {
  return post<TResume>('/resume/delete', params);
}

export function updateTitle(params: TResumeUpdateTitleReq) {
  return post<TResume>('/resume/update-title', params);
}

export function updateProfile(params: TResumeUpdateProfileReq) {
  return post<TResume>('/resume/update-profile', params);
}
