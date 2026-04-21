import { get, post } from '@/lib/request';
import { TUser } from '@/types/business/user';

/** GET：文档未给出 schema，按与详情一致的用户结构使用 */
export function userProfile() {
  return get<TUser>('/user/profile', {});
}

export function userDetail() {
  return post<TUser>('/user/detail');
}
