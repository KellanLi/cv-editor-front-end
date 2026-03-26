import { TUser } from '@/types/business/user';
import { ReactNode } from 'react';
import { createUserStore } from './store';

export type TUserState = {
  loading: boolean;
  user?: TUser | null;
};

export type TUserAction = {
  fetchUser: () => Promise<void>;
};

export type TUserStore = TUserState & TUserAction;

export interface IProviderProps {
  children: ReactNode;
}

export type TUserStoreApi = ReturnType<typeof createUserStore>;
