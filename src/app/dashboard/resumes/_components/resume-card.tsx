'use client';

import { remove } from '@/apis/resume';
import type { TResume } from '@/types/business/resume';
import {
  Button,
  Card,
  Modal,
  Popover,
  useOverlayState,
} from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EllipsisVertical, FileText, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

interface IProps {
  item: TResume;
}

export default function ResumeCard(props: IProps) {
  const { item } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const popover = useOverlayState();
  const deleteModal = useOverlayState();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const removeMutation = useMutation({
    mutationFn: remove,
    onSuccess: (res) => {
      if (res.code !== 0) {
        setDeleteError(res.message || '删除失败');
        return;
      }
      setDeleteError(null);
      deleteModal.close();
      void queryClient.invalidateQueries({ queryKey: ['resume-list'] });
    },
    onError: (err) => {
      setDeleteError(err instanceof Error ? err.message : '删除失败');
    },
  });

  const handleConfirmDelete = useCallback(() => {
    setDeleteError(null);
    removeMutation.mutate({ id: item.id });
  }, [item.id, removeMutation]);

  const updatedLabel = useMemo(() => {
    try {
      return dateFormatter.format(new Date(item.updatedAt));
    } catch {
      return item.updatedAt;
    }
  }, [item.updatedAt]);

  const openEditor = () => {
    router.push(`/builder/${item.id}`);
  };

  return (
    <>
      <Card.Root
        variant="secondary"
        role="button"
        tabIndex={0}
        aria-label={`打开简历：${item.title.trim() || '未命名简历'}`}
        className="group focus-visible:ring-accent/50 relative flex min-h-[220px] cursor-pointer flex-col overflow-hidden p-[5px] transition-shadow outline-none hover:shadow-md focus-visible:ring-2"
        onClick={openEditor}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openEditor();
          }
        }}
      >
        <div className="bg-default-50 flex min-h-[140px] flex-1 items-center justify-center rounded-t-[calc(1.5rem-5px)]">
          <FileText
            className="text-default-300 size-14"
            strokeWidth={1.2}
            aria-hidden
          />
        </div>

        <Card.Footer className="mt-auto flex min-h-[4.5rem] flex-row items-center gap-2 px-4">
          <div className="min-w-0 flex-1 pr-1">
            <p className="text-foreground line-clamp-1 text-base font-semibold">
              {item.title.trim() || '未命名简历'}
            </p>
            <p className="text-muted text-xs">更新于 {updatedLabel}</p>
          </div>
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Popover isOpen={popover.isOpen} onOpenChange={popover.setOpen}>
              <Popover.Trigger>
                <Button
                  aria-label="更多操作"
                  variant="ghost"
                  size="sm"
                  className="text-default-400 hover:text-default-600 min-w-0 px-1.5"
                >
                  <EllipsisVertical className="size-4" aria-hidden />
                </Button>
              </Popover.Trigger>
              <Popover.Content placement="bottom end" offset={8}>
                <Popover.Dialog className="flex w-full min-w-36 flex-col gap-0.5 p-1">
                  <Button
                    fullWidth
                    variant="ghost"
                    className="text-danger justify-center gap-2"
                    onPress={() => {
                      popover.close();
                      setDeleteError(null);
                      deleteModal.open();
                    }}
                  >
                    <Trash2 className="size-4 shrink-0" aria-hidden />
                    删除简历
                  </Button>
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
          </div>
        </Card.Footer>
      </Card.Root>

      <Modal state={deleteModal}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="sm" placement="center">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>删除简历</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-default-600 text-sm">
                  确定要删除「{item.title.trim() || '未命名简历'}
                  」吗？此操作不可撤销。
                </p>
                {deleteError ? (
                  <p className="text-danger mt-2 text-sm">{deleteError}</p>
                ) : null}
              </Modal.Body>
              <Modal.Footer className="gap-2">
                <Button
                  variant="secondary"
                  onPress={() => {
                    setDeleteError(null);
                    deleteModal.close();
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="secondary"
                  className="border-danger text-danger border"
                  isDisabled={removeMutation.isPending}
                  onPress={handleConfirmDelete}
                >
                  删除
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
