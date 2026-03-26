import { useContext } from 'react';
import { TUserStore } from './types';
import { UserStoreContext } from './provider';
import { useStore } from 'zustand';

export const useUserStore = <T>(selector: (store: TUserStore) => T): T => {
  const context = useContext(UserStoreContext);

  if (!UserStoreContext) {
    throw new Error(`useUserStore must be used within UserStoreProvider`);
  }

  return useStore(context!, selector);
};
