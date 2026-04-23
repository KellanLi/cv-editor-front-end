'use client';

import UserStoreProvider from '@/stores/user/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface IProps {
  children: React.ReactNode;
}

export default function BuilderLayout(props: IProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { children } = props;
  return (
    <QueryClientProvider client={queryClient}>
      <UserStoreProvider>{children}</UserStoreProvider>
    </QueryClientProvider>
  );
}
