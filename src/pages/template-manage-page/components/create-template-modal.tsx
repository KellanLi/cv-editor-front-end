import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, FormProps, Input, Modal, ModalProps } from 'antd';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from 'react-beautiful-dnd';
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type FC,
} from 'react';
import SelectLayerModal, { ISelectLayerModalRef } from './select-layer-modal';
import { FrontLayerNameMap } from '@/components/front-layer/const';
import type {
  LayerItem,
  TCreateTemplate,
} from '@/hooks/useLocalTemplateLayers/type';
import * as styles from '../index.module.less';
import { genClassNames } from '@/utils';

const enum DroppableIds {
  LAYER = 'layer',
}

export interface ICreateTemplateModalRef {
  open: () => void;
}

interface CreateTemplateModalProps {
  ref?: React.RefObject<ICreateTemplateModalRef | null>;
  onOk?: (props: TCreateTemplate) => void;
}

const CreateTemplateModal: FC<CreateTemplateModalProps> = (props) => {
  const { ref, onOk } = props;

  const [form] = Form.useForm<TCreateTemplate>();
  const selectLayerModalRef = useRef<ISelectLayerModalRef | null>(null);
  const [layerItems, setLayerItems] = useState<LayerItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    form.setFieldValue('template_layers', layerItems);
  }, [layerItems, form]);

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
      form?.resetFields();
      setOpen(false);
      setLayerItems([]);
    },
    onOk: () => {
      form?.submit();
    },
    okText: '创建',
    cancelText: '取消',
    className: styles.createTemplateModal,
  };

  const formProps: FormProps<TCreateTemplate> = {
    form: form,
    layout: 'vertical',
    style: { flex: 1 },
    onFinish: (values) => {
      onOk?.(values);
      form?.resetFields();
      setOpen(false);
      setLayerItems([]);
    },
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const newLayerItems = [...layerItems];
    const [remove] = newLayerItems.splice(source.index, 1);
    newLayerItems.splice(destination.index, 0, remove);
    setLayerItems(newLayerItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Modal {...modalProps}>
        <Flex gap={20}>
          <Form {...formProps}>
            <Form.Item
              name="template_name"
              label="模板名称"
              rules={[
                {
                  message: '请输入模板名称',
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="前端层" required>
              <Form.Item
                name="template_layers"
                noStyle
                rules={[
                  {
                    message: '至少选择一个前端层',
                    required: true,
                  },
                ]}
              >
                {layerItems.length > 0 && (
                  <Droppable
                    droppableId={DroppableIds.LAYER}
                    direction="vertical"
                    isDropDisabled={!layerItems.length}
                    isCombineEnabled={false}
                    ignoreContainerClipping={true}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        className={genClassNames({
                          [styles.templateLayerDrop]: true,
                          [styles.isDraggingOver]: snapshot.isDraggingOver,
                        })}
                        {...provided.droppableProps}
                      >
                        {layerItems.map((layerItem, index) => {
                          return (
                            <Draggable
                              draggableId={layerItem.id}
                              index={index}
                              key={layerItem.id}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={genClassNames({
                                    [styles.dragItem]: true,
                                    [styles.isDragging]: snapshot.isDragging,
                                  })}
                                  style={provided.draggableProps.style}
                                >
                                  <div>{FrontLayerNameMap[layerItem.type]}</div>
                                  <div
                                    className={styles.deleteIcon}
                                    onClick={() => {
                                      setLayerItems(
                                        layerItems.filter(
                                          (item) => item.id !== layerItem.id,
                                        ),
                                      );
                                    }}
                                  >
                                    <DeleteOutlined />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </Form.Item>
              <Button
                type="dashed"
                style={{ width: '100%', marginTop: 10 }}
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
            const newLayerItems = newSelectLayers.map((layer) => ({
              id: `${FrontLayerNameMap[layer]}-${crypto.randomUUID()}`,
              type: layer,
            }));

            setLayerItems([...layerItems, ...newLayerItems]);
          }}
        />
      </Modal>
    </DragDropContext>
  );
};

export default CreateTemplateModal;
