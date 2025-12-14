import { Modal } from 'antd';
import { useImperativeHandle, useState, type FC } from 'react';

const CreateTemplateModal: FC = ({ ref }) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      open: (templateId: number) => {
        setOpen(true);
      },
    };
  });
  return <Modal open={open}></Modal>;
};

export default CreateTemplateModal;
