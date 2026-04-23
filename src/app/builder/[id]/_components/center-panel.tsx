'use client';

import type { TResume } from '@/types/business/resume';
import { EmptyState, Spinner } from '@heroui/react';
import ProfileModule from './profile-module';

interface IProps {
  resumeId: number | null;
  resume: TResume | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

export default function CenterPanel(props: IProps) {
  const { resumeId, resume, isPending, isError, error } = props;

  return (
    <div className="flex h-full min-h-0 flex-col items-center overflow-y-auto py-8">
      <div className="flex min-h-[1120px] w-full max-w-[820px] flex-col gap-6 rounded-lg bg-white p-10 shadow-sm">
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
          <ProfileModule
            key={resumeId}
            resumeId={resumeId}
            profile={resume?.profile}
          />
        )}
      </div>
    </div>
  );
}
