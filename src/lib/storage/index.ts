import {
  BUILDER_LEFT_DEFAULT,
  BUILDER_RIGHT_DEFAULT,
  clampBuilderLeftWidth,
  clampBuilderRightWidth,
} from '@/lib/builder-panel-sizes';
import type { TResumeDiagnosisTaskSnapshot } from '@/types/business/resume-diagnosis-task';
import { STORAGE_KEY } from './const';
import { TToken } from '@/types/business/token';

export type TBuilderAiChatPrefs = {
  mode: 'ask' | 'agent';
  enableWebSearch: boolean;
};

const DEFAULT_BUILDER_AI_CHAT: TBuilderAiChatPrefs = {
  mode: 'ask',
  enableWebSearch: false,
};

export type TBuilderPanelPrefs = {
  leftWidth: number;
  rightWidth: number;
  leftOpen: boolean;
  rightOpen: boolean;
};

function parseBuilderPanelPrefs(raw: string | null): TBuilderPanelPrefs {
  const fallback: TBuilderPanelPrefs = {
    leftWidth: BUILDER_LEFT_DEFAULT,
    rightWidth: BUILDER_RIGHT_DEFAULT,
    leftOpen: true,
    rightOpen: true,
  };
  if (raw == null) return fallback;
  try {
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o == null) return fallback;
    const rec = o as Record<string, unknown>;
    const leftRaw = rec.leftWidth ?? rec.left;
    const rightRaw = rec.rightWidth ?? rec.right;
    const leftWidth =
      typeof leftRaw === 'number' && Number.isFinite(leftRaw)
        ? clampBuilderLeftWidth(leftRaw)
        : fallback.leftWidth;
    const rightWidth =
      typeof rightRaw === 'number' && Number.isFinite(rightRaw)
        ? clampBuilderRightWidth(rightRaw)
        : fallback.rightWidth;
    const leftOpen =
      typeof rec.leftOpen === 'boolean' ? rec.leftOpen : fallback.leftOpen;
    const rightOpen =
      typeof rec.rightOpen === 'boolean' ? rec.rightOpen : fallback.rightOpen;
    return { leftWidth, rightWidth, leftOpen, rightOpen };
  } catch {
    return fallback;
  }
}

function parseBuilderAiChatPrefs(raw: string | null): TBuilderAiChatPrefs {
  if (raw == null) return DEFAULT_BUILDER_AI_CHAT;
  try {
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o == null) return DEFAULT_BUILDER_AI_CHAT;
    const rec = o as Record<string, unknown>;
    const mode =
      rec.mode === 'agent'
        ? 'agent'
        : rec.mode === 'ask'
          ? 'ask'
          : DEFAULT_BUILDER_AI_CHAT.mode;
    const enableWebSearch =
      typeof rec.enableWebSearch === 'boolean'
        ? rec.enableWebSearch
        : DEFAULT_BUILDER_AI_CHAT.enableWebSearch;
    return { mode, enableWebSearch };
  } catch {
    return DEFAULT_BUILDER_AI_CHAT;
  }
}

function parseBuilderResumeDiagnosisState(
  raw: string | null,
): Record<number, TResumeDiagnosisTaskSnapshot> {
  if (raw == null) return {};
  try {
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o == null) return {};
    const rec = o as Record<string, unknown>;
    const out: Record<number, TResumeDiagnosisTaskSnapshot> = {};
    for (const [k, value] of Object.entries(rec)) {
      const resumeId = Number(k);
      if (!Number.isInteger(resumeId) || resumeId <= 0) continue;
      if (typeof value !== 'object' || value == null) continue;
      const item = value as Record<string, unknown>;
      if (typeof item.taskId !== 'string' || !item.taskId.trim()) continue;
      if (
        item.status !== 'queued' &&
        item.status !== 'running' &&
        item.status !== 'succeeded' &&
        item.status !== 'failed' &&
        item.status !== 'cancelled'
      ) {
        continue;
      }
      const startedAt =
        typeof item.startedAt === 'number' && Number.isFinite(item.startedAt)
          ? item.startedAt
          : Date.now();
      const updatedAt =
        typeof item.updatedAt === 'number' && Number.isFinite(item.updatedAt)
          ? item.updatedAt
          : startedAt;
      out[resumeId] = {
        resumeId,
        taskId: item.taskId,
        status: item.status,
        startedAt,
        updatedAt,
        errorMessage:
          typeof item.errorMessage === 'string' ? item.errorMessage : undefined,
        report: item.report as TResumeDiagnosisTaskSnapshot['report'],
        reportCachedAt:
          typeof item.reportCachedAt === 'number' &&
          Number.isFinite(item.reportCachedAt)
            ? item.reportCachedAt
            : undefined,
      };
    }
    return out;
  } catch {
    return {};
  }
}

