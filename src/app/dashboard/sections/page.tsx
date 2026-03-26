'use client';

import { useRef } from 'react';
import SectionBuilder from './_components/section-builder';
import { SearchField } from '@heroui/react';

export default function SectionsPage() {
  const sectionBuilderRef = useRef(null);

  return (
    <div className="mt-4">
      <header className="flex">
        <SearchField aria-label="搜索">
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
