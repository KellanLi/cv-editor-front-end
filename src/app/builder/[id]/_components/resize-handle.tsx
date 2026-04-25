'use client';

import { useState, type PointerEvent as ReactPointerEvent } from 'react';

interface IProps {
  /** 用户可读的无障碍标签，例如「拖动调整左侧面板宽度」 */
  ariaLabel: string;
  /** 拖拽开始时父容器已记录的当前宽度（px） */
  currentWidth: number;
  minWidth: number;
  maxWidth: number;
  /**
   * 将 clientX 的位移（相对 pointerdown 时）转换成"期望宽度"。
   * 左栏返回 `baseWidth + dx`，右栏返回 `baseWidth - dx`。
   */
  computeWidth: (dx: number, baseWidth: number) => number;
  onChange: (nextWidth: number) => void;
  /** 键盘调整步长（px），默认 16 */
  keyboardStep?: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

export default function ResizeHandle(props: IProps) {
  const {
    ariaLabel,
    currentWidth,
    minWidth,
    maxWidth,
    computeWidth,
    onChange,
    keyboardStep = 16,
  } = props;
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const target = e.currentTarget;
    const startX = e.clientX;
    const baseWidth = currentWidth;
    target.setPointerCapture(e.pointerId);
    setDragging(true);

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      onChange(clamp(computeWidth(dx, baseWidth), minWidth, maxWidth));
    };
    const handleUp = (ev: PointerEvent) => {
      target.releasePointerCapture(ev.pointerId);
      target.removeEventListener('pointermove', handleMove);
      target.removeEventListener('pointerup', handleUp);
      target.removeEventListener('pointercancel', handleUp);
      setDragging(false);
    };

    target.addEventListener('pointermove', handleMove);
    target.addEventListener('pointerup', handleUp);
    target.addEventListener('pointercancel', handleUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(clamp(computeWidth(-keyboardStep, currentWidth), minWidth, maxWidth));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(clamp(computeWidth(keyboardStep, currentWidth), minWidth, maxWidth));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(minWidth);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(maxWidth);
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(currentWidth)}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      tabIndex={0}
      data-dragging={dragging || undefined}
      className={[
        'print:hidden group relative z-10 w-1 shrink-0 touch-none cursor-ew-resize select-none outline-none',
        // 扩大点击热区而不改变视觉宽度
        'before:absolute before:inset-y-0 before:-left-1 before:-right-1 before:content-[""]',
      ].join(' ')}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
    >
      <div
        className={[
          'bg-default-200 pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors',
          'group-hover:bg-accent/70 group-focus-visible:bg-accent',
          'group-data-[dragging]:bg-accent',
        ].join(' ')}
      />
    </div>
  );
}
