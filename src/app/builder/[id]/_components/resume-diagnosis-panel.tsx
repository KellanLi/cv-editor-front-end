'use client';

import {
  getResumeDiagnoseTaskStatus,
  startResumeDiagnoseTask,
} from '@/apis/ai';
import storage from '@/lib/storage';
import type {
  TResumeContentSuggestionOperation,
  TResumeDiagnosisReport,
  TResumeJdSource,
} from '@/types/business/resume-diagnosis';
import type { TResumeDiagnosisTaskStatus } from '@/types/business/resume-diagnosis-task';
import { Button, Spinner } from '@heroui/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const JD_SOURCE_LABELS: Record<TResumeJdSource, string> = {
  resume_field: '简历字段',
  global_context: '全局上下文',
  generated_web: '联网检索生成',
  inferred: '模型推断',
  missing: '暂无',
};

const OPERATION_LABELS: Record<TResumeContentSuggestionOperation, string> = {
  delete: '删减',
  expand: '扩展',
  simplify: '精简',
};

function scoreHue(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
}

function formatRemainingDuration(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}小时${minutes.toString().padStart(2, '0')}分${seconds
    .toString()
    .padStart(2, '0')}秒`;
}

function DiagnosisReportView(props: {
  report: TResumeDiagnosisReport;
  sectionLabel: (sectionId: number) => string;
}) {
  const { report, sectionLabel } = props;

  return (
    <div className="flex flex-col gap-4 pb-2">
      <section className="border-default-200 bg-content1 rounded-xl border p-4">
        <h3 className="text-foreground mb-2 text-sm font-semibold">参考 JD</h3>
        <p className="text-muted mb-2 text-xs">
          来源：
          <span className="text-foreground font-medium">
            {JD_SOURCE_LABELS[report.jdSource]}
          </span>
        </p>
        <pre className="text-foreground max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-black/5 p-3 text-xs leading-relaxed dark:bg-white/10">
          {report.jdText || '（空）'}
        </pre>
      </section>

      <section className="border-default-200 bg-content1 rounded-xl border p-4">
        <h3 className="text-foreground mb-2 text-sm font-semibold">编写思路</h3>
        <p className="text-foreground text-sm leading-relaxed">
          {report.writingApproach}
        </p>
      </section>

      <section className="border-default-200 bg-content1 rounded-xl border p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">评价维度</h3>
        <ul className="flex flex-col gap-2">
          {report.evaluationDimensions.map((d) => (
            <li
              key={d.name}
              className="border-default-100 rounded-lg border px-3 py-2"
            >
              <p className="text-foreground text-sm font-medium">{d.name}</p>
              <p className="text-muted mt-0.5 text-xs leading-relaxed">
                {d.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-default-200 bg-content1 rounded-xl border p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">维度得分</h3>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-muted text-xs">综合</span>
          <span
            className={`text-3xl font-semibold tabular-nums ${scoreHue(report.overallScore)}`}
          >
            {report.overallScore}
          </span>
          <span className="text-muted text-sm">/ 100</span>
        </div>
        <ul className="flex flex-col gap-3">
          {report.dimensionScores.map((row) => (
            <li key={row.name}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-foreground text-sm font-medium">
                  {row.name}
                </span>
                <span
                  className={`text-sm font-semibold tabular-nums ${scoreHue(row.score)}`}
                >
                  {row.score}
                </span>
              </div>
              <p className="text-muted text-xs leading-relaxed">{row.comment}</p>
            </li>
          ))}
        </ul>
        <div className="border-default-100 mt-4 border-t pt-3">
          <p className="text-muted mb-1 text-xs font-medium">总评</p>
          <p className="text-foreground text-sm leading-relaxed">
            {report.overallComment}
          </p>
        </div>
      </section>

      <section className="border-default-200 bg-content1 rounded-xl border p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">
          分块修改建议
        </h3>
        {report.contentSuggestions.length === 0 ? (
          <p className="text-muted text-sm">暂无</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {report.contentSuggestions.map((item, idx) => (
              <li
                key={`${item.sectionId}-${item.contentOrder}-${idx}`}
                className="border-default-100 rounded-lg border p-3"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-foreground text-xs font-medium">
                    {sectionLabel(item.sectionId)}
                  </span>
                  <span className="text-muted text-xs">
                    内容序 {item.contentOrder}
                  </span>
                  <span
                    className={
                      item.operation === 'delete'
                        ? 'text-danger bg-danger/10 rounded px-1.5 py-0.5 text-[11px] font-medium'
                        : item.operation === 'expand'
                          ? 'bg-primary/15 text-primary rounded px-1.5 py-0.5 text-[11px] font-medium'
                          : 'bg-default-100 text-default-700 rounded px-1.5 py-0.5 text-[11px] font-medium'
                    }
                  >
                    {OPERATION_LABELS[item.operation]}
                  </span>
                </div>
                <p className="text-muted mb-1 text-xs">
                  <span className="font-medium text-foreground/80">原因 </span>
                  {item.reason}
                </p>
                <p className="text-foreground text-sm leading-relaxed">
                  {item.suggestion}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-default-200 bg-content1 rounded-xl border p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">
          整体增补建议
        </h3>
        {report.overallAddSuggestions.length === 0 ? (
          <p className="text-muted text-sm">暂无</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {report.overallAddSuggestions.map((item, idx) => (
              <li
                key={`${item.target}-${item.sectionId ?? 'x'}-${idx}`}
                className="border-default-100 rounded-lg border p-3"
              >
                <p className="text-muted mb-2 text-xs">
                  {item.target === 'resume' ? (
                    <span className="bg-default-100 text-default-700 rounded px-1.5 py-0.5 font-medium">
                      简历整体
                    </span>
                  ) : (
                    <span className="space-x-1">
                      <span className="bg-primary/15 text-primary rounded px-1.5 py-0.5 font-medium">
                        指定模块
                      </span>
                      {item.sectionId != null ? (
                        <span className="text-foreground">
                          {sectionLabel(item.sectionId)}
                        </span>
                      ) : null}
                    </span>
                  )}
                </p>
                <p className="text-muted mb-1 text-xs">
                  <span className="font-medium text-foreground/80">原因 </span>
                  {item.reason}
                </p>
                <p className="text-foreground text-sm leading-relaxed">
                  {item.suggestion}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type TProps = {
  resumeId: number | null;
  sectionLabel: (sectionId: number) => string;
};

export default function ResumeDiagnosisPanel(props: TProps) {
  const { resumeId, sectionLabel } = props;
  const [taskId, setTaskId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<TResumeDiagnosisTaskStatus | 'idle'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TResumeDiagnosisReport | null>(null);
  const [reportCachedAt, setReportCachedAt] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const pollTokenRef = useRef(0);

  const persistSnapshot = useCallback(
    (next: {
      taskId: string;
      startedAt: number;
      status: TResumeDiagnosisTaskStatus;
      errorMessage?: string;
      report?: TResumeDiagnosisReport;
      reportCachedAt?: number;
    }) => {
      if (resumeId == null) return;
      storage.upsertBuilderResumeDiagnosisItem({
        resumeId,
        taskId: next.taskId,
        startedAt: next.startedAt,
        updatedAt: Date.now(),
        status: next.status,
        errorMessage: next.errorMessage,
        report: next.report,
        reportCachedAt: next.reportCachedAt,
      });
    },
    [resumeId],
  );

  const stopPolling = useCallback(() => {
    pollTokenRef.current += 1;
  }, []);

  const runStatusPolling = useCallback(
    async (inputTaskId: string, taskStartedAt: number) => {
      if (resumeId == null) return;
      const pollingToken = pollTokenRef.current + 1;
      pollTokenRef.current = pollingToken;

      for (;;) {
        if (pollTokenRef.current !== pollingToken) return;

        if (Date.now() - taskStartedAt > POLL_TIMEOUT_MS) {
          const timeoutMessage =
            '诊断任务耗时较长，已暂停自动轮询。稍后可重新进入页面继续查看。';
          setTaskStatus('failed');
          setError(timeoutMessage);
          persistSnapshot({
            taskId: inputTaskId,
            startedAt: taskStartedAt,
            status: 'failed',
            errorMessage: timeoutMessage,
          });
          return;
        }

        let shouldContinue = false;
        try {
          const res = await getResumeDiagnoseTaskStatus({ taskId: inputTaskId });
          if (res.code !== 0) {
            throw new Error(res.message || '查询诊断状态失败');
          }
          if (!res.data) {
            throw new Error('未返回诊断任务状态');
          }
          const data = res.data;
          if (data.resumeId !== resumeId) {
            throw new Error('诊断任务与当前简历不一致');
          }

          setTaskStatus(data.status);
          setError(
            data.status === 'failed'
              ? data.errorMessage || '诊断失败'
              : data.status === 'cancelled'
                ? '诊断任务已取消'
                : null,
          );

          if (data.status === 'succeeded') {
            if (!data.report) {
              throw new Error('诊断已完成但未返回报告');
            }
            setReport(data.report);
            persistSnapshot({
              taskId: inputTaskId,
              startedAt: taskStartedAt,
              status: 'succeeded',
              report: data.report,
              reportCachedAt: Date.now(),
            });
            setReportCachedAt(Date.now());
            return;
          }

          if (data.status === 'failed' || data.status === 'cancelled') {
            persistSnapshot({
              taskId: inputTaskId,
              startedAt: taskStartedAt,
              status: data.status,
              errorMessage:
                data.errorMessage ||
                (data.status === 'cancelled' ? '诊断任务已取消' : '诊断失败'),
            });
            return;
          }

          persistSnapshot({
            taskId: inputTaskId,
            startedAt: taskStartedAt,
            status: data.status,
          });
          shouldContinue = true;
        } catch (e) {
          const message = e instanceof Error ? e.message : '查询诊断状态失败';
          setTaskStatus('failed');
          setError(message);
          persistSnapshot({
            taskId: inputTaskId,
            startedAt: taskStartedAt,
            status: 'failed',
            errorMessage: message,
          });
          return;
        }

        if (!shouldContinue) return;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    },
    [persistSnapshot, resumeId],
  );

  const runDiagnose = useCallback(async () => {
    if (resumeId == null) return;
    stopPolling();
    setTaskStatus('queued');
    setError(null);
    setReport(null);
    setReportCachedAt(null);
    try {
      const res = await startResumeDiagnoseTask({ resumeId });
      if (res.code !== 0) {
        setError(res.message || '诊断失败');
        setTaskStatus('failed');
        return;
      }
      if (!res.data?.taskId) {
        setTaskStatus('failed');
        setError('未返回诊断任务 ID');
        return;
      }
      const startedAtMs = Date.parse(res.data.createdAt);
      const nextStartedAt = Number.isFinite(startedAtMs)
        ? startedAtMs
        : Date.now();
      setTaskId(res.data.taskId);
      setStartedAt(nextStartedAt);
      setTaskStatus(res.data.status);
      persistSnapshot({
        taskId: res.data.taskId,
        startedAt: nextStartedAt,
        status: res.data.status,
      });
      void runStatusPolling(res.data.taskId, nextStartedAt);
    } catch (e) {
      setTaskStatus('failed');
      setError(e instanceof Error ? e.message : '请求失败');
    }
  }, [persistSnapshot, resumeId, runStatusPolling, stopPolling]);

  useEffect(() => {
    stopPolling();
    setTaskId(null);
    setStartedAt(null);
    setTaskStatus('idle');
    setError(null);
    setReport(null);
    setReportCachedAt(null);
    if (resumeId == null) return;

    const snapshot = storage.getBuilderResumeDiagnosisState()[resumeId];
    if (!snapshot) return;

    setTaskId(snapshot.taskId);
    setStartedAt(snapshot.startedAt);
    setTaskStatus(snapshot.status);
    setError(snapshot.errorMessage ?? null);
    if (snapshot.status === 'succeeded' && snapshot.report && snapshot.reportCachedAt) {
      if (Date.now() - snapshot.reportCachedAt < CACHE_TTL_MS) {
        setReport(snapshot.report);
        setReportCachedAt(snapshot.reportCachedAt);
      } else {
        storage.clearBuilderResumeDiagnosisItem(resumeId);
      }
    } else {
      setReport(snapshot.report ?? null);
      setReportCachedAt(snapshot.reportCachedAt ?? null);
    }

    if (snapshot.status === 'queued' || snapshot.status === 'running') {
      void runStatusPolling(snapshot.taskId, snapshot.startedAt);
    }
  }, [resumeId, runStatusPolling, stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (resumeId == null || reportCachedAt == null || report == null) return;
    if (nowTs - reportCachedAt < CACHE_TTL_MS) return;
    storage.clearBuilderResumeDiagnosisItem(resumeId);
    setReport(null);
    setReportCachedAt(null);
    setTaskId(null);
    setStartedAt(null);
    setTaskStatus('idle');
    setError('AI 诊断缓存已过期，请重新运行诊断。');
  }, [nowTs, report, reportCachedAt, resumeId]);

  const pending = taskStatus === 'queued' || taskStatus === 'running';
  const cacheRemainingMs =
    reportCachedAt != null ? reportCachedAt + CACHE_TTL_MS - nowTs : null;

  if (resumeId == null) {
    return (
      <div className="border-default-200 rounded-xl border border-dashed p-6 text-center">
        <p className="text-muted text-sm">请先加载简历</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0">
        <Button
          className="w-full"
          variant="primary"
          onPress={runDiagnose}
          isDisabled={pending}
        >
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="size-4" />
              诊断中…
            </span>
          ) : (
            '运行 AI 诊断'
          )}
        </Button>
      </div>

      {pending && taskId ? (
        <p className="text-muted shrink-0 text-xs">
          任务 ID：{taskId}
          {startedAt != null ? `（开始于 ${new Date(startedAt).toLocaleString()}）` : ''}
        </p>
      ) : null}

      {error ? (
        <p className="text-danger shrink-0 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {report && cacheRemainingMs != null && cacheRemainingMs > 0 ? (
        <p className="text-primary shrink-0 text-xs">
          诊断缓存剩余有效期：{formatRemainingDuration(cacheRemainingMs)}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {report ? (
          <DiagnosisReportView report={report} sectionLabel={sectionLabel} />
        ) : (
          <p className="text-muted py-6 text-center text-sm">
            点击上方按钮生成诊断报告
          </p>
        )}
      </div>
    </div>
  );
}
