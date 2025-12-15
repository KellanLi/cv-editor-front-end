import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';
import { useRef, type FC } from 'react';
import CreateTemplateModal, { ICreateTemplateModalRef } from './components/create-template-modal';

const listData: unknown[] = [];

const TemplateManagePage: FC = () => {
  const createTemplateModalRef = useRef<ICreateTemplateModalRef>(null);


  return (
    <div>
      <div>
        <Button onClick={() => {
          createTemplateModalRef.current?.open();
        }}>
          创建模版
        </Button>
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
      <CreateTemplateModal ref={createTemplateModalRef}/>
    </div>
  );
};

export default TemplateManagePage;
