'use client';

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
import { Ref, useImperativeHandle, useState } from 'react';
import InfoLayerModal from './info-layer-modal';
import InfoLayerFieldList, {
  createInfoLayerRow,
  InfoLayerRow,
  normalizeOrders,
} from './info-layer-field-list';

interface IProps {
  ref: Ref<unknown>;
  className?: string;
}

export default function SectionBuilder(props: IProps) {
  const { ref, className } = props;
  const overlayState = useOverlayState();
  const [item, setItem] = useState<TContentTemplateItem | null>(null);
  const [infoLayers, setInfoLayers] = useState<InfoLayerRow[]>([]);

  useImperativeHandle(ref, () => {
    return {
      open: (next: TContentTemplateItem | null) => {
        setItem(next);
        if (next?.infoTemplates?.length) {
          setInfoLayers(
            next.infoTemplates.map((t, i) => ({
              ...t,
              keyId: crypto.randomUUID(),
              order: i,
            })),
          );
        } else {
          setInfoLayers([]);
        }
        overlayState.open();
      },
    };
  }, [overlayState]);

  return (
    <Modal>
      <Button
        className={className}
        onPress={() => {
          setItem(null);
          setInfoLayers([]);
          overlayState.open();
        }}
      >
        创建
      </Button>
      <Modal.Backdrop
        isOpen={overlayState.isOpen}
        onOpenChange={overlayState.setOpen}
      >
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
                      <InfoLayerModal
                        onOk={(type) => {
                          setInfoLayers((prev) =>
                            normalizeOrders([...prev, createInfoLayerRow(type)]),
                          );
                        }}
                      />
                    </div>
                    <Surface
                      variant="secondary"
                      className="mt-2 rounded-2xl p-4"
                    >
                      <InfoLayerFieldList
                        layers={infoLayers}
                        onLayersChange={setInfoLayers}
                      />
                    </Surface>
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
