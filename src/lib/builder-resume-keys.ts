/** 简历编辑页 `resume/detail` 缓存 */
export function resumeQueryKey(resumeId: number | null) {
  return ['resume', resumeId] as const;
}

/** 简历下模块列表，来自 `section/list`（与 `resume/detail` 分开查） */
export function resumeSectionsQueryKey(resumeId: number | null) {
  return ['resume-sections', resumeId] as const;
}

/** 简历在 AI 左栏的会话列表，来自 `ai/conversation/list` */
export function resumeAiConversationsQueryKey(
  resumeId: number | null,
  page: number = 1,
) {
  return ['resume-ai-conversations', resumeId, page] as const;
}
