import { INFO_LAYER, INFO_LAYER_MAP } from '@/components/info-layer/const';
import type { TContentTemplateItem } from '@/types/api/section/list';
import type { TContent } from '@/types/business/content';
import type { TInfoTemplate } from '@/types/business/info-template';

const FALLBACK_LAYERS: INFO_LAYER[] = [
  INFO_LAYER.TITLE_AND_TIME_PERIOD,
  INFO_LAYER.LEFT_AND_RIGHT_TEXT,
  INFO_LAYER.RICH_TEXT,
];

export type TPreviewInfoRow = TInfoTemplate & { keyId: string };

export type TSectionPreviewModel = {
  infoRows: TPreviewInfoRow[];
  contents: TContent[];
};

export function buildSectionPreviewModel(
  item: TContentTemplateItem,
): TSectionPreviewModel {
  let infoRows: TPreviewInfoRow[];

  if (item.infoTemplates?.length) {
    infoRows = [...item.infoTemplates]
      .sort((a, b) => a.order - b.order)
      .map((t, i) => ({
        ...t,
        keyId: `layer-${item.id}-${i}`,
      }));
  } else {
    infoRows = FALLBACK_LAYERS.map((type, order) => {
      const meta = INFO_LAYER_MAP[type];
      const labels = (meta.defaultProps.labels ?? []) as string[];
      return {
        type,
        names: labels.map((label) => label),
        order,
        keyId: `fallback-${item.id}-${order}`,
      };
    });
  }

  const contents: TContent[] = [
    {
      infos: infoRows.map((t) => {
        const meta = INFO_LAYER_MAP[t.type as INFO_LAYER];
        const values = meta
          ? [...(meta.defaultProps.values as string[])]
          : [''];
        return { type: t.type, values };
      }),
    },
  ];

  return { infoRows, contents };
}
