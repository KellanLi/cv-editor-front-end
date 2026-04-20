'use client';

import { remove } from '@/apis/content-template';
import SectionRender from '@/components/section-render';
import type { TContentTemplateItem } from '@/types/api/section/list';
import { Button, Card, Modal, Popover, useOverlayState } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { buildSectionPreviewModel } from './build-section-preview-model';

const createdAtFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

interface IProps {
  item: TContentTemplateItem;
  onEdit: (item: TContentTemplateItem) => void;
}

export default function SectionTemplateCard(props: IProps) {
  const { item, onEdit } = props;
  const queryClient = useQueryClient();
  const popover = useOverlayState();
  const deleteModal = useOverlayState();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const preview = useMemo(() => buildSectionPreviewModel(item), [item]);

  const removeMutation = useMutation({
    mutationFn: remove,
    onSuccess: (res) => {
      if (res.code !== 0) {
        setDeleteError(res.message || '删除失败');
        return;
      }
      setDeleteError(null);
      deleteModal.close();
      void queryClient.invalidateQueries({ queryKey: ['section-list'] });
    },
    onError: (err) => {
      setDeleteError(err instanceof Error ? err.message : '删除失败');
    },
  });

  const handleConfirmDelete = useCallback(() => {
    setDeleteError(null);
    removeMutation.mutate({ id: item.id });
  }, [item.id, removeMutation]);

  const createdLabel = useMemo(() => {
    try {
      return createdAtFormatter.format(new Date(item.createdAt));
    } catch {
      return item.createdAt;
    }
  }, [item.createdAt]);

  return (
    <>
      <Card.Root
        variant="secondary"
        className="relative flex min-h-[320px] flex-col overflow-hidden p-[5px]"
      >
        {/* 顶部与卡片圆角同心；底部与信息区衔接，不设圆角 */}
        <div className="relative max-h-[min(340px,52vw)] min-h-[240px] shrink-0 overflow-hidden rounded-t-[calc(1.5rem-5px)] bg-white">
          <div className="max-h-[min(340px,52vw)] min-h-[240px] overflow-y-auto">
            <div className="origin-top scale-[0.82] p-[5px] sm:scale-90">
              <SectionRender
                contentTemplate={{
                  name: item.name,
                  infoTemplates: preview.infoRows,
                }}
                status="view"
                contents={preview.contents}
                onContentsChange={() => {}}
              />
            </div>
          </div>
          <div
            className="pointer-events-none absolute right-0 bottom-0 left-0 z-[1] h-8"
            style={{
              background:
                'linear-gradient(to top, var(--surface-secondary), transparent)',
            }}
            aria-hidden
          />
        </div>

        <Card.Footer className="mt-auto flex min-h-[4.5rem] flex-row items-center gap-2 px-4">
          <div className="min-w-0 flex-1 pr-1">
            <p className="text-foreground line-clamp-2 text-base font-semibold">
              {item.name.trim() || '未命名模块'}
            </p>
            <p className="text-muted text-xs">创建于 {createdLabel}</p>
          </div>
          <div className="shrink-0">
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
                    className="justify-center gap-2"
                    onPress={() => {
                      popover.close();
                      onEdit(item);
                    }}
                  >
                    <Pencil className="size-4 shrink-0" aria-hidden />
                    编辑模块
                  </Button>
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
                    删除模块
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
                <Modal.Heading>删除模块</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-default-600 text-sm">
                  确定要删除「{item.name.trim() || '未命名模块'}」吗？此操作不可撤销。
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
