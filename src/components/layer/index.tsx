import { ContactsOutlined, ContainerOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import { type FC } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import * as styles from './index.module.less';
import PathEnum from '@/router/pathEnum';

const AppLayer: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentMenuKey = location.pathname.split('/')[2];

  const menuItems: MenuProps['items'] = [
    {
      key: 'manage',
      label: '简历管理',
      icon: <ContactsOutlined />,
    },
    {
      key: 'template',
      label: '模板管理',
      icon: <ContainerOutlined />,
    },
  ];

  const onClickMenuItem: MenuProps['onClick'] = ({ key }) => {
    navigate(`${PathEnum.HOME}/${key}`);
  };

  return (
    <div className={styles.appLayer}>
      <div>
        <Menu
          items={menuItems}
          selectedKeys={[currentMenuKey]}
          onClick={onClickMenuItem}
        />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayer;
