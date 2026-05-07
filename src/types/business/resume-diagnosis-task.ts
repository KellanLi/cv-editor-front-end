import type { TResumeDiagnosisReport } from '@/types/business/resume-diagnosis';

export type TResumeDiagnosisTaskStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type TResumeDiagnosisTaskSnapshot = {
  resumeId: number;
  taskId: string;
  status: TResumeDiagnosisTaskStatus;
  startedAt: number;
  updatedAt: number;
  errorMessage?: string;
  report?: TResumeDiagnosisReport;
  reportCachedAt?: number;
};
