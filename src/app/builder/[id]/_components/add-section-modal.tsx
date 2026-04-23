'use client';

import { list as listContentTemplates } from '@/apis/content-template';
import { create } from '@/apis/section';
import type { TContentTemplate } from '@/types/business/content-template';
import {
  Button,
  EmptyState,
  Modal,
  Pagination,
  SearchField,
  Spinner,
  useOverlayState,
} from '@heroui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';

const PAGE_SIZE = 12;

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

function getVisiblePages(
  current: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) return range(1, totalPages);
  if (current <= 4) return [...range(1, 5), 'ellipsis', totalPages];
  if (current >= totalPages - 3) {
    return [1, 'ellipsis', ...range(totalPages - 4, totalPages)];
  }
  return [
    1,
    'ellipsis',
    current - 1,
    current,
    current + 1,
    'ellipsis',
    totalPages,
  ];
}

interface IProps {
  resumeId: number;
  /** 触发按钮外层样式 */
  className?: string;
}

export default function AddSectionModal(props: IProps) {
  const { resumeId, className } = props;
  const overlay = useOverlayState();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const deferredName = useDeferredValue(searchInput.trim());
  // 跨分页多选：以 Map 保存完整 item，便于 Footer 统计与后续 create
  const [selected, setSelected] = useState<Map<number, TContentTemplate>>(
    () => new Map(),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['content-template-list', page, PAGE_SIZE, deferredName],
    queryFn: async () => {
      const res = await listContentTemplates({
        filter: { name: deferredName },
        pagination: { page, pageSize: PAGE_SIZE },
      });
      if (res.code !== 0) {
        throw new Error(res.message || '加载失败');
      }
      return res.data;
    },
    enabled: overlay.isOpen,
  });

  const totalPages = useMemo(() => {
    const total = data?.pagination.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [data?.pagination.total]);

  const pageItems = useMemo(
    () => getVisiblePages(page, totalPages),
    [page, totalPages],
  );

  const listItems = data?.list ?? [];

  const createMutation = useMutation({
    mutationFn: create,
  });

  const resetState = () => {
    setSelected(new Map());
    setPage(1);
    setSearchInput('');
    setSubmitError(null);
  };

  const handleToggle = (template: TContentTemplate) => {
    setSubmitError(null);
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(template.id)) {
        next.delete(template.id);
      } else {
        next.set(template.id, template);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size === 0) return;
    setSubmitError(null);
    try {
      // 按选择顺序串行创建，保证后端返回的 sections 追加顺序稳定
      for (const template of selected.values()) {
        const res = await createMutation.mutateAsync({
          resumeId,
          contentTemplateId: template.id,
        });
        if (res.code !== 0) {
          throw new Error(res.message || '添加失败');
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      resetState();
      overlay.close();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '添加失败');
    }
  };

  return (
    <Modal>
      <Button
        variant="secondary"
        className={className}
        onPress={() => {
          resetState();
          overlay.open();
        }}
      >
        <Plus className="size-4" aria-hidden />
        添加模块
      </Button>
      <Modal.Backdrop
        isOpen={overlay.isOpen}
        onOpenChange={overlay.setOpen}
      >
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-4xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="px-2">添加模块</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4 px-2">
                <header className="flex flex-wrap items-center gap-3">
                  <SearchField
                    aria-label="搜索"
                    variant="secondary"
                    className="min-w-48"
                    value={searchInput}
                    onChange={(value) => {
                      setSearchInput(value);
                      setPage(1);
                    }}
                  >
                    <SearchField.Group>
                      <SearchField.SearchIcon />
                      <SearchField.Input placeholder="模块名称" />
                      <SearchField.ClearButton />
                    </SearchField.Group>
                  </SearchField>
                  <span className="text-muted ml-auto text-sm">
                    已选 {selected.size}
                  </span>
                </header>

                {isPending ? (
                  <div className="flex min-h-48 items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : isError ? (
                  <EmptyState className="border-default-300 min-h-48 rounded-2xl border border-dashed">
                    <p className="text-danger text-sm">
                      {error instanceof Error ? error.message : '加载失败'}
                    </p>
                  </EmptyState>
                ) : listItems.length === 0 ? (
                  <EmptyState className="border-default-300 min-h-48 rounded-2xl border border-dashed">
                    <p className="text-muted text-sm">
                      {deferredName
                        ? '没有匹配的模块'
                        : '暂无可添加的模块，请先到「模块」页创建'}
                    </p>
                  </EmptyState>
                ) : (
                  <section className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                    {listItems.map((item) => {
                      const checked = selected.has(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggle(item)}
                          aria-pressed={checked}
                          className={[
                            'group relative flex min-h-24 flex-col items-start gap-1 rounded-2xl border p-4 pr-10 text-left transition-all',
                            checked
                              ? 'border-accent/60 bg-accent/10'
                              : 'border-default-200 bg-surface hover:border-default-400',
                          ].join(' ')}
                        >
                          <span className="text-foreground line-clamp-2 text-sm font-semibold">
                            {item.name.trim() || '未命名模块'}
                          </span>
                          <span className="text-muted text-xs">
                            {item.infoTemplates.length} 个信息层
                          </span>
                          <span
                            aria-hidden
                            className={[
                              'absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border',
                              checked
                                ? 'border-accent bg-accent text-white'
                                : 'border-default-300 bg-white text-transparent',
                            ].join(' ')}
                          >
                            <Check className="size-3" />
                          </span>
                        </button>
                      );
                    })}
                  </section>
                )}

                {totalPages > 1 ? (
                  <Pagination className="flex flex-wrap items-center justify-center gap-4">
                    <Pagination.Content>
                      <Pagination.Item>
                        <Pagination.Previous
                          isDisabled={page <= 1}
                          onPress={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          <Pagination.PreviousIcon />
                          <span className="sr-only sm:not-sr-only">上一页</span>
                        </Pagination.Previous>
                      </Pagination.Item>

                      {pageItems.map((entry, idx) =>
                        entry === 'ellipsis' ? (
                          <Pagination.Item key={`e-${idx}`}>
                            <Pagination.Ellipsis />
                          </Pagination.Item>
                        ) : (
                          <Pagination.Item key={entry}>
                            <Pagination.Link
                              isActive={entry === page}
                              onPress={() => setPage(entry)}
                            >
                              {entry}
                            </Pagination.Link>
                          </Pagination.Item>
                        ),
                      )}

                      <Pagination.Item>
                        <Pagination.Next
                          isDisabled={page >= totalPages}
                          onPress={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                        >
                          <span className="sr-only sm:not-sr-only">下一页</span>
                          <Pagination.NextIcon />
                        </Pagination.Next>
                      </Pagination.Item>
                    </Pagination.Content>
                  </Pagination>
                ) : null}
              </div>
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
                  variant="primary"
                  isDisabled={
                    selected.size === 0 || createMutation.isPending
                  }
                  onPress={() => {
                    void handleConfirm();
                  }}
                >
                  {createMutation.isPending
                    ? '添加中…'
                    : selected.size > 0
                      ? `添加 (${selected.size})`
                      : '添加'}
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
