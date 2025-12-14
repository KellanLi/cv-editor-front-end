import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';
import { type FC } from 'react';

const listData: unknown[] = [];

const TemplateManagePage: FC = () => {
  return (
    <div>
      <div>
        <Button>创建模版</Button>
      </div>
      <Flex>
        {listData.length === 0 ? (
          <Card>
            <div>
              <PlusOutlined />
            </div>
          </Card>
        ) : (
          listData.map(() => <Card></Card>)
        )}
      </Flex>
    </div>
  );
};

export default TemplateManagePage;
