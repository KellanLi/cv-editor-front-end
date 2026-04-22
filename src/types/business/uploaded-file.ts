/** 与接口文档 `UploadStorageDataDto` 字段一致 */
export type TUploadedFile = {
  /** 浏览器可直接使用的路径（含全局前缀） */
  url: string;
  /** 磁盘上的文件名（UUID + 扩展名） */
  storedName: string;
  originalName: string;
  mimeType: string;
  /** 字节大小 */
  size: number;
};
