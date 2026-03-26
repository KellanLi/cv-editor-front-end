import { createStore } from 'zustand/vanilla';
import { TUserState, TUserStore } from './types';
import { userDetail } from '@/apis/user';

export const initState: TUserState = {
  user: null,
  loading: false,
};

export const createUserStore = (initialState: TUserState = initState) => {
  return createStore<TUserStore>((set) => {
    return {
      ...initialState,
      fetchUser: async () => {
        set({ loading: true });
        try {
          const res = await userDetail();
          set({ user: res.data });
        } catch (error) {
          console.error(error);
        } finally {
          set({ loading: false });
        }
      },
    };
  });
};
