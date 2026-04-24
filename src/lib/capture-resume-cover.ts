import html2canvas from 'html2canvas-pro';
import { logResumeCoverError } from '@/lib/resume-cover-error-log';

/**
 * 从「仅给 html2canvas 用的克隆 document」上移除仍含 lab()/oklch() 的样式表，并内联可解析色值。
 * 截图库使用 `html2canvas-pro`（相对官方 html2canvas 对 lab/oklch 等更友好，见同目录说明）。
 */
function stripClonedGlobalStyles(cloned: Document) {
  cloned
    .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    .forEach((e) => e.remove());
  cloned.querySelectorAll('style').forEach((e) => e.remove());
}

/** 若出现在属性值里，html2canvas 1.x 会抛错，须先解析成 rgb/hex。 */
const MODERN_COLOR_FUNC_RE =
  /\b(?:lab|lch|oklch|oklab|color|hwb|device-cmyk)\s*\(/i;

function parenGroupEnd(s: string, openParenIdx: number): number | null {
  if (s[openParenIdx] !== '(') {
    return null;
  }
  let d = 0;
  for (let j = openParenIdx; j < s.length; j += 1) {
    if (s[j] === '(') {
      d += 1;
    } else if (s[j] === ')') {
      d -= 1;
      if (d === 0) {
        return j + 1;
      }
    }
  }
  return null;
}

/**
 * 将值串中的 lab()/oklch() 等片段用 Canvas 的 fillStyle 解析为浏览器可序列化的颜色串，
 * 避免写回 DOM 后仍含 lab(…) 而触发 html2canvas 报错。最多替换 `maxR` 处，单串通常 0～3 次。
 */
function replaceModernColorSubstringsInValue(
  value: string,
  colorCtx: CanvasRenderingContext2D,
  maxR: number = 32,
): string {
  if (!MODERN_COLOR_FUNC_RE.test(value)) {
    return value;
  }
  const pattern = new RegExp(MODERN_COLOR_FUNC_RE.source, 'gi');
  let out = value;
  let count = 0;
  let searchFrom = 0;
  while (count < maxR) {
    pattern.lastIndex = searchFrom;
    const m = pattern.exec(out);
    if (!m) {
      break;
    }
    const i0 = m.index;
    const openParen = i0 + m[0].length - 1;
    if (out[openParen] !== '(') {
      searchFrom = i0 + 1;
      continue;
    }
    const iEnd = parenGroupEnd(out, openParen);
    if (iEnd == null) {
      break;
    }
    const full = out.slice(i0, iEnd);
    let repl = 'rgba(0,0,0,0.5)';
    try {
      colorCtx.fillStyle = '#000000';
      colorCtx.fillStyle = full;
      repl = String(colorCtx.fillStyle);
    } catch {
      /* 保持回退 */
    }
    out = out.slice(0, i0) + repl + out.slice(iEnd);
    count += 1;
    searchFrom = 0;
  }
  return out;
}

/**
 * 与「全量遍历 getComputedStyle 的几百个属性」不同：
 * 只内联**固定白名单**；若该属性为颜色相关，可能仍含 `lab(…)`（getComputedStyle 在部分
 * 引擎直接序列化为现代色彩空间），在写回前再经 Canvas 解成可解析的 rgb。
 */
const INLINING_PROP_NAMES: readonly string[] = [
  'box-sizing',
  'display',
  'visibility',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'z-index',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-width',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-style',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'background',
  'background-color',
  'background-image',
  'background-size',
  'background-repeat',
  'background-position',
  'background-clip',
  'color',
  'opacity',
  'box-shadow',
  'outline',
  'outline-color',
  'outline-width',
  'outline-style',
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-decoration',
  'text-shadow',
  'text-transform',
  'white-space',
  'word-break',
  'vertical-align',
  'flex',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'align-self',
  'justify-content',
  'gap',
  'transform',
  'transform-origin',
  'overflow',
  'overflow-x',
  'overflow-y',
  'list-style',
  'list-style-type',
  'object-fit',
  'object-position',
];

function inlineWhitelistedSnapshotStyles(
  sourceRoot: HTMLElement,
  cloneRoot: HTMLElement,
) {
  const colorCanvas = document.createElement('canvas');
  const colorCtx = colorCanvas.getContext('2d');
  if (!colorCtx) {
    return;
  }
  const visit = (source: Element, target: Element) => {
    if (source.nodeName !== target.nodeName) {
      return;
    }
    if (source instanceof HTMLElement && target instanceof HTMLElement) {
      const cs = getComputedStyle(source);
      for (const prop of INLINING_PROP_NAMES) {
        const raw = cs.getPropertyValue(prop);
        if (raw) {
          const val = MODERN_COLOR_FUNC_RE.test(raw)
            ? replaceModernColorSubstringsInValue(raw, colorCtx, 32)
            : raw;
          try {
            target.style.setProperty(prop, val, 'important');
          } catch {
            /* 个别只读/非法组合 */
          }
        }
      }
    }
    const n = Math.min(source.children.length, target.children.length);
    for (let i = 0; i < n; i += 1) {
      visit(source.children[i] as Element, target.children[i] as Element);
    }
  };
  visit(sourceRoot, cloneRoot);
}

/** 竖版 A4：短边:长边 = 210:297，故 高/宽 = 297/210（与列表封面、调试图一致） */
export const A4_HEIGHT_PER_WIDTH = 297 / 210;

export type TResumeCoverCaptureOptions = {
  /**
   * 输出高 ÷ 宽。默认 A4 竖版（`297/210`），与物理 A4 纸 210mm×297mm 一致。
   * 设更大则同宽下截得更「长」。
   */
  heightPerWidth?: number;
  /**
   * 输出缩放；略大于 1 在列表中更清晰，过大则体积与耗时会上升
   * @default 1.25
   */
  scale?: number;
};

function waitTwoAnimationFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/** 避免截进 :hover / 焦点 等「悬浮」态；父级设 `pointer-events: none` 后子节点不再被命中，hover 会清掉。 */
function prepareDomForCapture(node: HTMLElement) {
  const active = document.activeElement;
  if (active instanceof HTMLElement && node.contains(active)) {
    active.blur();
  }
  const prev = node.style.pointerEvents;
  node.style.pointerEvents = 'none';
  return prev;
}

function restorePointerEvents(node: HTMLElement, prev: string) {
  if (prev === '') {
    node.style.removeProperty('pointer-events');
  } else {
    node.style.setProperty('pointer-events', prev);
  }
}

/**
 * 将节点渲染为位图，再按「宽=整幅宽、高=宽×(默认 A4)」从顶部裁切（或底部留白），输出 PNG。
 */
export async function captureResumeCoverToPng(
  node: HTMLElement,
  options: TResumeCoverCaptureOptions = {},
): Promise<Blob> {
  const scale = options.scale ?? 1.25;
  const heightPerWidth = options.heightPerWidth ?? A4_HEIGHT_PER_WIDTH;

  const prevPe = prepareDomForCapture(node);
  let full: HTMLCanvasElement;
  try {
    await waitTwoAnimationFrames();
    full = await html2canvas(node, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedEl) => {
        stripClonedGlobalStyles(clonedDoc);
        inlineWhitelistedSnapshotStyles(node, clonedEl);
      },
    });
  } catch (e) {
    logResumeCoverError('html2canvas 渲染', e);
    throw e;
  } finally {
    restorePointerEvents(node, prevPe);
  }

  const w = full.width;
  if (w <= 0) {
    throw new Error('capture: empty width');
  }
  /** 与 A4 成比例的输出高度（设备像素） */
  const a4H = Math.round(w * heightPerWidth);
  if (a4H <= 0) {
    throw new Error('capture: empty height');
  }
  const srcH = Math.min(a4H, full.height);

  const out = document.createElement('canvas');
  out.width = w;
  out.height = a4H;
  const ctx = out.getContext('2d');
  if (!ctx) {
    throw new Error('capture: 2d context');
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, a4H);
  ctx.drawImage(full, 0, 0, w, srcH, 0, 0, w, srcH);

  return new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('capture: toBlob failed'));
      },
      'image/png',
      0.92,
    );
  });
}
