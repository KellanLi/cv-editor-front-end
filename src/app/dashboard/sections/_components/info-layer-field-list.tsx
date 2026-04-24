'use client';

import { INFO_LAYER, INFO_LAYER_MAP } from '@/components/info-layer/const';
import type { TInfoTemplate } from '@/types/business/info-template';
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
import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import { GripVertical, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

export type InfoLayerRow = TInfoTemplate & { keyId: string };

interface IProps {
  layers: InfoLayerRow[];
  onLayersChange: (next: InfoLayerRow[]) => void;
}

function normalizeOrders(rows: InfoLayerRow[]): InfoLayerRow[] {
  return rows.map((row, index) => ({ ...row, order: index }));
}

function layerTitle(type: string): string {
  const meta = INFO_LAYER_MAP[type as INFO_LAYER];
  return meta?.name ?? type;
}

interface SortableRowProps {
  row: InfoLayerRow;
  index: number;
  onNameChange: (keyId: string, fieldIndex: number, value: string) => void;
  onRemove: (keyId: string) => void;
}

function SortableLayerRow(props: SortableRowProps) {
  const { row, index, onNameChange, onRemove } = props;
  const title = layerTitle(row.type);
  const labelSource =
    INFO_LAYER_MAP[row.type as INFO_LAYER]?.defaultProps.labels ?? [];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.keyId });

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
      className="border-foreground/10 bg-surface/80 flex flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-start sm:gap-4"
      {...attributes}
    >
      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-center sm:pt-1">
        <button
          type="button"
          aria-label="拖拽排序"
          className="text-muted hover:text-foreground cursor-grab touch-none rounded-md p-1 active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <span className="text-muted text-sm font-medium tabular-nums">
          {index + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-foreground text-sm font-semibold">{title}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-danger shrink-0"
            aria-label={`移除「${title}」`}
            onPress={() => onRemove(row.keyId)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {row.names.map((name, fieldIndex) => {
            const base = labelSource[fieldIndex] ?? `字段 ${fieldIndex + 1}`;
            return (
              <TextField
                key={`${row.keyId}-field-${fieldIndex}`}
                isRequired
                value={name}
                onChange={(next) => onNameChange(row.keyId, fieldIndex, next)}
                validate={(value) => (!value?.trim() ? '请填写字段名称' : null)}
              >
                <Label>
                  {base}
                  字段名称
                </Label>
                <Input variant="secondary" placeholder="请输入" />
                <FieldError />
              </TextField>
            );
          })}
        </div>
      </div>
    </li>
  );
}

function DragPreview({ row, index }: { row: InfoLayerRow; index: number }) {
  const title = layerTitle(row.type);
  return (
    <div className="border-accent/30 bg-surface ring-accent/20 flex cursor-grabbing flex-col gap-3 rounded-2xl border p-4 shadow-lg ring-2 sm:flex-row sm:items-start sm:gap-4">
      <span className="text-muted text-sm font-medium tabular-nums">
        {index + 1}
      </span>
      <span className="text-foreground text-sm font-semibold">{title}</span>
    </div>
  );
}

export default function InfoLayerFieldList(props: IProps) {
  const { layers, onLayersChange } = props;
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = layers.findIndex((r) => r.keyId === active.id);
      const newIndex = layers.findIndex((r) => r.keyId === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      onLayersChange(normalizeOrders(arrayMove(layers, oldIndex, newIndex)));
    },
    [layers, onLayersChange],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleNameChange = useCallback(
    (keyId: string, fieldIndex: number, value: string) => {
      onLayersChange(
        layers.map((row) => {
          if (row.keyId !== keyId) return row;
          const nextNames = [...row.names];
          nextNames[fieldIndex] = value;
          return { ...row, names: nextNames };
        }),
      );
    },
    [layers, onLayersChange],
  );

  const handleRemove = useCallback(
    (keyId: string) => {
      onLayersChange(normalizeOrders(layers.filter((r) => r.keyId !== keyId)));
    },
    [layers, onLayersChange],
  );

  const activeIndex = activeId
    ? layers.findIndex((r) => r.keyId === activeId)
    : -1;
  const activeRow = activeIndex >= 0 ? layers[activeIndex] : null;

  if (layers.length === 0) {
    return (
      <p className="text-muted text-sm">
        暂无信息层，点击「添加」选择类型后加入列表。
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={layers.map((r) => r.keyId)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-3">
          {layers.map((row, index) => (
            <SortableLayerRow
              key={row.keyId}
              row={row}
              index={index}
              onNameChange={handleNameChange}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeRow && activeIndex >= 0 ? (
          <DragPreview row={activeRow} index={activeIndex} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function createInfoLayerRow(type: INFO_LAYER): InfoLayerRow {
  const labels = INFO_LAYER_MAP[type].defaultProps.labels as string[];
  return {
    id: 0,
    contentTemplateId: 0,
    keyId: crypto.randomUUID(),
    type,
    names: labels.map(() => ''),
    order: 0,
  };
}

export { normalizeOrders };
