import type { TToken } from './token';
import type { TUser } from './user';

/** 与接口文档 `LoginDataDto` 字段一致 */
export type TLoginData = {
  user: TUser;
  token: TToken;
};
