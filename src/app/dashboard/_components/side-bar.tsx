import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { LogOut } from 'lucide-react';

export interface INavItem {
  name: string;
  path: string;
  icon?: ReactNode;
  key: string;
}

interface IProps {
  navItems: INavItem[];
  activeKey: string;
}

export default function SideBar(props: IProps) {
  const { navItems, activeKey } = props;
  const router = useRouter();

  return (
    <aside className="flex w-64 flex-col px-8">
      <section className="flex h-16 items-center justify-center">
        <h1 className="text-2xl font-bold">Chat Resume</h1>
      </section>
      <section className="flex flex-col gap-y-1">
        {navItems.map(({ path, name, icon, key }) => (
          <Button
            key={key}
            variant={key === activeKey ? 'tertiary' : 'ghost'}
            className="w-auto justify-start"
            onClick={() => {
              router.push(path);
            }}
          >
            {icon && <span>{icon}</span>}
            {name}
          </Button>
        ))}
      </section>
      <section className="mt-auto mb-4">
        <Button className="w-full justify-start" variant="ghost">
          <LogOut size={18} />
          <span>登出</span>
        </Button>
      </section>
    </aside>
  );
}
