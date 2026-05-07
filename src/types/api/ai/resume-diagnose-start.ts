import type { TResumeDiagnosisTaskStatus } from '@/types/business/resume-diagnosis-task';

export type TAiResumeDiagnoseStartReq = {
  resumeId: number;
  /** 无 JD 时用于联网检索或推断的岗位方向；可空，将使用简历档案中的目标岗位或简历标题 */
  targetRole?: string;
  /** 是否在无 JD 时尝试用 Tavily 检索岗位信息以生成参考 JD（需服务端配置） */
  enableWebSearch?: boolean;
};

export type TAiResumeDiagnoseStartRes = {
  taskId: string;
  status: TResumeDiagnosisTaskStatus;
  createdAt: string;
  updatedAt: string;
};
