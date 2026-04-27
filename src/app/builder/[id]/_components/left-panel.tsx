'use client';

import {
  ResumeAiConversationProvider,
  useResumeAiConversation,
} from './resume-ai-conversation-context';
import { listMessages } from '@/apis/ai';
import { toChatLinesFromServerMessages } from '@/lib/ai/ai-message-text';
import { streamAiChat } from '@/lib/ai/stream-chat';
import { resumeAiConversationsQueryKey } from '@/lib/builder-resume-keys';
import type { TAiConversationListRes } from '@/types/api/ai/conversation-list';
import type {
  TAiConversation,
  TAiConversationPurpose,
} from '@/types/business/ai-conversation';
import { AiChatMarkdown } from '@/components/ai-chat-markdown';
import {
  Button,
  Input,
  Label,
  ListBox,
  Modal,
  Popover,
  Select,
  Spinner,
  TextField,
  useOverlayState,
} from '@heroui/react';
import {
  Clock,
  Globe,
  MoreHorizontal,
  Pencil,
  Plus,
  SendHorizontal,
  Trash2,
} from 'lucide-react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

function displayTitle(c: TAiConversation) {
  return c.title?.trim() || '未命名对话';
}

function startOfLocalDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** 与「今天 0 点」相差的整日历日数，0=今天、1=昨天、2~6=一周内、≥7=一周前 */
function calendarDaysBeforeToday(t: number): number {
  const t0 = startOfLocalDay(Date.now());
  const t1 = startOfLocalDay(t);
  return Math.round((t0 - t1) / (24 * 60 * 60 * 1000));
}

type THistoryBucket = 'today' | 'yesterday' | 'week' | 'older';

function historyBucket(c: TAiConversation): THistoryBucket {
  const raw = c.lastMsgAt ?? c.updatedAt;
  const n = new Date(raw).getTime();
  if (Number.isNaN(n)) return 'older';
  const d = calendarDaysBeforeToday(n);
  if (d < 0) return 'today';
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d >= 2 && d < 7) return 'week';
  return 'older';
}

function sortKeyTime(c: TAiConversation) {
  return new Date(c.lastMsgAt ?? c.updatedAt).getTime();
}

const AI_MESSAGE_LIST_PAGE_SIZE = 500;

const HISTORY_SECTIONS: { bucket: THistoryBucket; label: string }[] = [
  { bucket: 'today', label: '今天' },
  { bucket: 'yesterday', label: '昨天' },
  { bucket: 'week', label: '一周内' },
  { bucket: 'older', label: '一周前' },
];

function groupConversationsByPeriod(
  list: TAiConversation[],
): Map<THistoryBucket, TAiConversation[]> {
  const m = new Map<THistoryBucket, TAiConversation[]>();
  for (const b of HISTORY_SECTIONS) {
    m.set(b.bucket, []);
  }
  for (const c of list) {
    const b = historyBucket(c);
    m.get(b)!.push(c);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => sortKeyTime(b) - sortKeyTime(a));
  }
  return m;
}

type TMode = 'ask' | 'agent';
const MODE_TO_PURPOSE: Record<TMode, TAiConversationPurpose> = {
  ask: 'BASIC_QA',
  agent: 'DIALOGUE_EDIT',
};

interface IHistoryRowProps {
  c: TAiConversation;
  selected: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  afterAction: () => void;
}

