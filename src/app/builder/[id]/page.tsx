'use client';

import { list as listContentTemplates } from '@/apis/content-template';
import { detail } from '@/apis/resume';
import { list as sectionList } from '@/apis/section';
import {
  resumeQueryKey,
  resumeSectionsQueryKey,
} from '@/lib/builder-resume-keys';
import {
  BUILDER_LEFT_DEFAULT,
  BUILDER_LEFT_MAX,
  BUILDER_LEFT_MIN,
  BUILDER_RIGHT_DEFAULT,
  BUILDER_RIGHT_MAX,
  BUILDER_RIGHT_MIN,
} from '@/lib/builder-panel-sizes';
import { useResumeAutoRefresh } from '@/lib/resume/use-resume-auto-refresh';
import { ResumeSnapshotProvider } from '@/lib/resume-snapshot-context';
import storage, { type TBuilderPanelPrefs } from '@/lib/storage';
import type { TContentTemplate } from '@/types/business/content-template';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import BuilderTopBar, { type TSaveStatus } from './_components/builder-top-bar';
import CenterPanel from './_components/center-panel';
import { ResumeCoverCapture } from './_components/resume-cover-capture';
import ResumeCoverPreviewDebug from './_components/resume-cover-preview-debug';
import LeftPanel from './_components/left-panel';
import ResizeHandle from './_components/resize-handle';
import RightPanel from './_components/right-panel';

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
  useResumeAutoRefresh(resumeId);

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

  const [panelPrefs, setPanelPrefs] = useState<TBuilderPanelPrefs>({
    leftWidth: BUILDER_LEFT_DEFAULT,
    rightWidth: BUILDER_RIGHT_DEFAULT,
    leftOpen: true,
    rightOpen: true,
  });
  const persistWidthsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const latestPanelPrefsRef = useRef(panelPrefs);

  useEffect(() => {
    latestPanelPrefsRef.current = panelPrefs;
  }, [panelPrefs]);

  useEffect(() => {
    const { leftWidth, rightWidth, leftOpen, rightOpen } =
      storage.getBuilderPanelPrefs();
    startTransition(() => {
      setPanelPrefs({
        leftWidth,
        rightWidth,
        leftOpen,
        rightOpen,
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (persistWidthsTimerRef.current == null) return;
      clearTimeout(persistWidthsTimerRef.current);
      persistWidthsTimerRef.current = null;
      storage.setBuilderPanelPrefs(latestPanelPrefsRef.current);
    };
  }, []);

  const schedulePersistPanelPrefs = useCallback(() => {
    if (persistWidthsTimerRef.current != null) {
      clearTimeout(persistWidthsTimerRef.current);
    }
    persistWidthsTimerRef.current = setTimeout(() => {
      persistWidthsTimerRef.current = null;
      storage.setBuilderPanelPrefs(latestPanelPrefsRef.current);
    }, 200);
  }, []);

  const setLeftWidth = useCallback(
    (w: number) => {
      setPanelPrefs((prev) => {
        const next = { ...prev, leftWidth: w };
        latestPanelPrefsRef.current = next;
        schedulePersistPanelPrefs();
        return next;
      });
    },
    [schedulePersistPanelPrefs],
  );

  const setRightWidth = useCallback(
    (w: number) => {
      setPanelPrefs((prev) => {
        const next = { ...prev, rightWidth: w };
        latestPanelPrefsRef.current = next;
        schedulePersistPanelPrefs();
        return next;
      });
    },
    [schedulePersistPanelPrefs],
  );

  const toggleLeftOpen = useCallback(() => {
    setPanelPrefs((prev) => {
      const next = { ...prev, leftOpen: !prev.leftOpen };
      latestPanelPrefsRef.current = next;
      storage.patchBuilderPanelPrefs({ leftOpen: next.leftOpen });
      return next;
    });
  }, []);

  const toggleRightOpen = useCallback(() => {
    setPanelPrefs((prev) => {
      const next = { ...prev, rightOpen: !prev.rightOpen };
      latestPanelPrefsRef.current = next;
      storage.patchBuilderPanelPrefs({ rightOpen: next.rightOpen });
      return next;
    });
  }, []);

  const { leftWidth, rightWidth, leftOpen, rightOpen } = panelPrefs;

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
        onToggleLeftPanel={toggleLeftOpen}
        onToggleRightPanel={toggleRightOpen}
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
              minWidth={BUILDER_LEFT_MIN}
              maxWidth={BUILDER_LEFT_MAX}
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
              minWidth={BUILDER_RIGHT_MIN}
              maxWidth={BUILDER_RIGHT_MAX}
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
