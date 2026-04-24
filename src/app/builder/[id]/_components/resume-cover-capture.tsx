'use client';

import { updateListCover } from '@/apis/resume';
import { upload } from '@/apis/storage';
import { buildResumeContentFingerprint } from '@/lib/build-resume-content-fingerprint';
import { captureResumeCoverToPng } from '@/lib/capture-resume-cover';
import { resumeQueryKey } from '@/lib/builder-resume-keys';
import { logResumeCoverError } from '@/lib/resume-cover-error-log';
import { useResumeSnapshotOptional } from '@/lib/resume-snapshot-context';
import type { TResume } from '@/types/business/resume';
import type { TSection } from '@/types/business/section';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { RefObject } from 'react';

const COVER_DEBOUNCE_MS = 7000;
const CAPTURE_SCALE = 1.25;

type IProps = {
  captureRootRef: RefObject<HTMLElement | null>;
  resumeId: number | null;
  resume: TResume | undefined;
  sections: TSection[];
  /** 简历与模块均已加载且无致命错误，且中间栏展示正文（非空状态页） */
  ready: boolean;
};

export function ResumeCoverCapture(props: IProps) {
  const { captureRootRef, resumeId, resume, sections, ready } = props;
  const queryClient = useQueryClient();
  const snapshot = useResumeSnapshotOptional();

  const inFlight = useRef(false);
  const lastDoneFingerprint = useRef<string | null>(null);
  const resumeRef = useRef(resume);
  const sectionsRef = useRef(sections);
  resumeRef.current = resume;
  sectionsRef.current = sections;

  useEffect(() => {
    lastDoneFingerprint.current = null;
  }, [resumeId]);

  const readyRef = useRef(ready);
  const snapshotRef = useRef(snapshot);
  readyRef.current = ready;
  snapshotRef.current = snapshot;

  const runCapture = useCallback(async () => {
    if (!readyRef.current || !snapshotRef.current || !resumeId) return;
    if (inFlight.current) return;
    /**
     * 禁止在**后台卡**里跑 html2canvas：否则与切 tab / 回前台 抢主线程，表现为「切走再切回必卡」。
     * 与 debounce 定时器、切回后 requestIdleCallback 见下方配合。
     */
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }
    const key = buildResumeContentFingerprint(
      resumeRef.current,
      sectionsRef.current,
    );
    if (!key) return;
    if (key === lastDoneFingerprint.current) return;
    const el = captureRootRef.current;
    if (!el) return;
    inFlight.current = true;
    try {
      await snapshotRef.current.exitAllToView();
      await new Promise<void>((r) => {
        setTimeout(r, 0);
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
      const el2 = captureRootRef.current;
      if (!el2) return;
      const blob = await captureResumeCoverToPng(el2, {
        scale: CAPTURE_SCALE,
      });
      const file = new File(
        [blob],
        `resume-${resumeId}-cover.png`,
        { type: 'image/png' },
      );
      const up = await upload(file);
      if (up.code !== 0 || !up.data?.url) {
        return;
      }
      const res = await updateListCover({
        id: resumeId,
        listCoverImageUrl: up.data.url,
      });
      if (res.code !== 0) {
        return;
      }
      lastDoneFingerprint.current = buildResumeContentFingerprint(
        resumeRef.current,
        sectionsRef.current,
      );
      void queryClient.invalidateQueries({ queryKey: ['resume-list'] });
      void queryClient.invalidateQueries({ queryKey: resumeQueryKey(resumeId) });
    } catch (e) {
      logResumeCoverError('自动上传封面', e);
    } finally {
      inFlight.current = false;
    }
  }, [captureRootRef, queryClient, resumeId]);

  const fingerprint = buildResumeContentFingerprint(resume, sections);
  const fingerprintRef = useRef(fingerprint);
  fingerprintRef.current = fingerprint;

  const runCaptureRef = useRef(runCapture);
  runCaptureRef.current = runCapture;

  /**
   * 仅当 `fingerprint` / `ready` 变时重设 7s 定时器。勿把 `runCapture`、`snapshot` 等放进依赖：
   * 父级重渲染时 Context 新对象、回调 identity 等曾导致 effect 不断 cleanup，定时器**永远无法触发**。
   */
  useEffect(() => {
    if (!ready || !snapshot) return;
    if (!fingerprint) return;
    if (fingerprint === lastDoneFingerprint.current) return;
    const t = setTimeout(() => {
      if (fingerprintRef.current === lastDoneFingerprint.current) return;
      void runCaptureRef.current();
    }, COVER_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [fingerprint, ready, snapshot]);

  useEffect(() => {
    let idleId: number | null = null;
    let afterVisibleTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const clearScheduled = () => {
      if (idleId != null) {
        cancelIdleCallback(idleId);
        idleId = null;
      }
      if (afterVisibleTimeoutId != null) {
        clearTimeout(afterVisibleTimeoutId);
        afterVisibleTimeoutId = null;
      }
    };
    const onVis = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      if (fingerprintRef.current === lastDoneFingerprint.current) {
        return;
      }
      clearScheduled();
      const schedule = () => {
        void runCaptureRef.current();
      };
      if (typeof requestIdleCallback === 'function') {
        idleId = requestIdleCallback(schedule, { timeout: 4000 });
      } else {
        afterVisibleTimeoutId = setTimeout(schedule, 400);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearScheduled();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return null;
}
