---
name: apis-layer
description: >-
  Adds or edits HTTP API wrappers under `src/apis/` using `get`/`post` from
  `@/lib/request` and types under `src/types/api/`. Use when implementing new
  backend endpoints, wiring client calls, or refactoring API modules in this
  repo.
---

# `src/apis/` 编写约定

## 职责

- **只做 HTTP 调用**：每个文件对应一类后端资源（或紧密相关的一组路径），导出若干命名函数。
- **不写业务逻辑**：参数校验、状态更新、UI 由调用方处理。
- **类型外置**：请求体、响应 `data` 的形状放在 `src/types/api/`，跨模块复用的领域模型用 `src/types/business/`（与现有 `TUser`、`TToken` 等一致）。

## 请求层

- 从 `@/lib/request` 引入 `post` 或 `get`。
- 路径为**相对** `BASE_URL`（`/api/v1`）的字符串，以 `/` 开头，例如 `'/content-template/list'`。
- `post<T, D>(url, data?)`：`T` 为响应体里 **`data` 字段**的类型（`BaseResponse<T>` 由 `post` 的返回类型体现）。
- `get<T, D>(url, param)`：`param` 为可序列化到 query 的对象；无 query 时传空对象 `{}`（若将来有 `get` 无参封装再统一）。

```ts
import { post } from '@/lib/request';
import type { TFooReq } from '@/types/api/foo/bar';
import type { TFooRes } from '@/types/api/foo/baz';

export function fetchFoo(params: TFooReq) {
  return post<TFooRes>('/foo/bar', params);
}
```

无请求体时仍可用 `post`（`data` 省略），与 `userDetail` 一致：

```ts
export function userDetail() {
  return post<TUser>('/user/detail');
}
```

## 文件与命名

- **文件名**：kebab-case，与资源或路径前缀一致，如 `content-template.ts`、`auth.ts`。
- **导出函数**：动词或 CRUD 语义清晰：`login`、`list`、`create`、`update`。
- **避免保留字**：删除类接口若路径为 `delete`，函数名用 `remove`，并用一行 JSDoc 说明原因（见 `content-template.ts`）。
- **聚合导出**（可选）：若存在 `section.ts` 这类 barrel，仅做 `export { ... } from './xxx'`，不混入实现。

## 类型文件（`src/types/api/`）

- 按资源分子目录：`types/api/content-template/list.ts`。
- 命名前缀 **`T`**：`TContentTemplateListReq`、`TContentTemplateListRes`。
- 列表类响应常拆 `Req` / `Res`，DTO 单文件 `dto.ts`；与 OpenAPI 对齐时在类型旁用简短注释标一下（见 `list.ts` 中 pagination 注释）。
- 认证等响应可组合 `types/business` 中的类型，避免在 `apis` 里重复声明结构。

## 风格细节（与现有示例对齐）

- import 路径使用 `@/`，字符串引号与邻近文件一致（本项目以单引号为主）。
- 函数体可直接 `return post(...)`，不必额外包一层 `async/await`，除非需要在此层做 `try/catch` 或顺序组合多个请求。
- 新增接口时：**先补或对齐 `types/api`（及必要时 `business`）**，再写 `apis` 中的薄封装。

## 自检清单

- [ ] 路径与后端路由一致，且带前导 `/`。
- [ ] `post`/`get` 泛型 `T` 对应的是 **`data` 内层类型**，不是整包 `BaseResponse`。
- [ ] 未在 `apis` 内写死魔法字符串以外的重复类型；复杂结构已进 `types/api`。
- [ ] 未使用 `delete` 等保留字作为导出名（必要时 `remove` + 注释）。
