'use client';

import { Button, Tabs } from '@heroui/react';
import { Plus } from 'lucide-react';

const TAB_KEYS = {
  SECTIONS: 'sections',
  DESIGN: 'design',
  DIAGNOSIS: 'diagnosis',
} as const;

export default function RightPanel() {
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
        <Button variant="secondary" className="w-full justify-center gap-2">
          <Plus className="size-4" aria-hidden />
          添加模块
        </Button>
        <div className="text-muted border-default-200 rounded-xl border border-dashed p-6 text-center text-sm">
          暂无模块
        </div>
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
