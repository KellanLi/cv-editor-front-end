import type { TResumeDiagnosisReport } from '@/types/business/resume-diagnosis';
import type { TResumeDiagnosisTaskStatus } from '@/types/business/resume-diagnosis-task';

export type TAiResumeDiagnoseStatusReq = {
  taskId: string;
};

export type TAiResumeDiagnoseStatusRes = {
  taskId: string;
  resumeId: number;
  status: TResumeDiagnosisTaskStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  report?: TResumeDiagnosisReport;
};
