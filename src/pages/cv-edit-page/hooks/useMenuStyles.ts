import type { MenuProps } from 'antd';

const iconSize = 24;

export const useMenuStyles = () => {
  const styles: MenuProps['styles'] = {
    root: {
      borderRight: 'none',
    },
  };

  return styles;
};
