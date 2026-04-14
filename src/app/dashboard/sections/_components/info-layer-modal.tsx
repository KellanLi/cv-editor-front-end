import {
  Button,
  Checkbox,
  CheckboxGroup,
  Label,
  Modal,
} from '@heroui/react';
import { INFO_LAYER, INFO_LAYER_MAP } from '@/components/info-layer/const';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface IProps {
  onOk: (type: INFO_LAYER) => void;
}

export default function InfoLayerModal(props: IProps) {
  const { onOk } = props;
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange = (next: string[]) => {
    setSelected((prev) => {
      if (next.length === 0) {
        return [];
      }
      if (next.length === 1) {
        return next;
      }
      const added = next.find((v) => !prev.includes(v));
      return added ? [added] : [];
    });
  };

  const selectedType = selected[0] as INFO_LAYER | undefined;

  return (
    <Modal>
      <Button variant="ghost" onPress={() => setSelected([])}>
        <Plus />
        添加
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-4xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>添加信息层</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <CheckboxGroup
                className="flex flex-col gap-3"
                name="info-layer"
                value={selected}
                onChange={handleSelectionChange}
              >
                {Object.entries(INFO_LAYER_MAP).map(([key, value]) => {
                  const type = key as INFO_LAYER;
                  const { component: InfoLayer, name, defaultProps } = value;

                  return (
                    <Checkbox
                      key={key}
                      className={[
                        // 对齐官方 Features and Add-ons 示例；用 ! 保证覆盖 checkbox 基础类里的背景
                        'group relative w-full flex-col gap-4 rounded-3xl border border-foreground/10 bg-surface px-5 py-4 transition-all',
                        'data-[selected=true]:border-accent/40 data-[selected=true]:!bg-accent/10',
                        'aria-[checked=true]:border-accent/40 aria-[checked=true]:!bg-accent/10',
                      ].join(' ')}
                      value={type}
                      variant="secondary"
                    >
                      <Checkbox.Control className="absolute top-3 right-4 size-5 rounded-full before:rounded-full">
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Content className="w-full flex-col gap-3 pr-8">
                        <Label>{name}</Label>
                        <InfoLayer {...defaultProps} />
                      </Checkbox.Content>
                    </Checkbox>
                  );
                })}
              </CheckboxGroup>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"
                isDisabled={!selectedType}
                slot="close"
                onPress={() => {
                  if (selectedType) {
                    onOk(selectedType);
                  }
                }}
              >
                确认
              </Button>
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
