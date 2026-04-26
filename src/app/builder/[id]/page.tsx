'use client';

import { list as listContentTemplates } from '@/apis/content-template';
import { detail } from '@/apis/resume';
import { list as sectionList } from '@/apis/section';
import {
  resumeQueryKey,
  resumeSectionsQueryKey,
} from '@/lib/builder-resume-keys';
import { ResumeSnapshotProvider } from '@/lib/resume-snapshot-context';
import type { TContentTemplate } from '@/types/business/content-template';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import BuilderTopBar, { type TSaveStatus } from './_components/builder-top-bar';
import CenterPanel from './_components/center-panel';
import { ResumeCoverCapture } from './_components/resume-cover-capture';
import ResumeCoverPreviewDebug from './_components/resume-cover-preview-debug';
import LeftPanel from './_components/left-panel';
import ResizeHandle from './_components/resize-handle';
import RightPanel from './_components/right-panel';

const LEFT_MIN = 240;
const LEFT_MAX = 520;
const LEFT_DEFAULT = 320;

const RIGHT_MIN = 280;
const RIGHT_MAX = 520;
const RIGHT_DEFAULT = 320;

/** 单简历模块数量通常远小于此值；分页拉满一页即可 */
const SECTION_LIST_PAGE_SIZE = 500;

/** 一次性拉取一页较大的 Content Template，用于中/右栏共用的 id → 模版查找 */
const CONTENT_TEMPLATE_LOOKUP_PAGE_SIZE = 200;

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
    queryKey: resumeQueryKey(resumeId),
    queryFn: async () => {
      const res = await detail({ id: resumeId! });
      if (res.code !== 0) {
        throw new Error(res.message || '加载失败');
      }
      return res.data;
    },
    enabled: resumeId != null,
  });

  const {
    data: sections,
    isPending: isSectionsPending,
    isError: isSectionsError,
    error: sectionsError,
  } = useQuery({
    queryKey: resumeSectionsQueryKey(resumeId),
    queryFn: async () => {
      const res = await sectionList({
        filter: { resumeId: resumeId! },
        pagination: { page: 1, pageSize: SECTION_LIST_PAGE_SIZE },
      });
      if (res.code !== 0) {
        throw new Error(res.message || '模块列表加载失败');
      }
      return [...res.data.list].sort((a, b) => a.order - b.order);
    },
    enabled: resumeId != null,
  });

  const sectionsList = useMemo(() => sections ?? [], [sections]);

  const { data: contentTemplateData } = useQuery({
    queryKey: ['content-template-lookup'] as const,
    queryFn: async () => {
      const res = await listContentTemplates({
        filter: { name: '' },
        pagination: { page: 1, pageSize: CONTENT_TEMPLATE_LOOKUP_PAGE_SIZE },
      });
      if (res.code !== 0) {
        throw new Error(res.message || '模块模版加载失败');
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

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(LEFT_DEFAULT);
  const [rightWidth, setRightWidth] = useState(RIGHT_DEFAULT);
  const [status] = useState<TSaveStatus>('saved');
  const captureRootRef = useRef<HTMLDivElement>(null);

  const titleState =
    resumeId == null
      ? ('error' as const)
      : isPending
        ? ('loading' as const)
        : isError
          ? ('error' as const)
          : ('ready' as const);

  const coverCaptureReady = Boolean(
    resumeId != null &&
      !isPending &&
      !isError &&
      resume != null &&
      !isSectionsPending &&
      !isSectionsError,
  );

  return (
    <ResumeSnapshotProvider>
    <div className="bg-background flex h-lvh min-h-0 flex-col overflow-hidden print:h-auto print:min-h-0 print:overflow-visible">
      <BuilderTopBar
        title={resume?.title ?? ''}
        titleState={titleState}
        status={status}
        leftPanelOpen={leftOpen}
        rightPanelOpen={rightOpen}
        onToggleLeftPanel={() => setLeftOpen((v) => !v)}
        onToggleRightPanel={() => setRightOpen((v) => !v)}
        onExport={() => {
          window.print();
        }}
        onSave={() => {
          // TODO: 手动保存
        }}
        beforeExportExtra={
          <ResumeCoverPreviewDebug
            captureRootRef={captureRootRef}
            ready={coverCaptureReady}
          />
        }
      />

      <div className="flex min-h-0 flex-1">
        {leftOpen ? (
          <>
            <aside
              className="print:hidden bg-background flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden shrink-0"
              style={{ width: leftWidth }}
            >
              <LeftPanel resumeId={resumeId} />
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

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-white print:min-h-0 print:overflow-visible print:rounded-none print:shadow-none">
          <CenterPanel
            ref={captureRootRef}
            resumeId={resumeId}
            resume={resume}
            isPending={isPending}
            isError={isError}
            error={resumeError instanceof Error ? resumeError : null}
            sections={sectionsList}
            sectionsPending={isSectionsPending}
            sectionsError={
              isSectionsError
                ? sectionsError instanceof Error
                  ? sectionsError
                  : new Error('模块列表加载失败')
                : null
            }
            contentTemplateMap={contentTemplateMap}
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
              className="print:hidden bg-background shrink-0"
              style={{ width: rightWidth }}
            >
              <RightPanel
                resumeId={resumeId}
                sections={sectionsList}
                sectionsPending={isSectionsPending}
                sectionsError={
                  isSectionsError
                    ? sectionsError instanceof Error
                      ? sectionsError
                      : new Error('模块列表加载失败')
                    : null
                }
                contentTemplateMap={contentTemplateMap}
              />
            </aside>
          </>
        ) : null}
      </div>
      <ResumeCoverCapture
        captureRootRef={captureRootRef}
        resumeId={resumeId}
        resume={resume}
        sections={sectionsList}
        ready={coverCaptureReady}
      />
    </div>
    </ResumeSnapshotProvider>
  );
}
