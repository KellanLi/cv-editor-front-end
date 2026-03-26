import { Avatar, Spinner } from '@heroui/react';
import { navItemMap } from '../layout';
import { useUserStore } from '@/stores/user/hook';

interface IProps {
  activeKey: string;
}
export default function ContentHeader(props: IProps) {
  const { activeKey } = props;
  const { loading, user } = useUserStore((state) => state);
  const { name, email } = user ?? {};
  return (
    <section className="flex h-16 items-center">
      <h1 className="text-xl font-bold">{navItemMap[activeKey].name}</h1>
      <section className="ml-auto flex items-center justify-center gap-2">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Avatar>
              <Avatar.Fallback>{name?.[0]}</Avatar.Fallback>
            </Avatar>
            <section>
              <div className="text-sm font-medium">{name}</div>
              <div className="text-muted text-xs leading-tight">{email}</div>
            </section>
          </>
        )}
      </section>
    </section>
  );
}
