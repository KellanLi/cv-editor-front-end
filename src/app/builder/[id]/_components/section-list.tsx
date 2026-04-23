'use client';

import type { TContentTemplate } from '@/types/business/content-template';
import type { TResume } from '@/types/business/resume';
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
import { useQueryClient } from '@tanstack/react-query';
import { GripVertical } from 'lucide-react';
import { useCallback, useState } from 'react';

interface IProps {
  resumeId: number;
  sections: TSection[];
  contentTemplateMap: Map<number, TContentTemplate>;
}

interface ISortableRowProps {
  section: TSection;
  name: string;
}

function SortableRow(props: ISortableRowProps) {
  const { section, name } = props;
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
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const nextSections = arrayMove(sections, oldIndex, newIndex);
      // TODO: 后端暂无模块排序接口，目前仅更新客户端 query 缓存，刷新后顺序会回滚到后端返回值。
      queryClient.setQueryData<TResume>(['resume', resumeId], (prev) =>
        prev ? { ...prev, sections: nextSections } : prev,
      );
    },
    [sections, queryClient, resumeId],
  );

  const handleDragCancel = useCallback(() => setActiveId(null), []);

  if (sections.length === 0) {
    return (
      <div className="border-default-200 rounded-xl border border-dashed p-6 text-center">
        <p className="text-muted text-sm">暂无模块</p>
      </div>
    );
  }

  const activeSection =
    activeId != null ? (sections.find((s) => s.id === activeId) ?? null) : null;

  return (
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
            />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeSection ? <RowPreview name={resolveName(activeSection)} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
