'use client';

import type { TContentTemplate } from '@/types/business/content-template';
import type { TSection } from '@/types/business/section';
import { Spinner, Tabs } from '@heroui/react';
import { useMemo, useSyncExternalStore } from 'react';
import AddSectionModal from './add-section-modal';
import ResumeDiagnosisPanel from './resume-diagnosis-panel';
import SectionList from './section-list';

const TAB_KEYS = {
  SECTIONS: 'sections',
  DESIGN: 'design',
  DIAGNOSIS: 'diagnosis',
} as const;

const RIGHT_PANEL_TAB_STORAGE_KEY = 'builderRightPanelSelectedTab';
const RIGHT_PANEL_TAB_CHANGE_EVENT = 'builder-right-panel-tab-change';
const EMPTY_SUBSCRIBE = () => () => {};

function isTabKey(v: string | null): v is (typeof TAB_KEYS)[keyof typeof TAB_KEYS] {
  return (
    v === TAB_KEYS.SECTIONS || v === TAB_KEYS.DESIGN || v === TAB_KEYS.DIAGNOSIS
  );
}

function getStoredSelectedTab() {
  if (typeof window === 'undefined') return TAB_KEYS.SECTIONS;
  const raw = window.localStorage.getItem(RIGHT_PANEL_TAB_STORAGE_KEY);
  return isTabKey(raw) ? raw : TAB_KEYS.SECTIONS;
}

function subscribeSelectedTab(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key != null && event.key !== RIGHT_PANEL_TAB_STORAGE_KEY) return;
    onStoreChange();
  };
  const onInternalChange = () => {
    onStoreChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(RIGHT_PANEL_TAB_CHANGE_EVENT, onInternalChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(RIGHT_PANEL_TAB_CHANGE_EVENT, onInternalChange);
  };
}

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
  const isClientReady = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false,
  );
  const selectedKey = useSyncExternalStore(
    subscribeSelectedTab,
    getStoredSelectedTab,
    () => TAB_KEYS.SECTIONS,
  );

  const sectionLabel = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of sections) {
      const tpl = contentTemplateMap.get(s.contentTemplateId);
      map.set(s.id, tpl?.name?.trim() ? tpl.name : `模块 #${s.id}`);
    }
    return (sectionId: number) => map.get(sectionId) ?? `模块 #${sectionId}`;
  }, [sections, contentTemplateMap]);

  return (
    <Tabs
      key={isClientReady ? 'tabs-client' : 'tabs-ssr'}
      selectedKey={isClientReady ? selectedKey : TAB_KEYS.SECTIONS}
      onSelectionChange={(key) => {
        const next = String(key);
        if (!isTabKey(next)) return;
        window.localStorage.setItem(RIGHT_PANEL_TAB_STORAGE_KEY, next);
        window.dispatchEvent(new Event(RIGHT_PANEL_TAB_CHANGE_EVENT));
      }}
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
        className="flex min-h-0 flex-1 flex-col p-4"
      >
        <ResumeDiagnosisPanel resumeId={resumeId} sectionLabel={sectionLabel} />
      </Tabs.Panel>
    </Tabs>
  );
}
