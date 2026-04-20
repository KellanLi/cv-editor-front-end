import type { TContentTemplateDto } from './dto';
import type { IPagination } from '../pagination';

export type TContentTemplateListFilter = {
  name: string;
};

export type TContentTemplateListReq = {
  filter: TContentTemplateListFilter;
  pagination: IPagination;
};

/** 与 OpenAPI `ListDataDto.pagination` / `PaginationDto` 一致 */
export type TContentTemplateListPaginationRes = {
  page: number;
  pageSize: number;
  total: number;
};

export type TContentTemplateListRes = {
  list: TContentTemplateDto[];
  pagination: TContentTemplateListPaginationRes;
};
