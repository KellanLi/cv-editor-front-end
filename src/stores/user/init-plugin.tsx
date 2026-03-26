import { useEffect } from 'react';
import { useUserStore } from './hook';

export default function InitPlugin() {
  const fetchUser = useUserStore((state) => state.fetchUser);
  useEffect(() => {
    (async () => {
      await fetchUser();
    })();
  }, [fetchUser]);
  return null;
}
