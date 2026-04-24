'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Label, TextField } from '@heroui/react';
import { inputVariants } from '@heroui/styles';
import InfoLayerHoc, { TFormFC, TShowFC } from './hoc';
import { RichTextToolbar } from './components/rich-text-toolbar';
import { ParagraphIndent } from './components/tiptap-paragraph-indent';

/** Tiptap 空文档；与 StarterKit 默认一致 */
const EMPTY_DOC = '<p></p>';

function normalizeContent(html: string | undefined) {
  const t = html?.trim();
  return t ? html! : EMPTY_DOC;
}

/** 与 `ParagraphIndent` 的 maxLevel=8 对应，供预览与编辑一致 */
const paragraphIndentVisualClasses =
  '[&_p[data-indent="1"]]:pl-[1.25rem] [&_p[data-indent="2"]]:pl-[2.5rem] [&_p[data-indent="3"]]:pl-[3.75rem] [&_p[data-indent="4"]]:pl-[5rem] [&_p[data-indent="5"]]:pl-[6.25rem] [&_p[data-indent="6"]]:pl-[7.5rem] [&_p[data-indent="7"]]:pl-[8.75rem] [&_p[data-indent="8"]]:pl-[10rem]';

const previewClassName =
  'text-sm [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:mb-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_blockquote]:border-l-2 [&_blockquote]:border-default-300 [&_blockquote]:pl-3';

const editorContentClassName = `${previewClassName} ${paragraphIndentVisualClasses}`;

const richTextExtensions = [
  StarterKit,
  ParagraphIndent.configure({
    types: ['paragraph'],
    minLevel: 0,
    maxLevel: 8,
  }),
];

const Form: TFormFC = ({ labels, values, onChange }) => {
  const contentFromParent = values[0];
  const initial = normalizeContent(contentFromParent);

  const editor = useEditor({
    extensions: richTextExtensions,
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `min-h-[120px] w-full outline-none ${editorContentClassName}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange([editor.getHTML()]);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = normalizeContent(contentFromParent);
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, contentFromParent]);

  return (
    <TextField fullWidth>
      <Label>{labels[0]}</Label>
      <div
        data-slot="input"
        className={`${inputVariants({ fullWidth: true, variant: 'primary' })} flex min-h-0 !flex-col !p-0 overflow-hidden transition-[background-color,border-color,box-shadow] [transition-duration:150ms] [transition-timing-function:var(--ease-out)] motion-reduce:transition-none hover:not-focus-within:border-field-border-hover hover:not-focus-within:bg-field-hover focus-within:border-field-border-focus focus-within:bg-field-focus focus-within:status-focused-field`}
      >
        <div className="w-full min-w-0 border-b border-separator">
          <RichTextToolbar editor={editor} />
        </div>
        <div className="min-h-0 px-3 py-2">
          <EditorContent editor={editor} />
        </div>
      </div>
    </TextField>
  );
};

const ShowReadonly: TShowFC = ({ values }) => {
  const contentFromParent = values[0];
  const initial = normalizeContent(contentFromParent);

  const editor = useEditor({
    extensions: richTextExtensions,
    content: initial,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `w-full outline-none ${editorContentClassName}`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = normalizeContent(contentFromParent);
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, contentFromParent]);

  return <EditorContent editor={editor} />;
};

const Show: TShowFC = ({ values }) => {
  const raw = values[0]?.trim() ?? '';
  if (!raw || raw === EMPTY_DOC) {
    return <div />;
  }
  return <ShowReadonly values={values} />;
};

const RichText = InfoLayerHoc({ Form, Show });

export default RichText;
