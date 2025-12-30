import { useLocalStorageState } from 'ahooks';
import type {
  LocalTemplateListData,
  TCreateTemplate,
  TemplateItem,
} from './type';
import { LocalStorageKeys } from '@/const/localStorageKeys';
import { useCallback } from 'react';

const useLocalTemplateList = () => {
  const [data, setData] = useLocalStorageState<LocalTemplateListData>(
    LocalStorageKeys.TemplateList,
    {
      defaultValue: {
        data: [],
      },
    },
  );

  const addTemplate = useCallback(
    (template: TCreateTemplate) => {
      const newData = {
        ...template,
        id: crypto.randomUUID(),
      };
      setData({
        data: [...data.data, newData],
      });
    },
    [data, setData],
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      setData({
        data: data.data.filter((item) => item.id !== id),
      });
    },
    [data, setData],
  );

  const updateTemplate = useCallback(
    (template: TemplateItem) => {
      setData({
        data: data.data.map((item) => {
          if (item.id === template.id) {
            return template;
          }
          return item;
        }),
      });
    },
    [data, setData],
  );

  const getTemplateList = useCallback(() => {
    return data.data;
  }, [data]);

  return { addTemplate, deleteTemplate, updateTemplate, getTemplateList };
};

export default useLocalTemplateList;
