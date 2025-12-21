import { Modal, type ModalProps } from 'antd';
import { useImperativeHandle, useState, type FC } from 'react';
import {
  FrontLayerNameMap,
  FrontLayerType,
} from '@/components/front-layer/const';
import { LayerPreview } from '@/components/front-layer';

export interface ISelectLayerModalRef {
  open: () => void;
}

interface SelectLayerModalProps {
  ref?: React.RefObject<ISelectLayerModalRef | null>;
}

const SelectLayerModal: FC<SelectLayerModalProps> = (props) => {
  const { ref } = props;
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
    title: '选择要添加的前端层',
    open,
    onCancel: () => {
      setOpen(false);
    },
    onOk: () => {},
    okText: '确定',
    cancelText: '取消',
  };

  return (
    <Modal {...modalProps}>
      <div>
        {Object.keys(FrontLayerNameMap).map((key) => {
          const layerType: FrontLayerType = Number(key);
          const layerName = FrontLayerNameMap[layerType];
          return (
            <div key={key}>
              <h3>{layerName}</h3>
              <LayerPreview layerType={layerType} />
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default SelectLayerModal;