function HistoryRow(props: IHistoryRowProps) {
  const { c, selected, isDeleting, onSelect, onRename, onDelete, afterAction } =
    props;
  const rowMenu = useOverlayState();

  return (
    <li className="list-none">
      <div
        className={`hover:bg-default-100/80 flex w-full min-w-0 items-center gap-0 rounded-md transition-colors ${
          selected ? 'bg-accent/12 ring-accent/25 ring-1' : ''
        }`}
      >
        <button
          type="button"
          aria-pressed={selected}
          className="text-foreground/90 flex min-h-7 min-w-0 flex-1 items-center pr-0.5 pl-1 text-left"
          onClick={() => {
            onSelect();
            afterAction();
          }}
        >
          <span className="line-clamp-1 text-xs leading-tight font-medium">
            {displayTitle(c)}
          </span>
        </button>
        <div className="shrink-0 pr-0.5 pl-0">
          <Popover isOpen={rowMenu.isOpen} onOpenChange={rowMenu.setOpen}>
            <Popover.Trigger>
              <Button
                type="button"
                variant="ghost"
                isIconOnly
                isDisabled={isDeleting}
                className="text-default-500 hover:text-default-700 h-6 w-5 min-w-0 px-0"
                aria-label="该条对话操作"
              >
                <MoreHorizontal className="size-3.5" aria-hidden />
              </Button>
            </Popover.Trigger>
            <Popover.Content
              className="overflow-hidden !rounded-lg !shadow-md"
              placement="bottom end"
              offset={4}
            >
              <Popover.Dialog className="flex w-full min-w-28 flex-col gap-0.5 !rounded-none p-0.5">
                <Button
                  fullWidth
                  variant="ghost"
                  size="sm"
                  className="h-7 min-h-7 justify-center gap-1.5 text-xs"
                  onPress={() => {
                    rowMenu.close();
                    onRename();
                  }}
                >
                  <Pencil className="size-3 shrink-0" aria-hidden />
                  重命名
                </Button>
                <Button
                  fullWidth
                  variant="ghost"
                  size="sm"
                  className="text-danger h-7 min-h-7 justify-center gap-1.5 text-xs"
                  isDisabled={isDeleting}
                  onPress={() => {
                    rowMenu.close();
                    onDelete();
                  }}
                >
                  <Trash2 className="size-3 shrink-0" aria-hidden />
                  删除
                </Button>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </div>
      </div>
    </li>
  );
}

interface ILeftPanelProps {
  resumeId: number | null;
}

type TChatLine = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
};

