/**
 * 简历封面 / 调试图截图失败时统一在控制台打日志，便于过滤与排查（尤其 lab/oklch 相关）。
 *
 * 现用依赖：`html2canvas-pro`（对 lab/oklch 等较官方 `html2canvas` 更完整）。
 * 社区参考：https://github.com/niklasvh/html2canvas/issues/3269
 * 上游 fork：https://github.com/yorickshan/html2canvas-pro
 */
export function logResumeCoverError(phase: string, error: unknown) {
  const e = error instanceof Error ? error : new Error(String(error));
  const isColorFn =
    /unsupported color function|lab\)|oklch\)|oklab\)/i.test(e.message) ||
    /unsupported color function|lab\)|oklch\)|oklab\)/i.test(String(e));

  // eslint-disable-next-line no-console -- 明确供本地/生产排查
  console.error(
    '[resume cover]',
    phase,
    e.message,
    isColorFn
      ? '（与 Tailwind 4 / 现代 CSS 颜色有关时，可确认已用 html2canvas-pro；仍失败请看完整 stack）'
      : '',
    e,
  );
}
