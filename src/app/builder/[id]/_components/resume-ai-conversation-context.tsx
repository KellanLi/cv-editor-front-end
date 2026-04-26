'use client';

import {
  createConversation,
  listConversations,
  removeConversation,
  updateConversation,
} from '@/apis/ai';
import { resumeAiConversationsQueryKey } from '@/lib/builder-resume-keys';
import type { TAiConversation } from '@/types/business/ai-conversation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const PAGE_SIZE = 100;

type TContext = {
  resumeId: number;
  conversations: TAiConversation[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** 当前选中的对话，用于多轮续聊的 `conversationId`；为 `null` 时若 `pendingNewThread` 为真则表示「新对话」草稿，尚未在服务端建会话。 */
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  /**
   * 为 `true` 时禁止自动把 `selectedId` 设回列表首条，用于「新对话」草稿态。
   * 用户首次发送时由流式/列表解析出真实 `id` 后再置为 `false`。
   */
  pendingNewThread: boolean;
  activeConversation: TAiConversation | null;
  /** 进入新对话草稿：不请求建会话，清空选择直到首条消息发出。 */
  startNewThreadDraft: () => void;
  createThread: (title?: string) => Promise<TAiConversation | void>;
  renameThread: (id: number, title: string) => Promise<TAiConversation | void>;
  deleteThread: (id: number) => Promise<TAiConversation | void>;
  isCreating: boolean;
  isRenaming: boolean;
  isDeleting: boolean;
  refetchConversations: () => Promise<unknown>;
};

const ResumeAiConversationContext = createContext<TContext | null>(null);

export function useResumeAiConversation(): TContext {
  const v = useContext(ResumeAiConversationContext);
  if (v == null) {
    throw new Error('useResumeAiConversation must be used within provider');
  }
  return v;
}

interface IProviderProps {
  resumeId: number;
  children: ReactNode;
}

export function ResumeAiConversationProvider(props: IProviderProps) {
  const { resumeId, children } = props;
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedId, setSelectedIdState] = useState<number | null>(null);
  const [pendingNewThread, setPendingNewThread] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: resumeAiConversationsQueryKey(resumeId, page),
    queryFn: async () => {
      const res = await listConversations({
        filter: { resumeId },
        pagination: { page, pageSize: PAGE_SIZE },
      });
      if (res.code !== 0) {
        throw new Error(res.message || '对话列表加载失败');
      }
      return res.data;
    },
  });

  const conversations = useMemo(
    () => data?.list ?? [],
    [data?.list],
  );
  const total = data?.pagination?.total ?? conversations.length;

  const setSelectedId = useCallback((id: number | null) => {
    if (id != null) {
      setPendingNewThread(false);
    }
    setSelectedIdState(id);
  }, []);

  const startNewThreadDraft = useCallback(() => {
    setPendingNewThread(true);
    setSelectedIdState(null);
  }, []);

  useEffect(() => {
    if (pendingNewThread) {
      return;
    }
    if (conversations.length === 0) {
      if (selectedId != null) setSelectedIdState(null);
      return;
    }
    if (selectedId == null) {
      setSelectedIdState(conversations[0]!.id);
      return;
    }
    if (!conversations.some((c) => c.id === selectedId)) {
      // 列表尚未含流式刚返回的 `conversationId` 时，缓存常仍是旧数据；此期间不要误把选中切回上一条
      if (isFetching) {
        return;
      }
      setSelectedIdState(conversations[0]!.id);
    }
  }, [conversations, selectedId, pendingNewThread, isFetching]);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: resumeAiConversationsQueryKey(resumeId, page),
    });
  }, [queryClient, resumeId, page]);

  const createMut = useMutation({
    mutationFn: (title?: string) =>
      createConversation({
        resumeId,
        purpose: 'DIALOGUE_EDIT',
        title: title?.trim() || undefined,
      }),
    onSuccess: (res) => {
      if (res.code !== 0) return;
      if (res.data) {
        setPendingNewThread(false);
        setSelectedIdState(res.data.id);
      }
      invalidate();
    },
  });

  const renameMut = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      updateConversation({ id, title: title.trim() || undefined }),
    onSuccess: (res) => {
      if (res.code !== 0) return;
      invalidate();
    },
  });

  const deleteMut = useMutation({
    mutationFn: removeConversation,
    onSuccess: (res, { id }) => {
      if (res.code !== 0) return;
      setSelectedIdState((cur) => (cur === id ? null : cur));
      invalidate();
    },
  });

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const createThread = useCallback(
    async (title?: string) => {
      const res = await createMut.mutateAsync(title);
      if (res.code !== 0) {
        throw new Error(res.message || '创建对话失败');
      }
      return res.data;
    },
    [createMut],
  );

  const renameThread = useCallback(
    async (id: number, title: string) => {
      const res = await renameMut.mutateAsync({ id, title });
      if (res.code !== 0) {
        throw new Error(res.message || '重命名失败');
      }
      return res.data;
    },
    [renameMut],
  );

  const deleteThread = useCallback(
    async (id: number) => {
      const res = await deleteMut.mutateAsync({ id });
      if (res.code !== 0) {
        throw new Error(res.message || '删除失败');
      }
      return res.data;
    },
    [deleteMut],
  );

  const value: TContext = {
    resumeId,
    conversations,
    total,
    isLoading,
    isError: isError && error != null,
    error: error instanceof Error ? error : null,
    selectedId,
    setSelectedId,
    pendingNewThread,
    startNewThreadDraft,
    activeConversation,
    createThread,
    renameThread,
    deleteThread,
    isCreating: createMut.isPending,
    isRenaming: renameMut.isPending,
    isDeleting: deleteMut.isPending,
    refetchConversations: refetch,
  };

  return (
    <ResumeAiConversationContext.Provider value={value}>
      {children}
    </ResumeAiConversationContext.Provider>
  );
}
