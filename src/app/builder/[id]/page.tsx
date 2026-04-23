'use client';

import { detail } from '@/apis/resume';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import BuilderTopBar, { type TSaveStatus } from './_components/builder-top-bar';
import CenterPanel from './_components/center-panel';
import LeftPanel from './_components/left-panel';
import ResizeHandle from './_components/resize-handle';
import RightPanel from './_components/right-panel';

const LEFT_MIN = 240;
const LEFT_MAX = 520;
const LEFT_DEFAULT = 320;

const RIGHT_MIN = 280;
const RIGHT_MAX = 520;
const RIGHT_DEFAULT = 320;

function parseResumeIdParam(raw: string | string[] | undefined): number | null {
  if (raw === undefined) return null;
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const resumeId = parseResumeIdParam(params.id);

  const {
    data: resume,
    isPending,
    isError,
    error: resumeError,
  } = useQuery({
    queryKey: ['resume', resumeId] as const,
    queryFn: async () => {
      const res = await detail({ id: resumeId! });
      if (res.code !== 0) {
        throw new Error(res.message || '加载失败');
      }
      return res.data;
    },
    enabled: resumeId != null,
  });

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(LEFT_DEFAULT);
  const [rightWidth, setRightWidth] = useState(RIGHT_DEFAULT);
  const [status] = useState<TSaveStatus>('saved');

  const titleState =
    resumeId == null
      ? ('error' as const)
      : isPending
        ? ('loading' as const)
        : isError
          ? ('error' as const)
          : ('ready' as const);

  return (
    <div className="bg-background flex h-lvh min-h-0 flex-col overflow-hidden">
      <BuilderTopBar
        title={resume?.title ?? ''}
        titleState={titleState}
        status={status}
        leftPanelOpen={leftOpen}
        rightPanelOpen={rightOpen}
        onToggleLeftPanel={() => setLeftOpen((v) => !v)}
        onToggleRightPanel={() => setRightOpen((v) => !v)}
        onExport={() => {
          // TODO: 导出功能
        }}
        onSave={() => {
          // TODO: 手动保存
        }}
      />

      <div className="flex min-h-0 flex-1">
        {leftOpen ? (
          <>
            <aside
              className="bg-background shrink-0"
              style={{ width: leftWidth }}
            >
              <LeftPanel />
            </aside>
            <ResizeHandle
              ariaLabel="拖动调整左侧面板宽度"
              currentWidth={leftWidth}
              minWidth={LEFT_MIN}
              maxWidth={LEFT_MAX}
              computeWidth={(dx, base) => base + dx}
              onChange={setLeftWidth}
            />
          </>
        ) : null}

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-white">
          <CenterPanel
            resumeId={resumeId}
            resume={resume}
            isPending={isPending}
            isError={isError}
            error={resumeError instanceof Error ? resumeError : null}
          />
        </main>

        {rightOpen ? (
          <>
            <ResizeHandle
              ariaLabel="拖动调整右侧面板宽度"
              currentWidth={rightWidth}
              minWidth={RIGHT_MIN}
              maxWidth={RIGHT_MAX}
              computeWidth={(dx, base) => base - dx}
              onChange={setRightWidth}
            />
            <aside
              className="bg-background shrink-0"
              style={{ width: rightWidth }}
            >
              <RightPanel
                resumeId={resumeId}
                sections={resume?.sections ?? []}
              />
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}
