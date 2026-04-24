'use client';

import type { TContentTemplate } from '@/types/business/content-template';
import type { TResume } from '@/types/business/resume';
import type { TSection } from '@/types/business/section';
import { EmptyState, Spinner } from '@heroui/react';
import CustomSectionModule from './custom-section-module';
import ProfileModule from './profile-module';

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

export default function CenterPanel(props: IProps) {
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

  return (
    <div className="flex h-full min-h-0 flex-col items-center overflow-y-auto py-8">
      <div className="flex w-full min-h-[1120px] shrink-0 max-w-[820px] flex-col rounded-lg bg-white p-10 shadow-sm">
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
            <ProfileModule
              key={resumeId}
              resumeId={resumeId}
              profile={resume?.profile}
            />

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
                <CustomSectionModule
                  key={section.id}
                  resumeId={resumeId}
                  section={section}
                  contentTemplate={contentTemplateMap.get(
                    section.contentTemplateId,
                  )}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
