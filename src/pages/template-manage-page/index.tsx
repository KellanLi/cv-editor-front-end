import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';
import { useRef, type FC } from 'react';
import CreateTemplateModal, {
  ICreateTemplateModalRef,
} from './components/create-template-modal';

import type { TCreateTemplate } from '@/hooks/useLocalTemplateLayers/type';
import useLocalTemplateList from '@/hooks/useLocalTemplateLayers';

const TemplateManagePage: FC = () => {
  const createTemplateModalRef = useRef<ICreateTemplateModalRef>(null);
  const { addTemplate, getTemplateList } = useLocalTemplateList();
  const listData = getTemplateList();

  const onCreateOk = (values: TCreateTemplate) => {
    addTemplate(values);
  };

  return (
    <div>
      <div>
        <Button
          onClick={() => {
            createTemplateModalRef.current?.open();
          }}
        >
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
          listData.map((item) => <Card title={item.template_name}></Card>)
        )}
      </Flex>
      <CreateTemplateModal ref={createTemplateModalRef} onOk={onCreateOk} />
    </div>
  );
};

export default TemplateManagePage;
