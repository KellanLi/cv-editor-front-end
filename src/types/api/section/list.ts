import type { TContentTemplateDto } from '@/types/api/content-template/dto';
import type {
  TContentTemplateListReq,
  TContentTemplateListRes,
} from '@/types/api/content-template/list';
import type { TInfoTemplate } from '@/types/business/info-template';

export type TList = TContentTemplateListReq;

/** 列表项：接口为 `ContentTemplateDto`；若服务端附带信息层可写入 `infoTemplates` */
export type TContentTemplateItem = TContentTemplateDto & {
  infoTemplates?: TInfoTemplate[];
};

export type TListRes = Omit<TContentTemplateListRes, 'list'> & {
  list: TContentTemplateItem[];
};