function newLineId() {
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function tryParseConversationIdFromStreamPayload(
  payload: unknown,
): number | null {
  if (payload == null) return null;
  if (typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  for (const key of ['conversationId', 'conversation_id'] as const) {
    const v = p[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      return v;
    }
  }
  if (p.payload != null && typeof p.payload === 'object') {
    return tryParseConversationIdFromStreamPayload(p.payload);
  }
  return null;
}

const CONVERSATION_LIST_CACHE_PAGE = 1;
const CONVERSATION_LIST_PAGE_SIZE = 100;

/** 流式返回的 `conversationId` 写入列表缓存，避免在 refetch 完成前被「自动选中首条」逻辑误切回上一条。 */
function upsertStreamCreatedConversationInCache(
  client: QueryClient,
  resumeId: number,
  newId: number,
  purpose: TAiConversationPurpose,
) {
  const key = resumeAiConversationsQueryKey(
    resumeId,
    CONVERSATION_LIST_CACHE_PAGE,
  );
  const now = new Date().toISOString();
  const row: TAiConversation = {
    id: newId,
    resumeId,
    purpose,
    threadId: '',
    title: null,
    status: 'active',
    lastMsgAt: now,
    createdAt: now,
    updatedAt: now,
  };
  client.setQueryData<TAiConversationListRes | undefined>(key, (old) => {
    if (old != null && old.list.some((c) => c.id === newId)) {
      return old;
    }
    if (old == null) {
      return {
        list: [row],
        pagination: {
          page: 1,
          pageSize: CONVERSATION_LIST_PAGE_SIZE,
          total: 1,
        },
      };
    }
    return {
      ...old,
      list: [row, ...old.list],
      pagination: {
        ...old.pagination,
        total: (old.pagination.total ?? old.list.length) + 1,
      },
    };
  });
}

function MessageList(props: {
  lines: TChatLine[];
  endRef: RefObject<HTMLDivElement | null>;
}) {
  const { lines, endRef } = props;
  return (
    <div
      className="text-muted/90 flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-y-contain px-3 py-2 [scrollbar-gutter:stable]"
      role="log"
      aria-relevant="additions"
      aria-label="对话消息"
    >
      {lines.length === 0 ? (
        <p className="text-default-500 px-1 py-4 text-center text-xs">
          在下方输入内容并发送，AI 将流式显示回复
        </p>
      ) : null}
      {lines.map((line) =>
        line.role === 'user' ? (
          <div key={line.id} className="mr-0 max-w-[92%] self-end">
            <div className="bg-accent/12 text-foreground/90 inline-block max-w-full rounded-2xl rounded-tr-sm px-3 py-2 break-words ring-1 ring-[var(--color-border)]">
              <AiChatMarkdown content={line.text} />
            </div>
          </div>
        ) : (
          <div key={line.id} className="ml-0 max-w-[92%]">
            <div
              className={`text-foreground/90 inline-block max-w-full rounded-2xl rounded-tl-sm px-3 py-2 break-words shadow-sm ring-1 ring-black/5 ${
                line.isStreaming ? 'bg-surface/90' : 'bg-surface'
              }`}
            >
              {line.isStreaming && line.text.length === 0 ? (
                <span className="text-default-500 text-sm">正在思考…</span>
              ) : (
                <AiChatMarkdown content={line.text} />
              )}
            </div>
          </div>
        ),
      )}
      <div ref={endRef} className="h-px w-full shrink-0" aria-hidden />
    </div>
  );
}

function AiChatLayout() {
  const {
    resumeId,
    activeConversation,
    isLoading,
    isError,
    error,
    conversations,
    selectedId,
    setSelectedId,
    pendingNewThread,
    startNewThreadDraft,
    deleteThread,
    renameThread,
    isRenaming,
    isDeleting,
    refetchConversations,
  } = useResumeAiConversation();

  const queryClient = useQueryClient();
  const historyOpen = useOverlayState();
  const [mode, setMode] = useState<TMode>('ask');
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [inputDraft, setInputDraft] = useState('');

  const [messagesByConv, setMessagesByConv] = useState<
    Record<number, TChatLine[]>
  >({});
  /** 尚无服务端 conversationId 时的流式/草稿行（新对话或零会话时首条消息） */
  const [unsavedThreadLines, setUnsavedThreadLines] = useState<TChatLine[]>([]);
  const [isStreamPending, setIsStreamPending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [threadMessagesLoading, setThreadMessagesLoading] = useState(false);
  const [threadMessagesError, setThreadMessagesError] = useState<string | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);
  const listLoadIdRef = useRef(0);
  const activeStreamConvIdRef = useRef<number | null>(null);
  /** 流式首条刚返回 `conversationId` 时跳过 `listMessages`，避免用空/不完整服务端列表覆盖正在流式更新的本地消息 */
  const skipNextHistoryLoadForConvIdRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isDraftListView = useMemo(
    () =>
      (pendingNewThread && selectedId == null) ||
      (conversations.length === 0 && selectedId == null),
    [pendingNewThread, conversations.length, selectedId],
  );

  const linesForThread = useMemo(
    () =>
      isDraftListView
        ? unsavedThreadLines
        : selectedId != null
          ? (messagesByConv[selectedId] ?? [])
          : [],
    [isDraftListView, unsavedThreadLines, messagesByConv, selectedId],
  );

  const appendLines = useCallback(
    (convId: number, add: (prev: TChatLine[]) => TChatLine[]) => {
      setMessagesByConv((m) => {
        const cur = m[convId] ?? [];
        return { ...m, [convId]: add([...cur]) };
      });
    },
    [],
  );

  const scrollToBottom = useCallback(() => {
    queueMicrotask(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'end',
      });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [linesForThread, scrollToBottom]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    if (skipNextHistoryLoadForConvIdRef.current === selectedId) {
      skipNextHistoryLoadForConvIdRef.current = null;
      return;
    }
    abortRef.current?.abort();
    const my = ++listLoadIdRef.current;
    setThreadMessagesError(null);
    setThreadMessagesLoading(true);
    void (async () => {
      try {
        const res = await listMessages({
          filter: { conversationId: selectedId },
          pagination: { page: 1, pageSize: AI_MESSAGE_LIST_PAGE_SIZE },
        });
        if (listLoadIdRef.current !== my) return;
        if (res.code !== 0) {
          setThreadMessagesError(res.message || '历史消息加载失败');
          return;
        }
        const lines: TChatLine[] = toChatLinesFromServerMessages(
          res.data.list,
        ).map((l) => ({ ...l }));
        setMessagesByConv((m) => ({ ...m, [selectedId]: lines }));
      } catch (e) {
        if (listLoadIdRef.current !== my) return;
        setThreadMessagesError(
          e instanceof Error ? e.message : '历史消息加载失败',
        );
      } finally {
        if (listLoadIdRef.current === my) {
          setThreadMessagesLoading(false);
        }
      }
    })();
  }, [selectedId]);

  const sendUserMessage = useCallback(async () => {
    const raw = inputDraft.replace(/\r\n/g, '\n');
    const trimmed = raw.trim();
    if (trimmed === '' || isStreamPending || threadMessagesLoading) return;

    setSendError(null);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const startedAsNewStream = selectedId == null;
    const purpose = MODE_TO_PURPOSE[mode];

    activeStreamConvIdRef.current = startedAsNewStream
      ? null
      : (selectedId as number);
    setInputDraft('');

    const userLine: TChatLine = {
      id: newLineId(),
      role: 'user',
      text: raw.replace(/^\s+|\s+$/g, ''),
    };
    const asstId = newLineId();
    const asstLine: TChatLine = {
      id: asstId,
      role: 'assistant',
      text: '',
      isStreaming: true,
    };

    if (startedAsNewStream) {
      setUnsavedThreadLines((u) => [...u, userLine, asstLine]);
    } else {
      const convId = selectedId as number;
      setMessagesByConv((m) => {
        const cur = m[convId] ?? [];
        return { ...m, [convId]: [...cur, userLine, asstLine] };
      });
    }
    setIsStreamPending(true);

    const applyDeltaToUnsaved = (updater: (t: string) => string) => {
      setUnsavedThreadLines((prev) => {
        const next = [...prev];
        const i = next.findIndex((l) => l.id === asstId);
        if (i >= 0) {
          const cur = next[i]!;
          next[i] = { ...cur, text: updater(cur.text) };
        }
        return next;
      });
    };

    try {
      await streamAiChat(
        {
          resumeId,
          userMessage: trimmed,
          ...(!startedAsNewStream && selectedId != null
            ? { conversationId: selectedId }
            : {}),
          purpose,
          enableWebSearch: enableWebSearch || undefined,
        },
        (ev) => {
          const { data } = ev;
          if (ac.signal.aborted) return;

          if (data.phase === 'meta') {
            const m = data as { payload?: unknown };
            const newId =
              tryParseConversationIdFromStreamPayload(m.payload) ??
              tryParseConversationIdFromStreamPayload(data);
            if (
              newId != null &&
              startedAsNewStream &&
              activeStreamConvIdRef.current == null
            ) {
              upsertStreamCreatedConversationInCache(
                queryClient,
                resumeId,
                newId,
                purpose,
              );
              activeStreamConvIdRef.current = newId;
              setUnsavedThreadLines((cur) => {
                if (cur.length) {
                  setMessagesByConv((m) => ({ ...m, [newId]: cur }));
                }
                return [];
              });
              skipNextHistoryLoadForConvIdRef.current = newId;
              setSelectedId(newId);
              void refetchConversations();
            }
            return;
          }

          if (data.phase === 'message' && data.deltaText) {
            const cid = activeStreamConvIdRef.current;
            if (cid == null) {
              applyDeltaToUnsaved((t) => t + data.deltaText!);
            } else {
              appendLines(cid, (prev) => {
                const next = [...prev];
                const i = next.findIndex((l) => l.id === asstId);
                if (i >= 0) {
                  const curL = next[i]!;
                  next[i] = {
                    ...curL,
                    text: curL.text + data.deltaText!,
                  };
                }
                return next;
              });
            }
            scrollToBottom();
            return;
          }
          if (data.phase === 'error') {
            const msg = (data.deltaText || '流式错误').trim();
            const cid = activeStreamConvIdRef.current;
            if (cid == null) {
              setUnsavedThreadLines((prev) => {
                const next = [...prev];
                const i = next.findIndex((l) => l.id === asstId);
                if (i >= 0) {
                  const curL = next[i]!;
                  next[i] = {
                    ...curL,
                    text: curL.text ? `${curL.text}\n\n[错误] ${msg}` : msg,
                    isStreaming: false,
                  };
                }
                return next;
              });
            } else {
              appendLines(cid, (prev) => {
                const next = [...prev];
                const i = next.findIndex((l) => l.id === asstId);
                if (i >= 0) {
                  const curL = next[i]!;
                  next[i] = {
                    ...curL,
                    text: curL.text ? `${curL.text}\n\n[错误] ${msg}` : msg,
                    isStreaming: false,
                  };
                }
                return next;
              });
            }
          }
        },
        { signal: ac.signal },
      );
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        const cid = activeStreamConvIdRef.current;
        if (cid == null) {
          setUnsavedThreadLines((prev) => {
            const next = [...prev];
            const i = next.findIndex((l) => l.id === asstId);
            if (i >= 0) {
              next[i] = { ...next[i]!, isStreaming: false };
            }
            return next;
          });
        } else {
          appendLines(cid, (prev) => {
            const next = [...prev];
            const i = next.findIndex((l) => l.id === asstId);
            if (i >= 0) {
              next[i] = { ...next[i]!, isStreaming: false };
            }
            return next;
          });
        }
      } else {
        const msg = e instanceof Error ? e.message : '发送失败';
        const cid = activeStreamConvIdRef.current;
        if (cid == null) {
          setUnsavedThreadLines((prev) => {
            const next = [...prev];
            const i = next.findIndex((l) => l.id === asstId);
            if (i >= 0) {
              const curL = next[i]!;
              next[i] = {
                ...curL,
                text: curL.text ? `${curL.text}\n\n[错误] ${msg}` : msg,
                isStreaming: false,
              };
            }
            return next;
          });
        } else {
          appendLines(cid, (prev) => {
            const next = [...prev];
            const i = next.findIndex((l) => l.id === asstId);
            if (i >= 0) {
              const curL = next[i]!;
              next[i] = {
                ...curL,
                text: curL.text ? `${curL.text}\n\n[错误] ${msg}` : msg,
                isStreaming: false,
              };
            }
            return next;
          });
        }
        setSendError(msg);
      }
    } finally {
      if (!ac.signal.aborted) {
        if (startedAsNewStream && activeStreamConvIdRef.current == null) {
          const out = (await refetchConversations()) as {
            data?: { list?: TAiConversation[] } | null;
          };
          const first = out.data?.list?.[0];
          if (first != null) {
            const nid = first.id;
            activeStreamConvIdRef.current = nid;
            setUnsavedThreadLines((cur) => {
              if (cur.length) {
                setMessagesByConv((m) => ({ ...m, [nid]: cur }));
              }
              return [];
            });
            skipNextHistoryLoadForConvIdRef.current = nid;
            setSelectedId(nid);
          }
        }
        const endId = activeStreamConvIdRef.current;
        if (endId != null) {
          appendLines(endId, (prev) => {
            const next = [...prev];
            const i = next.findIndex((l) => l.id === asstId);
            if (i >= 0 && next[i]!.isStreaming) {
              next[i] = { ...next[i]!, isStreaming: false };
            }
            return next;
          });
        } else {
          setUnsavedThreadLines((prev) => {
            const next = [...prev];
            const i = next.findIndex((l) => l.id === asstId);
            if (i >= 0 && next[i]!.isStreaming) {
              next[i] = { ...next[i]!, isStreaming: false };
            }
            return next;
          });
        }
        await refetchConversations();
      }
      setIsStreamPending(false);
    }
  }, [
    inputDraft,
    isStreamPending,
    threadMessagesLoading,
    mode,
    resumeId,
    selectedId,
    setSelectedId,
    appendLines,
    scrollToBottom,
    refetchConversations,
    enableWebSearch,
    queryClient,
  ]);

  const renameModal = useOverlayState();
  const [renameTarget, setRenameTarget] = useState<TAiConversation | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const deleteModal = useOverlayState();
  const [deleteTarget, setDeleteTarget] = useState<TAiConversation | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const headTitle = (() => {
    if (isError && error) return '无法加载';
    if (isLoading) return '加载中…';
    if (pendingNewThread) return '新对话';
    if (activeConversation) return displayTitle(activeConversation);
    if (selectedId == null) return '新对话';
    if (conversations.length === 0) return '暂无对话';
    return '未选择';
  })();

  const onNewThread = () => {
    startNewThreadDraft();
    setUnsavedThreadLines([]);
    setInputDraft('');
  };

  const openRename = (c: TAiConversation) => {
    setRenameError(null);
    setRenameValue(displayTitle(c));
    setRenameTarget(c);
    renameModal.open();
  };

  const submitRename = async () => {
    if (renameTarget == null) return;
    setRenameError(null);
    try {
      await renameThread(renameTarget.id, renameValue);
      renameModal.close();
      setRenameTarget(null);
    } catch (e) {
      setRenameError(e instanceof Error ? e.message : '重命名失败');
    }
  };

  const openDelete = (c: TAiConversation) => {
    setDeleteError(null);
    setDeleteTarget(c);
    deleteModal.open();
  };

  const confirmDelete = async () => {
    if (deleteTarget == null) return;
    setDeleteError(null);
    try {
      await deleteThread(deleteTarget.id);
      deleteModal.close();
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : '删除失败');
    }
  };

  const groupedConversations = useMemo(
    () => groupConversationsByPeriod(conversations),
    [conversations],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-11 min-h-11 shrink-0 items-center gap-2 px-3 pr-2 pl-3">
        <h2
          className="text-foreground min-w-0 flex-1 truncate pl-0.5 text-sm font-semibold"
          title={headTitle}
        >
          {headTitle}
        </h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            isIconOnly
            className="h-8 w-8"
            isDisabled={isLoading}
            aria-label="新建对话"
            onPress={onNewThread}
          >
            <Plus className="size-4" strokeWidth={2.25} aria-hidden />
          </Button>
          <Popover
            isOpen={historyOpen.isOpen}
            onOpenChange={historyOpen.setOpen}
          >
            <Popover.Trigger>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                isIconOnly
                className="h-8 w-8"
                isDisabled={isLoading}
                aria-label="对话记录"
              >
                <Clock className="size-4" strokeWidth={2} aria-hidden />
              </Button>
            </Popover.Trigger>
            <Popover.Content
              className="border-border w-[min(100%,16.5rem)] overflow-hidden !rounded-md p-0 !shadow-md sm:w-64"
              offset={6}
              placement="bottom start"
            >
              <Popover.Dialog className="w-full min-w-0 !rounded-none p-0">
                <div className="border-default-200/80 flex justify-between border-b px-1.5 py-1.5">
                  <p className="text-foreground text-[0.7rem] leading-tight font-medium">
                    对话记录
                  </p>
                  <p className="text-muted mt-0.5 text-[0.6rem] leading-tight">
                    选择继续；侧栏更多操作
                  </p>
                </div>
                {isError && error ? (
                  <p className="text-danger px-1.5 py-2.5 text-xs">
                    {error.message}
                  </p>
                ) : isLoading ? (
                  <div className="text-muted flex items-center justify-center py-5 text-xs">
                    <Spinner className="size-3.5" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-muted px-1.5 py-3 text-center text-xs">
                    还没有对话
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2.5 overflow-y-auto px-1 py-1.5">
                    {HISTORY_SECTIONS.map(({ bucket, label }) => {
                      const items = groupedConversations.get(bucket) ?? [];
                      if (items.length === 0) return null;
                      return (
                        <div key={bucket} className="min-w-0">
                          <p className="text-default-500 pr-0.5 pb-1 pl-1 text-[0.6rem] font-medium tracking-tight">
                            {label}
                          </p>
                          <ul className="space-y-0.5">
                            {items.map((c) => (
                              <HistoryRow
                                key={c.id}
                                c={c}
                                selected={c.id === selectedId}
                                isDeleting={isDeleting}
                                onSelect={() => setSelectedId(c.id)}
                                onRename={() => openRename(c)}
                                onDelete={() => openDelete(c)}
                                afterAction={() => historyOpen.close()}
                              />
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </div>
      </header>

      {sendError ? (
        <p className="text-danger shrink-0 px-3 pb-0.5 text-center text-xs">
          {sendError}
        </p>
      ) : null}
      {threadMessagesError ? (
        <p className="text-danger shrink-0 px-3 pb-0.5 text-center text-xs">
          {threadMessagesError}
        </p>
      ) : null}

      <div className="bg-default-50/40 flex min-h-0 min-w-0 flex-1 flex-col">
        {isError && error ? (
          <div className="text-danger flex min-h-32 flex-1 items-center justify-center p-4 text-sm">
            {error.message}
          </div>
        ) : isLoading && conversations.length === 0 ? (
          <div className="text-muted flex min-h-32 flex-1 items-center justify-center text-sm">
            加载中…
          </div>
        ) : (
          <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
            {threadMessagesLoading && selectedId != null ? (
              <div
                className="bg-default-50/40 absolute inset-0 z-10 flex items-center justify-center"
                aria-busy
                aria-label="加载历史消息"
              >
                <Spinner className="size-6" />
              </div>
            ) : null}
            <MessageList lines={linesForThread} endRef={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-default-200 shrink-0 border-t p-2.5">
        <div className="border-default-200 bg-surface/80 focus-within:ring-accent/20 relative min-h-24 w-full min-w-0 flex-1 rounded-2xl border p-0 shadow-sm focus-within:ring-2">
          <label htmlFor="ai-left-chat-input" className="sr-only">
            输入给 AI
          </label>
          <textarea
            id="ai-left-chat-input"
            className="text-foreground ring-none placeholder:text-muted/80 max-h-40 min-h-24 w-full resize-none border-0 bg-transparent px-3.5 py-2.5 pb-11 text-sm outline-none"
            style={{ minHeight: '5.5rem' }}
            placeholder="输入问题或指令，Enter 发送，Shift+Enter 换行"
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isStreamPending) void sendUserMessage();
              }
            }}
            readOnly={isStreamPending || threadMessagesLoading}
            aria-busy={isStreamPending}
          />
          <div className="absolute bottom-2 left-2 z-10 flex h-6 min-h-6 max-w-[calc(100%-5rem)] flex-wrap items-center gap-1.5">
            <Select
              aria-label="模式"
              value={mode}
              variant="secondary"
              className="w-[4.5rem] min-w-0 text-[0.65rem] leading-tight"
              onChange={(v) => {
                if (v === 'ask' || v === 'agent') setMode(v);
              }}
            >
              <Select.Trigger className="flex h-6 max-h-6 min-h-0 w-full flex-row items-center justify-start gap-1 px-1.5 !py-0 text-left text-[0.65rem] leading-tight">
                <Select.Value className="min-w-0 flex-1 pl-1.5 text-left text-[0.65rem]" />
                <Select.Indicator className="shrink-0" />
              </Select.Trigger>
              <Select.Popover placement="top start" className="rounded-xl !p-0">
                <ListBox>
                  <ListBox.Item
                    id="ask"
                    textValue="Ask"
                    className="flex min-h-7 items-center justify-start pl-1.5 text-left text-[0.65rem] leading-tight"
                  >
                    Ask
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item
                    id="agent"
                    textValue="Agent"
                    className="flex min-h-7 items-center justify-start pl-1.5 text-left text-[0.65rem] leading-tight"
                  >
                    Agent
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <Button
              type="button"
              size="sm"
              variant={enableWebSearch ? 'secondary' : 'ghost'}
              className={
                enableWebSearch
                  ? 'text-foreground/90 border-accent/35 bg-accent/10 h-6 min-h-0 gap-0.5 border px-1.5 !py-0 text-[0.65rem] leading-tight'
                  : 'text-default-600 h-6 min-h-0 gap-0.5 px-1.5 !py-0 text-[0.65rem] leading-tight'
              }
              aria-pressed={enableWebSearch}
              isDisabled={isStreamPending || threadMessagesLoading}
              onPress={() => setEnableWebSearch((v) => !v)}
            >
              <Globe className="size-3 shrink-0" aria-hidden />
              联网搜索
            </Button>
          </div>
          <div className="absolute right-2 bottom-2">
            <Button
              type="button"
              size="sm"
              isIconOnly
              variant="secondary"
              isDisabled={
                isStreamPending ||
                threadMessagesLoading ||
                inputDraft.trim() === '' ||
                isLoading
              }
              className="h-8 w-8"
              aria-label="发送"
              onPress={() => {
                if (!isStreamPending) void sendUserMessage();
              }}
            >
              {isStreamPending ? (
                <Spinner className="size-4" />
              ) : (
                <SendHorizontal className="size-4" aria-hidden />
              )}
            </Button>
          </div>
        </div>
        <p className="text-muted mt-1.5 px-0.5 text-center text-[0.7rem] leading-tight">
          回复为 SSE 流式增量（与后端 `writeSse` 协议一致）
        </p>
      </div>

      <Modal state={renameModal}>
        <Modal.Backdrop>
          <Modal.Container size="md" placement="center">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>重命名对话</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="gap-3">
                <TextField
                  name="title"
                  value={renameValue}
                  onChange={setRenameValue}
                  isDisabled={isRenaming}
                >
                  <Label>标题</Label>
                  <Input
                    variant="secondary"
                    className="h-9 min-h-0 text-sm"
                    autoFocus
                    placeholder="对话标题"
                  />
                </TextField>
                {renameError ? (
                  <p className="text-danger text-sm">{renameError}</p>
                ) : null}
              </Modal.Body>
              <Modal.Footer className="gap-2">
                <Button
                  variant="secondary"
                  isDisabled={isRenaming}
                  onPress={() => {
                    setRenameError(null);
                    setRenameTarget(null);
                    renameModal.close();
                  }}
                >
                  取消
                </Button>
                <Button isDisabled={isRenaming} onPress={submitRename}>
                  {isRenaming ? <Spinner className="size-4" /> : null}
                  保存
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={deleteModal}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="sm" placement="center">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>删除对话</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-default-600 text-sm">
                  确定要删除「{deleteTarget ? displayTitle(deleteTarget) : ''}
                  」吗？其下的 消息与工具记录将一并删除，此操作不可撤销。
                </p>
                {deleteError ? (
                  <p className="text-danger mt-2 text-sm">{deleteError}</p>
                ) : null}
              </Modal.Body>
              <Modal.Footer className="gap-2">
                <Button
                  variant="secondary"
                  isDisabled={isDeleting}
                  onPress={() => {
                    setDeleteError(null);
                    setDeleteTarget(null);
                    deleteModal.close();
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="danger-soft"
                  isDisabled={isDeleting}
                  onPress={confirmDelete}
                >
                  {isDeleting ? <Spinner className="size-4" /> : null}
                  删除
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}

export default function LeftPanel(props: ILeftPanelProps) {
  const { resumeId } = props;

  if (resumeId == null) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex h-11 min-h-11 shrink-0 items-center gap-2 px-3 pr-2">
          <h2 className="text-foreground/70 min-w-0 flex-1 pl-0.5 text-sm font-semibold">
            —
          </h2>
        </header>
        <div className="text-muted flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm">
          请先打开有效简历
        </div>
      </div>
    );
  }

  return (
    <ResumeAiConversationProvider resumeId={resumeId}>
      <div className="relative flex h-full min-h-0 flex-col">
        <div
          className="bg-border pointer-events-none absolute top-0 -right-px bottom-0 w-px"
          aria-hidden
        />
        <AiChatLayout />
      </div>
    </ResumeAiConversationProvider>
  );
}
