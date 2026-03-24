import { BaseResponse } from "../base-responese";
import { TUser } from "./user";

export type TRegister = {
  email: string;
  password: string;
  name: string;
}

export type TRegisterRes = BaseResponse<TUser>