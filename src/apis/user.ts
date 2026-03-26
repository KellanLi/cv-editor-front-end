import { post } from '@/lib/request';
import { TUser } from '@/types/business/user';

export function userDetail() {
  return post<TUser>('/user/detail');
}
