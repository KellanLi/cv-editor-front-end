'use client';

import { INFO_LAYER, INFO_LAYER_MAP } from '@/components/info-layer/const';
import { TContent } from '@/types/business/content';
import { TContentTemplate } from '@/types/business/content-template';
import { TInfoTemplate } from '@/types/business/info-template';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState, type MouseEvent } from 'react';

type TInfoTemplateRow = TInfoTemplate & { keyId?: string };

interface IProps {
  contentTemplate: Partial<TContentTemplate> & {
    infoTemplates?: TInfoTemplateRow[];
  };
  status: 'edit' | 'view';
  contents: TContent[];
  onContentsChange: (contents: TContent[]) => void;
}

type ActiveLayer = { contentIndex: number; layerIndex: number };

function sortTemplates(
  rows: TInfoTemplateRow[] | undefined,
): TInfoTemplateRow[] {
  if (!rows?.length) return [];
  return [...rows].sort((a, b) => a.order - b.order);
}

function defaultValuesForType(type: string): string[] {
  const meta = INFO_LAYER_MAP[type as INFO_LAYER];
  if (!meta) return [''];
  return [...(meta.defaultProps.values as string[])];
}

function createContentFromTemplates(templates: TInfoTemplateRow[]): TContent {
  return {
    infos: templates.map((t) => ({
      type: t.type,
      values: defaultValuesForType(t.type),
    })),
  };
}

function rowKey(template: TInfoTemplateRow, layerIndex: number) {
  return template.keyId ?? `${layerIndex}-${template.type}`;
}

function labelsForTemplate(template: TInfoTemplateRow) {
  const meta = INFO_LAYER_MAP[template.type as INFO_LAYER];
  const labelSource = (meta?.defaultProps.labels ?? []) as string[];
  return labelSource.map(
    (_base, fieldIndex) =>
      template.names[fieldIndex]?.trim() ||
      labelSource[fieldIndex] ||
      `字段 ${fieldIndex + 1}`,
  );
}

function getInfoAt(
  content: TContent,
  layerIndex: number,
  template: TInfoTemplateRow,
) {
  const fallback = {
    type: template.type,
    values: defaultValuesForType(template.type),
  };
  const info = content.infos[layerIndex];
  if (!info) return fallback;
  return { type: template.type, values: info.values };
}

export default function SectionRender(props: IProps) {
  const { contentTemplate, status, contents, onContentsChange } = props;
  const templates = useMemo(
    () => sortTemplates(contentTemplate.infoTemplates),
    [contentTemplate.infoTemplates],
  );

  const [active, setActive] = useState<ActiveLayer | null>(null);

  const resolvedActive = useMemo((): ActiveLayer | null => {
    if (status !== 'edit' || !active) return null;
    if (active.contentIndex < 0 || active.contentIndex >= contents.length)
      return null;
    if (active.layerIndex < 0 || active.layerIndex >= templates.length)
      return null;
    return active;
  }, [status, active, contents.length, templates.length]);

  const title = contentTemplate.name?.trim() || '未命名模块';

  const handleAddContent = useCallback(() => {
    if (!templates.length) return;
    onContentsChange([...contents, createContentFromTemplates(templates)]);
    setActive(null);
  }, [contents, onContentsChange, templates]);

  const handleInfoChange = useCallback(
    (contentIndex: number, layerIndex: number, values: string[]) => {
      onContentsChange(
        contents.map((c, ci) => {
          if (ci !== contentIndex) return c;
          const nextInfos = templates.map((t, li) => {
            const prev = c.infos[li];
            const base =
              prev && prev.type === t.type
                ? prev
                : { type: t.type, values: defaultValuesForType(t.type) };
            if (li === layerIndex) return { ...base, values };
            return base;
          });
          return { ...c, infos: nextInfos };
        }),
      );
    },
    [contents, onContentsChange, templates],
  );

  const handleLayerClick = useCallback(
    (event: MouseEvent, contentIndex: number, layerIndex: number) => {
      if (status !== 'edit') return;
      event.stopPropagation();
      setActive({ contentIndex, layerIndex });
    },
    [status],
  );

  const canAddContent = templates.length > 0;

  return (
    <div>
      <header className="border-foreground/10 shrink-0 border-b">
        <h3 className="text-foreground text-lg font-semibold tracking-tight">
          {title}
        </h3>
      </header>

      <div
        className={
          status === 'view'
            ? 'pointer-events-none min-h-0 flex-1 select-none'
            : 'min-h-0 flex-1'
        }
      >
        {contents.length === 0 ? (
          <p className="text-muted text-sm">暂无内容</p>
        ) : (
          contents.map((content, contentIndex) => (
            <div key={contentIndex} className="flex flex-col">
              {templates.map((template, layerIndex) => {
                const meta = INFO_LAYER_MAP[template.type as INFO_LAYER];
                if (!meta) return null;
                const Layer = meta.component;
                const { values } = getInfoAt(content, layerIndex, template);
                const labels = labelsForTemplate(template);
                const isActive =
                  resolvedActive?.contentIndex === contentIndex &&
                  resolvedActive?.layerIndex === layerIndex;

                const boxClass = [
                  'rounded-xl border transition-[border-color,box-shadow,background-color]',
                  status === 'edit' &&
                    !isActive &&
                    'cursor-pointer border-transparent hover:border-default-300 hover:bg-default-100/70',
                  status === 'edit' &&
                    isActive &&
                    'border-accent bg-default-50/90 ring-2 ring-accent/25',
                  status === 'view' && 'border-transparent',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={rowKey(template, layerIndex)}
                    className={boxClass}
                    onClick={(e) =>
                      handleLayerClick(e, contentIndex, layerIndex)
                    }
                    onKeyDown={(e) => {
                      if (status !== 'edit' || isActive) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActive({ contentIndex, layerIndex });
                      }
                    }}
                    role={status === 'edit' && !isActive ? 'button' : undefined}
                    tabIndex={status === 'edit' && !isActive ? 0 : undefined}
                  >
                    <Layer
                      active={Boolean(isActive)}
                      labels={labels}
                      values={values}
                      onChange={(next) =>
                        handleInfoChange(contentIndex, layerIndex, next)
                      }
                    />
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {status === 'edit' ? (
        <div className="border-foreground/10 shrink-0 border-t">
          <Button
            variant="secondary"
            className="inline-flex w-full items-center justify-center gap-2"
            isDisabled={!canAddContent}
            onPress={handleAddContent}
          >
            <Plus className="size-4" aria-hidden />
            添加内容
          </Button>
        </div>
      ) : null}
    </div>
  );
}
