import { Button, Modal, Surface } from '@heroui/react';
import { INFO_LAYER_MAP } from '@/components/info-layer/const';
import { Plus } from 'lucide-react';

export default function InfoLayerModal() {
  return (
    <Modal>
      <Button variant="ghost">
        <Plus />
        添加
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>添加信息层</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                {Object.entries(INFO_LAYER_MAP).map(([key, value]) => {
                  const { component: InfoLayer, name, defaultProps } = value;

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
                })}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
