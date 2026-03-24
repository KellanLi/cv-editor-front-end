import { STORAGE_KEY } from "./const";
import { IToken } from "./types";

const storage = {
  setToken: (param: IToken) => {
    localStorage.setItem(STORAGE_KEY.TOKEN, JSON.stringify(param));
  },
  getToken: (): IToken | null=> {
    const jsonStr = localStorage.getItem(STORAGE_KEY.TOKEN);
    return jsonStr ? JSON.parse(jsonStr) : null;
  },
}

export default storage;