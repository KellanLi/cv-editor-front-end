import type { FrontLayerType } from '@/components/front-layer/const';

export interface LayerItem<PropsType = unknown> {
  id: string;
  type: FrontLayerType;
  props?: PropsType;
}

export interface TemplateItem {
  id: string;
  template_name: string;
  template_layers: LayerItem[];
}

export interface LocalTemplateListData {
  data: TemplateItem[];
}

export type TCreateTemplate = Omit<TemplateItem, 'id'>;
