'use client';

import { Separator } from '@heroui/react';
import SideBar from './_components/side-bar';
import { INavItem } from './_components/side-bar';
import { usePathname } from 'next/navigation';
import UserStoreProvider from '@/stores/user/provider';
import ContentHeader from './_components/content-header';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const enum PATH_KEY {
  RESUMES = 'resumes',
  SECTIONS = 'sections',
  SETTINGS = 'settings',
}

const PREFIX = '/dashboard';

const navItems: INavItem[] = [
  {
    name: '简历管理',
    key: PATH_KEY.RESUMES,
    path: `${PREFIX}/${PATH_KEY.RESUMES}`,
  },
  {
    name: '模板管理',
    key: PATH_KEY.SECTIONS,
    path: `${PREFIX}/${PATH_KEY.SECTIONS}`,
  },
  {
    name: '设置',
    key: PATH_KEY.SETTINGS,
    path: `${PREFIX}/${PATH_KEY.SETTINGS}`,
  },
];

export const navItemMap = navItems.reduce<Record<string, INavItem>>(
  (res, item) => ({
    ...res,
    [item.key]: item,
  }),
  {},
);

interface IProps {
  children: React.ReactNode;
}
export default function DashBoardLayout(props: IProps) {
  const pathname = usePathname();
  const activeKey = pathname.split('/')[2];
  const { children } = props;
  return (
    <QueryClientProvider client={queryClient}>
      <UserStoreProvider>
        <div className="flex h-lvh min-h-0 overflow-hidden">
          <SideBar navItems={navItems} activeKey={activeKey} />
          <Separator orientation="vertical" className="shrink-0" />
          <main className="min-h-0 flex-1 overflow-y-auto px-4">
            <ContentHeader activeKey={activeKey} />
            <section>{children}</section>
          </main>
        </div>
      </UserStoreProvider>
    </QueryClientProvider>
  );
}
