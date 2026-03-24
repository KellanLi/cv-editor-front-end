import { post } from "@/lib/request";
import { TLogin, TLoginRes } from "@/types/api/auth/login";
import { TRegister, TRegisterRes } from "@/types/api/auth/register";


export async function login(params: TLogin) {
  return await post<TLoginRes>('/auth/login', params);
}

export async function register(params: TRegister) {
  return await post<TRegisterRes>('/auth/register', params);
}