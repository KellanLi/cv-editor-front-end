import { request } from '@/lib/request';
import type { BaseResponse } from '@/types/api/base-response';
import type { TUploadedFile } from '@/types/business/uploaded-file';

/**
 * 上传图片（multipart/form-data）。
 * 不使用 `post`：需浏览器自动生成 `multipart` 边界，
 * 由 `request` 识别 `FormData` 自动跳过默认 JSON Content-Type。
 */
export function upload(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<BaseResponse<TUploadedFile>>('/storage/upload', {
    method: 'POST',
    body: formData,
  });
}

/**
 * 根据 `storedName` 拼接图片访问地址，直接用于 `<img src>` 等场景。
 * 注意：`upload` 返回的 `TUploadedFile.url` 已经可直接使用，
 * 仅在仅持有 `storedName` 时才需要该 helper。
 */
export function fileUrl(storedName: string) {
  return `/api/v1/storage/file/${encodeURIComponent(storedName)}`;
}
