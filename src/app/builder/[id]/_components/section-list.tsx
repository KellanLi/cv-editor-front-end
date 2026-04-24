'use client';

import {
  remove as removeSection,
  reorder as reorderSections,
} from '@/apis/section';
import { resumeSectionsQueryKey } from '@/lib/builder-resume-keys';
import type { TContentTemplate } from '@/types/business/content-template';
import type { TSection } from '@/types/business/section';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Modal, useOverlayState } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

interface IProps {
  resumeId: number;
  sections: TSection[];
  contentTemplateMap: Map<number, TContentTemplate>;
}

interface ISortableRowProps {
  section: TSection;
  name: string;
  onRequestDelete: (section: TSection) => void;
}

function SortableRow(props: ISortableRowProps) {
  const { section, name, onRequestDelete } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="border-default-200 bg-surface flex items-center gap-2 rounded-xl border p-2"
      {...attributes}
    >
      <button
        type="button"
        aria-label="拖拽排序"
        className="text-muted hover:text-foreground cursor-grab touch-none rounded-md p-1 active:cursor-grabbing"
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="text-foreground min-w-0 flex-1 truncate text-sm">
        {name}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        isIconOnly
        aria-label={`删除模块「${name}」`}
        className="text-default-400 hover:text-danger shrink-0 px-1.5"
        onPress={() => onRequestDelete(section)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}

function RowPreview({ name }: { name: string }) {
  return (
    <div className="border-accent/40 bg-surface ring-accent/20 flex items-center gap-2 rounded-xl border p-2 shadow-lg ring-2">
      <GripVertical className="text-muted size-4" />
      <span className="text-foreground min-w-0 flex-1 truncate text-sm">
        {name}
      </span>
    </div>
  );
}

export default function SectionList(props: IProps) {
  const { resumeId, sections, contentTemplateMap } = props;
  const queryClient = useQueryClient();
  const sectionsKey = resumeSectionsQueryKey(resumeId);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const deleteModal = useOverlayState();
  const [deleteTarget, setDeleteTarget] = useState<TSection | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const reorderMutation = useMutation({
    mutationFn: reorderSections,
  });

  const removeMutation = useMutation({
    mutationFn: removeSection,
  });

  const resolveName = useCallback(
    (section: TSection): string => {
      const tpl = contentTemplateMap.get(section.contentTemplateId);
      return tpl?.name.trim() || '未命名模块';
    },
    [contentTemplateMap],
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(Number(e.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const snapshot = sections;
      // 重新分配连续升序：1..N，既简单又满足后端「按 order 升序」约定
      const nextSections: TSection[] = arrayMove(sections, oldIndex, newIndex).map(
        (s, i) => ({ ...s, order: i + 1 }),
      );

      queryClient.setQueryData<TSection[]>(sectionsKey, nextSections);
      setReorderError(null);

      try {
        const res = await reorderMutation.mutateAsync({
          resumeId,
          items: nextSections.map((s) => ({ id: s.id, order: s.order })),
        });
        if (res.code !== 0) {
          throw new Error(res.message || '排序失败');
        }
        queryClient.setQueryData<TSection[]>(
          sectionsKey,
          [...res.data.list].sort((a, b) => a.order - b.order),
        );
      } catch (err) {
        queryClient.setQueryData<TSection[]>(sectionsKey, snapshot);
        setReorderError(err instanceof Error ? err.message : '排序失败');
      }
    },
    [sections, queryClient, resumeId, sectionsKey, reorderMutation],
  );

  const handleDragCancel = useCallback(() => setActiveId(null), []);

  const handleRequestDelete = useCallback(
    (section: TSection) => {
      setDeleteTarget(section);
      setDeleteError(null);
      deleteModal.open();
    },
    [deleteModal],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      const res = await removeMutation.mutateAsync({ id: deleteTarget.id });
      if (res.code !== 0) {
        throw new Error(res.message || '删除失败');
      }
      await queryClient.invalidateQueries({ queryKey: sectionsKey });
      setDeleteTarget(null);
      deleteModal.close();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '删除失败');
    }
  }, [deleteTarget, removeMutation, queryClient, sectionsKey, deleteModal]);

  const activeSection =
    activeId != null ? (sections.find((s) => s.id === activeId) ?? null) : null;

  const deleteTargetName = deleteTarget ? resolveName(deleteTarget) : '';

  return (
    <div className="flex flex-col gap-2">
      {sections.length === 0 ? (
        <div className="border-default-200 rounded-xl border border-dashed p-6 text-center">
          <p className="text-muted text-sm">暂无模块</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2">
              {sections.map((section) => (
                <SortableRow
                  key={section.id}
                  section={section}
                  name={resolveName(section)}
                  onRequestDelete={handleRequestDelete}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeSection ? (
              <RowPreview name={resolveName(activeSection)} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      {reorderError ? (
        <p className="text-danger text-xs" role="alert">
          {reorderError}
        </p>
      ) : null}

      <Modal state={deleteModal}>
        <Modal.Backdrop isDismissable={!removeMutation.isPending}>
          <Modal.Container size="sm" placement="center">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>删除模块</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-default-600 text-sm">
                  确定要从简历中删除「{deleteTargetName || '未命名模块'}
                  」吗？此操作不可撤销。
                </p>
                {deleteError ? (
                  <p className="text-danger mt-2 text-sm">{deleteError}</p>
                ) : null}
              </Modal.Body>
              <Modal.Footer className="gap-2">
                <Button
                  variant="secondary"
                  isDisabled={removeMutation.isPending}
                  onPress={() => {
                    setDeleteError(null);
                    deleteModal.close();
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="secondary"
                  className="border-danger text-danger border"
                  isDisabled={removeMutation.isPending}
                  onPress={() => {
                    void handleConfirmDelete();
                  }}
                >
                  {removeMutation.isPending ? '删除中…' : '删除'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
