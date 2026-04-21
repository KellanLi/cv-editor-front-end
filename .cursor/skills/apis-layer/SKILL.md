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
- **类型外置**：请求体、分页等与接口契约相关的类型放在 `src/types/api/`；**实体与领域结构**（用户、简历、模块、信息层、内容模版等）放在 `src/types/business/`，由 `types/api` 的 `Req` / `Res` **引用** business 类型，避免重复声明。

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

## 类型文件

### `src/types/business/`（领域实体）

- 存放 **`TUser`、`TResume`、`TSection`、`TContentTemplate`、`TInfoTemplate`** 等与产品概念一致的结构。
- **前端类型名不使用后端后缀**：禁止 `*Dto` 等与 OpenAPI 机械对应的命名；用领域含义命名即可。
- 接口返回的嵌套结构（如模块下的 `contents` / `infos`）若多处复用，也放在 business 或拆成贴近业务的命名，由 `types/api` 引用。

### `src/types/api/`（按资源的请求/响应契约）

- 按资源分子目录：`types/api/content-template/list.ts`。
- 命名前缀 **`T`**：`TContentTemplateListReq`、`TContentTemplateListRes`。
- 列表类响应常拆 `Req` / `Res`；**列表项、单条详情等实体类型从 `@/types/business/...` 引入**，例如 `TContentTemplateListRes` 的 `list` 为 `TContentTemplate[]`（见 `list.ts`）。
- 认证等响应可组合 `types/business` 中的类型，避免在 `apis` 或 `types/api` 里重复声明同一实体。

## 风格细节（与现有示例对齐）

- import 路径使用 `@/`，字符串引号与邻近文件一致（本项目以单引号为主）。
- 函数体可直接 `return post(...)`，不必额外包一层 `async/await`，除非需要在此层做 `try/catch` 或顺序组合多个请求。
- 新增接口时：**先对齐 `types/business` 与 `types/api`（Req/Res）**，再写 `apis` 中的薄封装。

## 自检清单

- [ ] 路径与后端路由一致，且带前导 `/`。
- [ ] `post`/`get` 泛型 `T` 对应的是 **`data` 内层类型**，不是整包 `BaseResponse`。
- [ ] 未在 `types/api` 用 `*Dto` 重复定义已在 business 中的实体；复杂领域结构在 `business`。
- [ ] 未使用 `delete` 等保留字作为导出名（必要时 `remove` + 注释）。
