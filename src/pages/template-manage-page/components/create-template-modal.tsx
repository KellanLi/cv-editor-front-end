import { Modal } from 'antd';
import { useImperativeHandle, useState, type FC } from 'react';

export interface ICreateTemplateModalRef {
  open: () => void;
}

const CreateTemplateModal: FC<{
  ref?: React.RefObject<ICreateTemplateModalRef | null>;
}> = ({ ref }) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        setOpen(true);
      },
    };
  });
  return <Modal open={open} onCancel={() => {
    setOpen(false);
  }}></Modal>;
};

export default CreateTemplateModal;
