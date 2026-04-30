import {
  BUILDER_LEFT_DEFAULT,
  BUILDER_RIGHT_DEFAULT,
  clampBuilderLeftWidth,
  clampBuilderRightWidth,
} from '@/lib/builder-panel-sizes';
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
};

export default storage;
