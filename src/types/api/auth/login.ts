import { TToken } from '../../business/token';
import { TUser } from '../../business/user';

export type TLogin = {
  email: string;
  password: string;
};

export type TLoginRes = {
  user: TUser;
  token: TToken;
};
