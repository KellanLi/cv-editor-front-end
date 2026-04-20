/**
 * 批量创建内容模块（Content Template），用于分页等联调。
 *
 * 用法：
 *   TOKEN='Bearer eyJ...' node scripts/bulk-create-content-templates.mjs
 *   TOKEN='eyJ...' COUNT=40 API_BASE=http://localhost:3000/api/v1 node scripts/bulk-create-content-templates.mjs
 *
 * TOKEN：登录后接口用的 JWT（可带或不带前缀 `Bearer `）。
 * API_BASE：默认直连后端 `http://localhost:3000/api/v1`（与 next.config 里 rewrites 目标一致）。
 *            若只起了前端、走后端代理，可设为 `http://localhost:8080/api/v1`。
 * COUNT：默认 40。
 *
 * 浏览器里取 token：登录后打开控制台执行
 *   JSON.parse(localStorage.getItem('token')).value
 * 将得到的字符串赋给环境变量 TOKEN 即可。
 */

const API_BASE = process.env.API_BASE ?? 'http://localhost:3000/api/v1';
const COUNT = Number.parseInt(process.env.COUNT ?? '40', 10);
let auth = process.env.TOKEN ?? '';

if (!auth) {
  console.error('请设置环境变量 TOKEN（登录后的 JWT）。');
  process.exit(1);
}

if (!/^Bearer\s/i.test(auth)) {
  auth = `Bearer ${auth}`;
}

const minimalInfoTemplates = [
  {
    type: 'TITLE_AND_TIME_PERIOD',
    names: ['标题', '时间段'],
    order: 0,
  },
];

async function createOne(index) {
  const name = `分页测试-${String(index).padStart(2, '0')}-${Date.now()}`;
  const res = await fetch(`${API_BASE}/content-template/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
    },
    body: JSON.stringify({
      name,
      infoTemplates: minimalInfoTemplates,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${JSON.stringify(body)}`);
  }
  if (body.code !== 0) {
    throw new Error(body.message ?? JSON.stringify(body));
  }
  return body.data;
}

async function main() {
  console.log(`API_BASE=${API_BASE} COUNT=${COUNT}`);
  let ok = 0;
  for (let i = 1; i <= COUNT; i++) {
    try {
      const data = await createOne(i);
      ok++;
      console.log(`[${i}/${COUNT}] ok id=${data?.id} name=${data?.name}`);
    } catch (e) {
      console.error(`[${i}/${COUNT}] failed`, e.message ?? e);
      process.exit(1);
    }
  }
  console.log(`Done. Created ${ok} templates.`);
}

main();
