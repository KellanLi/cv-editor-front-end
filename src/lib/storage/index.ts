import { STORAGE_KEY } from './const';
import { TToken } from '@/types/business/token';

const storage = {
  setToken: (param: TToken) => {
    localStorage.setItem(STORAGE_KEY.TOKEN, JSON.stringify(param));
  },
  getToken: (): TToken | null => {
    const jsonStr = localStorage.getItem(STORAGE_KEY.TOKEN);
    return jsonStr ? JSON.parse(jsonStr) : null;
  },
};

export default storage;
