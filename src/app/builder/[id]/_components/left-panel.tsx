'use client';

import {
  ResumeAiConversationProvider,
  useResumeAiConversation,
} from './resume-ai-conversation-context';
import type { TAiConversation } from '@/types/business/ai-conversation';
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
  MoreHorizontal,
  Pencil,
  Plus,
  SendHorizontal,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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

function PlaceholderMessages() {
  return (
    <div className="text-muted/90 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-2">
      <p className="text-default-500 px-1 text-center text-xs">
        以下为示意布局，非真实消息
      </p>
      <div className="ml-0 max-w-[92%]">
        <div className="bg-surface text-foreground/90 inline-block rounded-2xl rounded-tl-sm px-3 py-2 text-sm shadow-sm ring-1 ring-black/5">
          可以帮我看看这段项目经历怎么写更贴岗位吗？
        </div>
      </div>
      <div className="mr-0 max-w-[92%] self-end">
        <div className="bg-accent/12 text-foreground/90 inline-block rounded-2xl rounded-tr-sm px-3 py-2 text-sm ring-1 ring-[var(--color-border)]">
          建议突出与你投递岗位强相关的技术栈，并用一条量化结果收束，例如将「参与」改为可验证的指标。
        </div>
      </div>
    </div>
  );
}

function AiChatLayout() {
  const {
    activeConversation,
    isLoading,
    isError,
    error,
    conversations,
    selectedId,
    setSelectedId,
    createThread,
    deleteThread,
    renameThread,
    isCreating,
    isRenaming,
    isDeleting,
  } = useResumeAiConversation();

  const historyOpen = useOverlayState();
  const [mode, setMode] = useState<TMode>('ask');
  const [inputDraft, setInputDraft] = useState('');

  const [createError, setCreateError] = useState<string | null>(null);
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
    if (activeConversation) return displayTitle(activeConversation);
    if (conversations.length === 0) return '暂无对话';
    return '未选择';
  })();

  const onNewThread = async () => {
    setCreateError(null);
    try {
      await createThread();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : '创建失败');
    }
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
            isDisabled={isLoading || isCreating}
            aria-label="新建对话"
            onPress={onNewThread}
          >
            {isCreating ? (
              <Spinner className="size-4" />
            ) : (
              <Plus className="size-4" strokeWidth={2.25} aria-hidden />
            )}
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

      {createError ? (
        <p className="text-danger shrink-0 px-3 pb-0.5 text-center text-xs">
          {createError}
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
          <PlaceholderMessages />
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
            placeholder="输入问题或指令，发送后将在后续接流式回答…"
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
          />
          <div className="absolute bottom-2 left-2 z-10 flex h-6 min-h-6 items-center">
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
          </div>
          <div className="absolute right-2 bottom-2">
            <Button
              type="button"
              size="sm"
              isIconOnly
              variant="secondary"
              isDisabled
              className="h-8 w-8 opacity-50"
              aria-label="发送（未接入）"
            >
              <SendHorizontal className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
        <p className="text-muted mt-1.5 px-0.5 text-center text-[0.7rem] leading-tight">
          对话区与流式能力开发中
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
                  className="border-danger text-danger border"
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
