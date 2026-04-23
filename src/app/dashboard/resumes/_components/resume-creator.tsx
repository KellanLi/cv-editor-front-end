'use client';

import { create } from '@/apis/resume';
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  TextField,
  useOverlayState,
} from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface IProps {
  className?: string;
}

export default function ResumeCreator(props: IProps) {
  const { className } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const overlayState = useOverlayState();
  const [title, setTitle] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: (res) => {
      if (res.code !== 0) {
        setSubmitError(res.message || '创建失败');
        return;
      }
      setSubmitError(null);
      setTitle('');
      overlayState.close();
      void queryClient.invalidateQueries({ queryKey: ['resume-list'] });
      router.push(`/builder/${res.data.id}`);
    },
    onError: (err) => {
      setSubmitError(err instanceof Error ? err.message : '创建失败');
    },
  });

  return (
    <Modal>
      <Button
        className={className}
        variant="primary"
        onPress={() => {
          setSubmitError(null);
          setTitle('');
          overlayState.open();
        }}
      >
        <Plus className="size-4" aria-hidden />
        创建简历
      </Button>
      <Modal.Backdrop
        isOpen={overlayState.isOpen}
        onOpenChange={overlayState.setOpen}
      >
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>创建简历</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Form
                id="resume-creator-form"
                className="contents"
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = title.trim();
                  if (!trimmed) return;
                  createMutation.mutate({ title: trimmed });
                }}
              >
                <TextField
                  isRequired
                  value={title}
                  onChange={(next) => {
                    setSubmitError(null);
                    setTitle(next);
                  }}
                  validate={(value) => {
                    if (!value?.trim()) return '请填写简历名称';
                    return null;
                  }}
                >
                  <Label>简历名称</Label>
                  <Input
                    variant="secondary"
                    placeholder="例如：后端开发工程师简历"
                    autoFocus
                  />
                  <FieldError />
                </TextField>
              </Form>
            </Modal.Body>
            <Modal.Footer className="flex flex-col items-stretch gap-2">
              {submitError ? (
                <p className="text-danger text-sm">{submitError}</p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button slot="close" variant="secondary">
                  取消
                </Button>
                <Button
                  type="submit"
                  form="resume-creator-form"
                  variant="primary"
                  isDisabled={createMutation.isPending}
                >
                  创建
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
