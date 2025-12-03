import { type FC } from 'react';
import CVPreview from '@/components/cv-preview';
import { CVPreviewProps } from '@/components/cv-preview/types';
import profilePicture from '@/assets/profile-picture.jpg';
import { Flex, Menu, Splitter } from 'antd';
import type { GetProps } from 'antd';
import { componentMap, ComponentType } from '../cv-edit-page/components';
import {
  FileTextOutlined,
  FormatPainterOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useSessionStorageState } from 'ahooks';
import { useNavigate } from 'react-router';

import * as styles from './index.module.less';
import PathEnum from '@/router/pathEnum';

type MenuProps = GetProps<typeof Menu>;

const mockData: CVPreviewProps = {
  cvData: {
    fullName: 'John Doe',
    profilePicture,
    targetPosition: 'Software Engineer',
  },
};

const CVEditPage: FC = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useSessionStorageState(
    `selectedKeys_cv-edit-page`,
    {
      defaultValue: ComponentType.CONTENT_FORM,
    },
  );

  const menuItems: MenuProps['items'] = [
    {
      key: ComponentType.CONTENT_FORM,
      label: '简历内容',
      icon: <FileTextOutlined />,
      onClick: () => {
        setSelectedKey(ComponentType.CONTENT_FORM);
      },
    },
    {
      key: ComponentType.THEME_SELECTOR,
      label: '主题选择',
      icon: <FormatPainterOutlined />,
      onClick: () => {
        setSelectedKey(ComponentType.THEME_SELECTOR);
      },
    },
  ];

  const LeftPanelContent = componentMap[selectedKey];

  const menuStyles: MenuProps['styles'] = {
    root: {
      borderRight: 'none',
    },
    item: {
      textAlign: 'center',
    },
  };

  return (
    <Flex className={styles.cvEditPage}>
      <Flex className={styles.menuContainer} vertical justify="space-between">
        <Menu
          items={menuItems}
          selectedKeys={[selectedKey]}
          styles={menuStyles}
          inlineCollapsed
        />
        <div
          className={styles.homeButton}
          onClick={() => navigate(PathEnum.CV_MANAGE)}
        >
          <HomeOutlined />
        </div>
      </Flex>
      <Splitter>
        <Splitter.Panel defaultSize="50%" min="30%" max="70%">
          <LeftPanelContent />
        </Splitter.Panel>
        <Splitter.Panel>
          <CVPreview {...mockData} />
        </Splitter.Panel>
      </Splitter>
    </Flex>
  );
};

export default CVEditPage;
