import { Modal, type ModalProps } from 'antd';
import { useImperativeHandle, useState, type FC } from 'react';
import {
  FrontLayerNameMap,
  FrontLayerType,
} from '@/components/front-layer/const';
import { LayerPreview } from '@/components/front-layer';

import * as styles from '../index.module.less';
import { genClassNames } from '@/utils';

export interface ISelectLayerModalRef {
  open: () => void;
}

interface SelectLayerModalProps {
  ref?: React.RefObject<ISelectLayerModalRef | null>;
}

const SelectLayerModal: FC<SelectLayerModalProps> = (props) => {
  const { ref } = props;
  const [open, setOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        setOpen(true);
      },
    };
  });

  const modalProps: ModalProps = {
    width: 960,
    className: styles.selectLayerModal,
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
      <div className={styles.innerWrapper}>
        {Object.keys(FrontLayerNameMap).map((key) => {
          const layerType: FrontLayerType = Number(key);
          const layerName = FrontLayerNameMap[layerType];
          return (
            <div
              key={key}
              className={genClassNames({
                [styles.layerItem]: true,
                [styles.selected]: selectedKeys.includes(key),
              })}
              onClick={() => {
                if (selectedKeys.includes(key)) {
                  setSelectedKeys(selectedKeys.filter((k) => k !== key));
                } else {
                  setSelectedKeys([...selectedKeys, key]);
                }
              }}
            >
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
