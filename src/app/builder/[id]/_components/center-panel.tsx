'use client';

import type { TContentTemplate } from '@/types/business/content-template';
import type { TResume } from '@/types/business/resume';
import type { TSection } from '@/types/business/section';
import { Button, ButtonGroup, EmptyState, Spinner } from '@heroui/react';
import { Minus, Plus } from 'lucide-react';
import { forwardRef, useCallback, useState, type CSSProperties } from 'react';
import CustomSectionModule from './custom-section-module';
import ProfileModule from './profile-module';

/** 与 A4 预览区的设计宽度一致，不再随侧栏拉宽而拉伸 */
const RESUME_CANVAS_WIDTH_PX = 820;

const ZOOM = {
  min: 0.5,
  max: 1.5,
  step: 0.1,
} as const;

interface IProps {
  resumeId: number | null;
  resume: TResume | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  /** 与 `RightPanel` 共用同一份有序模块列表 */
  sections: TSection[];
  sectionsPending?: boolean;
  sectionsError?: Error | null;
  /** 父级统一查询的模版查找表，用于渲染 `SectionRender` 所需 `contentTemplate` */
  contentTemplateMap: Map<number, TContentTemplate>;
}

const CenterPanel = forwardRef<HTMLDivElement, IProps>(
  function CenterPanel(props, ref) {
    const {
      resumeId,
      resume,
      isPending,
      isError,
      error,
      sections,
      sectionsPending,
      sectionsError,
      contentTemplateMap,
    } = props;

    const [zoom, setZoom] = useState(1);

    const onZoomIn = useCallback(() => {
      setZoom((z) => Math.min(ZOOM.max, Math.round((z + ZOOM.step) * 10) / 10));
    }, []);

    const onZoomOut = useCallback(() => {
      setZoom((z) => Math.max(ZOOM.min, Math.round((z - ZOOM.step) * 10) / 10));
    }, []);

    return (
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col print:h-auto print:min-h-0">
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden print:overflow-visible">
          <div className="absolute inset-0 overflow-auto print:static print:inset-auto print:h-auto print:overflow-visible">
            {/*
              `w-max min-w-full`：横向可滚区域宽度取 max(视口, 简历布局宽)，避免居中 + zoom 时
              仅用 `w-full min-w-0` 导致 scrollWidth 偏小、滑到最左仍裁切左侧内容。
              `px-8`：左右留白，滑到边缘时仍有呼吸空间。
            */}
            <div className="flex w-max min-w-full flex-col items-center px-8 py-8 print:w-full print:min-w-0 print:px-0 print:py-0">
              <div
                ref={ref}
                data-resume-capture-root
                className="resume-print-root flex min-h-[1120px] shrink-0 flex-col rounded-lg bg-white p-10 shadow-sm print:min-h-0 print:rounded-none print:px-6 print:pt-4 print:pb-6 print:shadow-none"
                style={
                  {
                    width: RESUME_CANVAS_WIDTH_PX,
                    '--resume-preview-zoom': String(zoom),
                  } as CSSProperties
                }
              >
                {resumeId == null ? (
                  <EmptyState className="border-default-300 min-h-48 rounded-2xl border border-dashed">
                    <p className="text-muted text-center text-sm">
                      无法加载此简历。请从列表重新进入，或检查链接是否有效。
                    </p>
                  </EmptyState>
                ) : isPending ? (
                  <div className="text-muted flex min-h-48 items-center justify-center gap-2 text-sm">
                    <Spinner size="lg" />
                    加载中…
                  </div>
                ) : isError ? (
                  <p className="text-danger text-sm" role="alert">
                    {error?.message || '简历加载失败'}
                  </p>
                ) : (
                  <>
                    <div className="print:break-inside-avoid">
                      <ProfileModule
                        key={resumeId}
                        resumeId={resumeId}
                        profile={resume?.profile}
                      />
                    </div>

                    {sectionsPending ? (
                      <div className="text-muted flex min-h-24 items-center justify-center gap-2 text-sm">
                        <Spinner size="md" />
                        加载模块…
                      </div>
                    ) : sectionsError ? (
                      <p className="text-danger text-sm" role="alert">
                        {sectionsError.message}
                      </p>
                    ) : (
                      sections.map((section) => (
                        <div
                          key={section.id}
                          className="print:break-inside-avoid"
                        >
                          <CustomSectionModule
                            resumeId={resumeId}
                            section={section}
                            contentTemplate={contentTemplateMap.get(
                              section.contentTemplateId,
                            )}
                          />
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className="print:hidden pointer-events-none absolute right-8 bottom-8 z-20 max-w-[calc(100%-2rem)]"
            role="group"
            aria-label="简历预览缩放"
          >
            <ButtonGroup
              className="pointer-events-auto"
              size="sm"
              variant="tertiary"
            >
              <Button
                isIconOnly
                aria-label="缩小预览"
                isDisabled={zoom <= ZOOM.min}
                onPress={onZoomOut}
              >
                <Minus className="size-4" />
              </Button>
              <Button
                isIconOnly
                aria-label="放大预览"
                isDisabled={zoom >= ZOOM.max}
                onPress={onZoomIn}
              >
                <ButtonGroup.Separator />
                <Plus className="size-4" />
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    );
  },
);

export default CenterPanel;
