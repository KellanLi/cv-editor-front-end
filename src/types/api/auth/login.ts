import { BaseResponse } from "../base-responese";
import { TToken } from "./token";
import { TUser } from "./user";

export type TLogin = {
  email: string;
  password: string;
}

export type TLoginRes = BaseResponse<{
  user: TUser;
  token: TToken;
}>