const storage = {
  setToken: (param: TToken) => {
    localStorage.setItem(STORAGE_KEY.TOKEN, JSON.stringify(param));
  },
  getToken: (): TToken | null => {
    const jsonStr = localStorage.getItem(STORAGE_KEY.TOKEN);
    return jsonStr ? JSON.parse(jsonStr) : null;
  },
  getBuilderAiChatPrefs: (): TBuilderAiChatPrefs => {
    return parseBuilderAiChatPrefs(
      localStorage.getItem(STORAGE_KEY.BUILDER_AI_CHAT),
    );
  },
  setBuilderAiChatPrefs: (param: TBuilderAiChatPrefs) => {
    localStorage.setItem(STORAGE_KEY.BUILDER_AI_CHAT, JSON.stringify(param));
  },
  getBuilderPanelPrefs: (): TBuilderPanelPrefs => {
    return parseBuilderPanelPrefs(
      localStorage.getItem(STORAGE_KEY.BUILDER_PANEL_WIDTHS),
    );
  },
  setBuilderPanelPrefs: (param: TBuilderPanelPrefs) => {
    localStorage.setItem(STORAGE_KEY.BUILDER_PANEL_WIDTHS, JSON.stringify(param));
  },
  patchBuilderPanelPrefs: (patch: Partial<TBuilderPanelPrefs>) => {
    const cur = parseBuilderPanelPrefs(
      localStorage.getItem(STORAGE_KEY.BUILDER_PANEL_WIDTHS),
    );
    localStorage.setItem(
      STORAGE_KEY.BUILDER_PANEL_WIDTHS,
      JSON.stringify({ ...cur, ...patch }),
    );
  },
  getBuilderResumeDiagnosisState: (): Record<
    number,
    TResumeDiagnosisTaskSnapshot
  > => {
    return parseBuilderResumeDiagnosisState(
      localStorage.getItem(STORAGE_KEY.BUILDER_RESUME_DIAGNOSIS),
    );
  },
  setBuilderResumeDiagnosisState: (
    value: Record<number, TResumeDiagnosisTaskSnapshot>,
  ) => {
    localStorage.setItem(
      STORAGE_KEY.BUILDER_RESUME_DIAGNOSIS,
      JSON.stringify(value),
    );
  },
  upsertBuilderResumeDiagnosisItem: (item: TResumeDiagnosisTaskSnapshot) => {
    const cur = parseBuilderResumeDiagnosisState(
      localStorage.getItem(STORAGE_KEY.BUILDER_RESUME_DIAGNOSIS),
    );
    localStorage.setItem(
      STORAGE_KEY.BUILDER_RESUME_DIAGNOSIS,
      JSON.stringify({
        ...cur,
        [item.resumeId]: item,
      }),
    );
  },
  clearBuilderResumeDiagnosisItem: (resumeId: number) => {
    const cur = parseBuilderResumeDiagnosisState(
      localStorage.getItem(STORAGE_KEY.BUILDER_RESUME_DIAGNOSIS),
    );
    if (!(resumeId in cur)) return;
    delete cur[resumeId];
    localStorage.setItem(
      STORAGE_KEY.BUILDER_RESUME_DIAGNOSIS,
      JSON.stringify(cur),
    );
  },
};

export default storage;
