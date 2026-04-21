import { post } from '@/lib/request';
import type { TLogin, TLoginRes } from '@/types/api/auth/login';
import type { TRegister, TRegisterRes } from '@/types/api/auth/register';

export function login(params: TLogin) {
  return post<TLoginRes>('/auth/login', params);
}

export function register(params: TRegister) {
  return post<TRegisterRes>('/auth/register', params);
}