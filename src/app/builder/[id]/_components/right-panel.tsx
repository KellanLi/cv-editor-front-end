'use client';

import { list as listContentTemplates } from '@/apis/content-template';
import type { TContentTemplate } from '@/types/business/content-template';
import type { TSection } from '@/types/business/section';
import { Tabs } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import AddSectionModal from './add-section-modal';
import SectionList from './section-list';

const TAB_KEYS = {
  SECTIONS: 'sections',
  DESIGN: 'design',
  DIAGNOSIS: 'diagnosis',
} as const;

/** 一次性拉取一页较大的 Content Template，足够覆盖常规用户数量，用于 id → name 查找 */
const CONTENT_TEMPLATE_LOOKUP_PAGE_SIZE = 200;

interface IProps {
  resumeId: number | null;
  sections: TSection[];
}

export default function RightPanel(props: IProps) {
  const { resumeId, sections } = props;

  const { data: contentTemplateData } = useQuery({
    queryKey: ['content-template-lookup'],
    queryFn: async () => {
      const res = await listContentTemplates({
        filter: { name: '' },
        pagination: { page: 1, pageSize: CONTENT_TEMPLATE_LOOKUP_PAGE_SIZE },
      });
      if (res.code !== 0) {
        throw new Error(res.message || '加载失败');
      }
      return res.data;
    },
    enabled: resumeId != null,
  });

  const contentTemplateMap = useMemo(() => {
    const map = new Map<number, TContentTemplate>();
    for (const t of contentTemplateData?.list ?? []) {
      map.set(t.id, t);
    }
    return map;
  }, [contentTemplateData?.list]);

  return (
    <Tabs
      defaultSelectedKey={TAB_KEYS.SECTIONS}
      className="flex h-full min-h-0 flex-col"
    >
      <Tabs.ListContainer className="mt-2 shrink-0 px-3">
        <Tabs.List aria-label="多功能区" className="gap-2">
          <Tabs.Tab id={TAB_KEYS.SECTIONS}>
            模块管理
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id={TAB_KEYS.DESIGN}>
            设计
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id={TAB_KEYS.DIAGNOSIS}>
            AI 诊断
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>

      <Tabs.Panel
        id={TAB_KEYS.SECTIONS}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {resumeId != null ? (
          <>
            <AddSectionModal
              resumeId={resumeId}
              className="w-full justify-center gap-2"
            />
            <SectionList
              resumeId={resumeId}
              sections={sections}
              contentTemplateMap={contentTemplateMap}
            />
          </>
        ) : (
          <div className="border-default-200 rounded-xl border border-dashed p-6 text-center">
            <p className="text-muted text-sm">请先加载简历</p>
          </div>
        )}
      </Tabs.Panel>

      <Tabs.Panel
        id={TAB_KEYS.DESIGN}
        className="text-muted flex min-h-0 flex-1 items-center justify-center p-4 text-sm"
      >
        设计功能建设中
      </Tabs.Panel>

      <Tabs.Panel
        id={TAB_KEYS.DIAGNOSIS}
        className="text-muted flex min-h-0 flex-1 items-center justify-center p-4 text-sm"
      >
        AI 诊断建设中
      </Tabs.Panel>
    </Tabs>
  );
}
