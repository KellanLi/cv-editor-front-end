import { Extension, type Command } from '@tiptap/core';
import { AllSelection, TextSelection, type Transaction } from '@tiptap/pm/state';

export interface ParagraphIndentOptions {
  /** 允许缩进的节点类型名 */
  types: string[];
  minLevel: number;
  maxLevel: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphIndent: {
      increaseParagraphIndent: () => ReturnType;
      decreaseParagraphIndent: () => ReturnType;
    };
  }
}

/**
 * 段落左缩进（非官方扩展；思路来自社区 issue #1036 / tiptaptop-extension-indent）。
 * 通过节点属性 `indent` 输出 `data-indent`，需配合 Tailwind 或 CSS 显示缩进。
 */
export const ParagraphIndent = Extension.create<ParagraphIndentOptions>({
  name: 'paragraphIndent',

  addOptions() {
    return {
      types: ['paragraph'],
      minLevel: 0,
      maxLevel: 8,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: null,
            parseHTML: (element) => {
              const raw = element.getAttribute('data-indent');
              if (raw == null || raw === '') return null;
              const level = Number.parseInt(raw, 10);
              const { minLevel, maxLevel } = this.options;
              if (Number.isNaN(level) || level <= minLevel) return null;
              return Math.min(level, maxLevel);
            },
            renderHTML: (attributes) => {
              const v = attributes.indent as number | null | undefined;
              const { minLevel } = this.options;
              if (v == null || v <= minLevel) return {};
              return { 'data-indent': String(v) };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    const setNodeIndentMarkup = (
      tr: Transaction,
      pos: number,
      delta: number,
    ): Transaction => {
      const node = tr.doc.nodeAt(pos);
      if (!node) return tr;

      const current = (node.attrs.indent as number | null | undefined) ?? 0;
      const nextLevel = current + delta;
      const { minLevel, maxLevel } = this.options;
      const indent =
        nextLevel < minLevel
          ? minLevel
          : nextLevel > maxLevel
            ? maxLevel
            : nextLevel;

      if (indent === current) return tr;

      const attrs = { ...node.attrs };
      delete attrs.indent;
      const nodeAttrs =
        indent > minLevel ? { ...attrs, indent } : attrs;

      return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
    };

    const updateIndentLevel = (tr: Transaction, delta: number): Transaction => {
      const { doc, selection } = tr;
      if (
        !doc ||
        !selection ||
        (!(selection instanceof TextSelection) &&
          !(selection instanceof AllSelection))
      ) {
        return tr;
      }

      const { from, to } = selection;

      if (from !== to) {
        doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            tr = setNodeIndentMarkup(tr, pos, delta);
            return false;
          }
          return true;
        });
        return tr;
      }

      // 折叠选区：nodesBetween(from, from) 可能不命中块节点，从 $from 向上找段落
      const { $from } = selection;
      for (let d = $from.depth; d > 0; d--) {
        const node = $from.node(d);
        if (this.options.types.includes(node.type.name)) {
          const pos = $from.before(d);
          tr = setNodeIndentMarkup(tr, pos, delta);
          break;
        }
      }

      return tr;
    };

    const applyIndent =
      (direction: number): (() => Command) =>
      () =>
      ({ tr, dispatch }) => {
        // 必须使用当前 tr 上的选区。勿用 state.selection + setSelection：
        // 在 chain().focus().increaseParagraphIndent() 中 tr 可能已有步骤，
        // state.selection 仍指向旧文档，会触发 “Selection must point at the current document”。
        const next = updateIndentLevel(tr, direction);
        if (next.docChanged) {
          dispatch?.(next);
          return true;
        }
        return false;
      };

    return {
      increaseParagraphIndent: applyIndent(1),
      decreaseParagraphIndent: applyIndent(-1),
    };
  },
});
