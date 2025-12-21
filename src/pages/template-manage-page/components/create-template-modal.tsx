import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, Modal, ModalProps } from 'antd';
import { useImperativeHandle, useRef, useState, type FC } from 'react';
import SelectLayerModal, { ISelectLayerModalRef } from './select-layer-modal';

export interface ICreateTemplateModalRef {
  open: () => void;
}

const CreateTemplateModal: FC<{
  ref?: React.RefObject<ICreateTemplateModalRef | null>;
}> = ({ ref }) => {
  const selectLayerModalRef = useRef<ISelectLayerModalRef | null>(null);
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        setOpen(true);
      },
    };
  });

  const modalProps: ModalProps = {
    width: 960,
    title: '创建模板',
    open,
    onCancel: () => {
      setOpen(false);
    },
    onOk: () => {},
    okText: '创建',
    cancelText: '取消',
  };

  return (
    <Modal {...modalProps}>
      <Flex gap={20}>
        <Form layout="vertical" style={{ flex: 1 }}>
          <Form.Item name="template_name" label="模板名称">
            <Input />
          </Form.Item>
          <Form.Item name="template_layers" label="前端层"></Form.Item>
          <Form.Item>
            <Button
              type="dashed"
              style={{ width: '100%' }}
              onClick={() => {
                selectLayerModalRef.current?.open();
              }}
            >
              <PlusOutlined />
            </Button>
          </Form.Item>
        </Form>
        <div style={{ flex: 1 }}>预览</div>
      </Flex>
      <SelectLayerModal ref={selectLayerModalRef} />
    </Modal>
  );
};

export default CreateTemplateModal;
