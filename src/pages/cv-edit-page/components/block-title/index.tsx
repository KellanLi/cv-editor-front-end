import { EditOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { type ReactNode, type FC } from 'react';

export interface BlockTitleProps {
  title: string;
  icon?: ReactNode;
  editable?: boolean;
}

export const BlockTitle: FC<BlockTitleProps> = (props) => {
  const { title, icon: Icon, editable } = props;
  return (
    <Space>
      <Space style={{ fontSize: 22, fontWeight: '500' }}>
        {Icon}
        {title}
      </Space>
      {editable && <EditOutlined style={{ fontSize: 16, cursor: 'pointer' }} />}
    </Space>
  );
};

export default BlockTitle;
