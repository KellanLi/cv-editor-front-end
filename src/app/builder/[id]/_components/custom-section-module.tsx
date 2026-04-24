'use client';

import { updateContent } from '@/apis/section';
import SectionRender from '@/components/section-render';
import { resumeSectionsQueryKey } from '@/lib/builder-resume-keys';
import type {
  TUpdateSectionContentItemReq,
  TUpdateSectionContentReq,
} from '@/types/api/section/update-content';
import type { TContent } from '@/types/business/content';
import type { TContentTemplate } from '@/types/business/content-template';
import type { TSection } from '@/types/business/section';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRegisterResumeSnapshotExit } from '@/lib/resume-snapshot-context';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from 'react';

type TModuleStatus = 'view' | 'edit';

function sortContents(contents: TContent[]): TContent[] {
  return [...contents].sort((a, b) => a.order - b.order);
}

/** 保存时重新编号为 1..N，满足后端「按 order 升序」约定 */
function toUpdatePayload(
  sectionId: number,
  contents: TContent[],
): TUpdateSectionContentReq {
  const items: TUpdateSectionContentItemReq[] = contents.map((c, ci) => ({
    order: ci + 1,
    infos: c.infos.map((info, ii) => ({
      order: ii + 1,
      type: info.type,
      values: info.values,
    })),
  }));
  return { sectionId, contents: items };
}

interface IProps {
  resumeId: number;
  section: TSection;
  /** 可缺省：父级查找表尚未就绪时渲染占位 */
  contentTemplate?: TContentTemplate;
}

/**
 * 自定义模块：包裹 `SectionRender`，对齐 `ProfileModule` 的 view / edit 视觉与交互：
 * view 点击 / Enter / Space 进入 edit，document 捕获「点外部」与 Escape 退出并保存。
 */
export default function CustomSectionModule(props: IProps) {
  const { resumeId, section, contentTemplate } = props;
  const queryClient = useQueryClient();
  const sectionsKey = useMemo(
    () => resumeSectionsQueryKey(resumeId),
    [resumeId],
  );

  const [moduleStatus, setModuleStatus] = useState<TModuleStatus>('view');
  const [draftContents, setDraftContents] = useState<TContent[]>(() =>
    sortContents(section.contents),
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const completeEditRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const viewContents = useMemo(
    () => sortContents(section.contents),
    [section.contents],
  );

  useEffect(() => {
    if (moduleStatus === 'view') {
      setDraftContents(sortContents(section.contents));
    }
  }, [moduleStatus, section.contents]);

  const updateMutation = useMutation({
    mutationFn: updateContent,
  });

  const enterEdit = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      if (!contentTemplate) return;
      setSaveError(null);
      setDraftContents(sortContents(section.contents));
      setModuleStatus('edit');
    },
    [contentTemplate, section.contents],
  );

  const completeEdit = useCallback(async () => {
    setSaveError(null);
    try {
      const res = await updateMutation.mutateAsync(
        toUpdatePayload(section.id, draftContents),
      );
      if (res.code !== 0) {
        setSaveError(res.message || '保存失败');
        return;
      }
      queryClient.setQueryData<TSection[]>(sectionsKey, (prev) => {
        if (!prev) return prev;
        return prev
          .map((s) => (s.id === res.data.id ? res.data : s))
          .sort((a, b) => a.order - b.order);
      });
      setModuleStatus('view');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '保存失败');
    }
  }, [draftContents, queryClient, section.id, sectionsKey, updateMutation]);

  useLayoutEffect(() => {
    completeEditRef.current = completeEdit;
  }, [completeEdit]);

  const exitToViewForSnapshot = useCallback(async () => {
    if (moduleStatus === 'view') return;
    await completeEdit();
  }, [completeEdit, moduleStatus]);

  useRegisterResumeSnapshotExit(`section-${section.id}`, exitToViewForSnapshot);

  useEffect(() => {
    if (moduleStatus !== 'edit') return;
    /** 若点击发生在浮层（日期选择、Modal 等）内则不退出编辑 */
    const isInsideOverlay = (n: Element | null) =>
      !!n?.closest('[role="dialog"], [data-slot="popover"]');
    const onDown = (e: MouseEvent) => {
      const n = e.target;
      if (!(n instanceof Element)) return;
      if (rootRef.current?.contains(n)) return;
      if (isInsideOverlay(n)) return;
      void completeEditRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const active = document.activeElement;
      if (active instanceof Element && isInsideOverlay(active)) return;
      e.preventDefault();
      void completeEditRef.current();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, { capture: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, { capture: true });
    };
  }, [moduleStatus]);

  const renderTemplate = contentTemplate ?? {
    name: section.contentTemplateId ? '加载中…' : '未命名模块',
    infoTemplates: [],
  };

  return (
    <div ref={rootRef} className="w-full max-w-3xl">
      {moduleStatus === 'view' ? (
        <div
          role="button"
          tabIndex={0}
          onClick={enterEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              enterEdit(e);
            }
          }}
          className="cursor-pointer rounded-xl border-2 border-dashed border-transparent p-3 transition-colors outline-none hover:border-sky-400/75 hover:bg-sky-50/95 focus-visible:border-sky-400/75 focus-visible:bg-sky-50/95 sm:p-4"
        >
          <SectionRender
            contentTemplate={renderTemplate}
            status="view"
            contents={viewContents}
            onContentsChange={() => {
              /** view 模式下 SectionRender 不会触发变更 */
            }}
          />
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-sky-400/75 bg-sky-50/95 p-3 sm:p-4">
          {saveError ? (
            <p className="text-danger mb-2 text-xs" role="alert">
              {saveError}
            </p>
          ) : null}
          <SectionRender
            contentTemplate={renderTemplate}
            status="edit"
            contents={draftContents}
            onContentsChange={setDraftContents}
          />
        </div>
      )}
    </div>
  );
}
