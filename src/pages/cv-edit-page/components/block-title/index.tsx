import { EditOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { type ReactNode, type FC } from 'react';

export interface BlockTitleProps {
  title: string;
  icon?: ReactNode;
  editable?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const BlockTitle: FC<BlockTitleProps> = (props) => {
  const { title, icon: Icon, editable, size = 'medium' } = props;
  const titleFontSizeMap = { small: 18, medium: 20, large: 22 };
  const titleMarginTopMap = { small: 10, medium: 15, large: 20 };

  return (
    <Space style={{ marginTop: titleMarginTopMap[size] }}>
      <Space style={{ fontSize: titleFontSizeMap[size], fontWeight: '500' }}>
        {Icon}
        {title}
      </Space>
      {editable && <EditOutlined style={{ fontSize: 16, cursor: 'pointer' }} />}
    </Space>
  );
};

export default BlockTitle;
