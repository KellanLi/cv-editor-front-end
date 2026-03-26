import { TUser } from '../../business/user';

export type TRegister = {
  email: string;
  password: string;
  name: string;
};

export type TRegisterRes = TUser;
