'use client';

import { createContext, useState } from 'react';
import { IProviderProps, TUserStoreApi } from './types';
import { createUserStore } from './store';
import InitPlugin from './init-plugin';

export const UserStoreContext = createContext<TUserStoreApi | undefined>(
  undefined,
);

export default function UserStoreProvider(props: IProviderProps) {
  const { children } = props;
  const [store] = useState(() => createUserStore());

  return (
    <UserStoreContext.Provider value={store}>
      <InitPlugin />
      {children}
    </UserStoreContext.Provider>
  );
}
