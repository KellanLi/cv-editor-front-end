'use client';

import type { TContentTemplate } from '@/types/business/content-template';
import type { TSection } from '@/types/business/section';
import { Spinner, Tabs } from '@heroui/react';
import AddSectionModal from './add-section-modal';
import SectionList from './section-list';

const TAB_KEYS = {
  SECTIONS: 'sections',
  DESIGN: 'design',
  DIAGNOSIS: 'diagnosis',
} as const;

interface IProps {
  resumeId: number | null;
  sections: TSection[];
  /** `section/list` 加载中 */
  sectionsPending?: boolean;
  /** `section/list` 失败 */
  sectionsError?: Error | null;
  /** 由父级统一查询的模版查找表，供名称展示使用 */
  contentTemplateMap: Map<number, TContentTemplate>;
}

export default function RightPanel(props: IProps) {
  const {
    resumeId,
    sections,
    sectionsPending,
    sectionsError,
    contentTemplateMap,
  } = props;

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
              sections={sections}
              isDisabled={sectionsPending || sectionsError != null}
              className="w-full justify-center gap-2"
            />
            {sectionsPending ? (
              <div className="text-muted flex min-h-32 items-center justify-center gap-2 text-sm">
                <Spinner size="md" />
                加载模块列表…
              </div>
            ) : sectionsError ? (
              <p className="text-danger text-sm" role="alert">
                {sectionsError.message}
              </p>
            ) : (
              <SectionList
                resumeId={resumeId}
                sections={sections}
                contentTemplateMap={contentTemplateMap}
              />
            )}
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
