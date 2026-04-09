import { INFO_LAYER_MAP } from '@/components/info-layer/const';
import { TContentTemplateItem } from '@/types/api/section/list';
import {
  Button,
  Input,
  Label,
  Separator,
  TextField,
  useOverlayState,
  Surface,
  Modal,
} from '@heroui/react';
import { Plus } from 'lucide-react';
import { Ref, useImperativeHandle, useState } from 'react';

interface IProps {
  ref: Ref<unknown>;
  className?: string;
}

export default function SectionBuilder(props: IProps) {
  const { ref, className } = props;
  const overlayState = useOverlayState();
  const [item, setItem] = useState<TContentTemplateItem | null>(null);
  useImperativeHandle(ref, () => {
    return {
      open: (item: TContentTemplateItem) => {
        setItem(item);
        overlayState.open();
      },
    };
  }, [overlayState]);

  return (
    <Modal>
      <Button className={className}>创建</Button>
      <Modal.Backdrop>
        <Modal.Container size="cover">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="px-2">
                {item ? '编辑模块' : '创建模块'}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex h-full px-2">
                <section className="flex flex-1 flex-col gap-4">
                  <TextField>
                    <Label>模块名称</Label>
                    <Input variant="secondary" />
                  </TextField>
                  <section>
                    <div className="flex justify-between">
                      <Label>信息层</Label>
                      <Modal>
                        <Button variant="ghost">
                          <Plus />
                          添加
                        </Button>
                        <Modal.Backdrop>
                          <Modal.Container size="lg">
                            <Modal.Dialog>
                              <Modal.CloseTrigger />
                              <Modal.Header>
                                <Modal.Heading>添加信息层</Modal.Heading>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="flex flex-col gap-4">
                                  {Object.entries(INFO_LAYER_MAP).map(
                                    ([key, value]) => {
                                      const {
                                        component: InfoLayer,
                                        name,
                                        defaultProps,
                                      } = value;

                                      return (
                                        <Surface
                                          className="rounded-3xl p-6"
                                          key={key}
                                          variant="secondary"
                                        >
                                          <div>{name}</div>
                                          {<InfoLayer {...defaultProps} />}
                                        </Surface>
                                      );
                                    },
                                  )}
                                </div>
                              </Modal.Body>
                            </Modal.Dialog>
                          </Modal.Container>
                        </Modal.Backdrop>
                      </Modal>
                    </div>
                    <Surface variant="secondary"></Surface>
                  </section>
                </section>
                <Separator className="mx-2" orientation="vertical" />
                <section className="flex-1"></section>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary">{item ? '保存' : '创建'}</Button>
              <Button slot="close" variant="secondary">
                取消
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
