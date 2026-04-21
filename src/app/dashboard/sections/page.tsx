'use client';

import { list } from '@/apis/content-template';
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import SectionBuilder, {
  type SectionBuilderHandle,
} from './_components/section-builder';
import SectionTemplateCard from './_components/section-template-card';
import { EmptyState, Pagination, SearchField, Spinner } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';

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

export default function SectionsPage() {
  const sectionBuilderRef = useRef<SectionBuilderHandle>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const deferredName = useDeferredValue(searchInput.trim());

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['section-list', page, PAGE_SIZE, deferredName],
    queryFn: async () => {
      const res = await list({
        filter: { name: deferredName },
        pagination: { page, pageSize: PAGE_SIZE },
      });
      if (res.code !== 0) {
        throw new Error(res.message || '加载失败');
      }
      return res.data;
    },
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

  return (
    <div className="mt-4 flex flex-col gap-6">
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
            <SearchField.Input placeholder="模版名称" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <SectionBuilder ref={sectionBuilderRef} className="ml-auto" />
      </header>

      {isPending ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState className="min-h-48 rounded-2xl border border-dashed border-default-300">
          <p className="text-danger text-sm">
            {error instanceof Error ? error.message : '加载失败'}
          </p>
        </EmptyState>
      ) : listItems.length === 0 ? (
        <EmptyState className="min-h-48 rounded-2xl border border-dashed border-default-300">
          <p className="text-muted text-sm">暂无模块模版，点击右上角「创建」开始添加。</p>
        </EmptyState>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {listItems.map((item) => (
              <SectionTemplateCard
                key={item.id}
                item={item}
                onEdit={(row) => {
                  sectionBuilderRef.current?.open(row);
                }}
              />
            ))}
          </section>

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
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <span className="sr-only sm:not-sr-only">下一页</span>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          ) : null}
        </>
      )}
    </div>
  );
}
