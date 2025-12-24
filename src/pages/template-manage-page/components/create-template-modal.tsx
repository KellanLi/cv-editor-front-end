import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, Modal, ModalProps } from 'antd';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from 'react-beautiful-dnd';
import { useImperativeHandle, useRef, useState, type FC } from 'react';
import SelectLayerModal, { ISelectLayerModalRef } from './select-layer-modal';
import {
  FrontLayerNameMap,
  FrontLayerType,
} from '@/components/front-layer/const';

const enum DroppableIds {
  LAYER = 'layer',
}

export interface ICreateTemplateModalRef {
  open: () => void;
}

const CreateTemplateModal: FC<{
  ref?: React.RefObject<ICreateTemplateModalRef | null>;
}> = ({ ref }) => {
  const selectLayerModalRef = useRef<ISelectLayerModalRef | null>(null);
  const [layers, setLayers] = useState<FrontLayerType[]>([]);
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

  const onDragEnd: OnDragEndResponder = (result) => {
    console.log(result);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Modal {...modalProps}>
        <Flex gap={20}>
          <Form layout="vertical" style={{ flex: 1 }}>
            <Form.Item name="template_name" label="模板名称">
              <Input />
            </Form.Item>
            <Form.Item name="template_layers" label="前端层">
              <Droppable droppableId={DroppableIds.LAYER}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={{
                      backgroundColor: snapshot.isDraggingOver
                        ? 'blue'
                        : 'grey',
                    }}
                    {...provided.droppableProps}
                  >
                    <h2>I am a droppable!</h2>
                    {layers.map((layer, index) => {
                      return (
                        <Draggable
                          draggableId={`${FrontLayerNameMap[layer]}-${layer.toString()}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <span>{FrontLayerNameMap[layer]}</span>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Form.Item>
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
        <SelectLayerModal
          ref={selectLayerModalRef}
          onOk={(newSelectLayers) => {
            setLayers([...layers, ...newSelectLayers]);
          }}
        />
      </Modal>
    </DragDropContext>
  );
};

export default CreateTemplateModal;
