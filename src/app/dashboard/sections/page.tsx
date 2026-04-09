'use client';

import { useRef } from 'react';
import SectionBuilder from './_components/section-builder';
import { SearchField } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { list } from '@/apis/section';

export default function SectionsPage() {
  const sectionBuilderRef = useRef(null);
  const { data, isPending } = useQuery({
    queryKey: ['section-list', 1, 10],
    queryFn: async () => {
      const res = await list({
        filter: {
          name: '',
        },
        pagination: {
          page: 1,
          pageSize: 10,
        },
      });

      return res.data;
    },
  });

  return (
    <div className="mt-4">
      <header className="flex">
        <SearchField aria-label="搜索" variant="secondary">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="模版名称" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <SectionBuilder ref={sectionBuilderRef} className="ml-auto" />
      </header>
      <section className="gird gird-cols-3"></section>
    </div>
  );
}
