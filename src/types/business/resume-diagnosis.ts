/** JD 文本来源（与后端 `ResumeDiagnosisReportDto.jdSource` 一致） */
export type TResumeJdSource =
  | 'resume_field'
  | 'global_context'
  | 'generated_web'
  | 'inferred'
  | 'missing';

export type TResumeEvaluationDimensionItem = {
  name: string;
  description: string;
};

export type TResumeDimensionScoreItem = {
  name: string;
  /** 0～100 */
  score: number;
  comment: string;
};

export type TResumeContentSuggestionOperation = 'delete' | 'expand' | 'simplify';

export type TResumeContentSuggestionItem = {
  sectionId: number;
  contentOrder: number;
  operation: TResumeContentSuggestionOperation;
  reason: string;
  suggestion: string;
};

export type TResumeOverallAddSuggestionTarget = 'resume' | 'section';

export type TResumeOverallAddSuggestionItem = {
  target: TResumeOverallAddSuggestionTarget;
  /** `target === 'section'` 时通常为对应模块 ID；OpenAPI 中类型标注不精确，此处按语义为 number | null */
  sectionId?: number | null;
  reason: string;
  suggestion: string;
};

/** 简历 AI 诊断报告（同步接口返回的 `report`） */
export type TResumeDiagnosisReport = {
  jdText: string;
  jdSource: TResumeJdSource;
  writingApproach: string;
  evaluationDimensions: TResumeEvaluationDimensionItem[];
  dimensionScores: TResumeDimensionScoreItem[];
  overallScore: number;
  overallComment: string;
  contentSuggestions: TResumeContentSuggestionItem[];
  overallAddSuggestions: TResumeOverallAddSuggestionItem[];
};
