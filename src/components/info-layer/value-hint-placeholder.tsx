const HINT = '此处点击可输入';

export { HINT as INFO_LAYER_VALUE_HINT };

type TProps = {
  className?: string;
  /** `field`：普通单行高；`editor`：与富文本编辑区同高，便于点选 */
  minHeight?: 'field' | 'editor';
  /** 左右分栏时用于右侧槽位：内容靠右、文案右对齐 */
  endAlign?: boolean;
};

/** Section 为 edit 且信息层未 active 时，为空白 value 提供可点区域与提示。 */
export function ValueHintPlaceholder({
  className,
  minHeight = 'field',
  endAlign = false,
}: TProps) {
  const size =
    minHeight === 'editor'
      ? endAlign
        ? 'flex min-h-[120px] w-full min-w-0 items-center justify-end text-right'
        : 'flex min-h-[120px] w-full min-w-0 items-center justify-center'
      : endAlign
        ? 'flex min-h-10 w-full min-w-0 items-center justify-end text-right'
        : 'flex min-h-10 w-full min-w-0 items-center';
  return (
    <div
      className={[
        'text-default-500 border-default-200/80 select-none border border-dashed px-3 py-2.5 text-sm',
        size,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
    >
      {HINT}
    </div>
  );
}
