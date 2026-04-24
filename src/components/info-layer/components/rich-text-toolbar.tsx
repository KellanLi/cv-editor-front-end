'use client';

import { useEffect, useReducer, type ComponentProps } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Button,
  BUTTON_GROUP_CHILD,
  ButtonGroup,
  Separator,
  ToggleButton,
  Toolbar,
} from '@heroui/react';
import {
  Bold,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  Undo2,
} from 'lucide-react';

/**
 * `ButtonGroup` injects `__button_group_child` on direct children; `Button` strips
 * it but `ButtonGroup.Separator` forwards it to a DOM `span` — strip it here.
 * (HeroUI: `ButtonGroup` clones direct children and merges `[BUTTON_GROUP_CHILD]`.)
 */
type SafeButtonGroupSeparatorProps = ComponentProps<typeof ButtonGroup.Separator> & {
  __button_group_child?: boolean;
};

function SafeButtonGroupSeparator(props: SafeButtonGroupSeparatorProps) {
  const { [BUTTON_GROUP_CHILD]: _inGroup, ...rest } = props;
  return <ButtonGroup.Separator {...rest} />;
}

function useEditorTransactionSync(editor: Editor | null) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    if (!editor) return;
    const onTx = () => tick();
    editor.on('transaction', onTx);
    return () => {
      editor.off('transaction', onTx);
    };
  }, [editor]);
}

export function RichTextToolbar({ editor }: { editor: Editor | null }) {
  useEditorTransactionSync(editor);

  if (!editor) {
    return null;
  }

  const can = editor.can();

  return (
    <Toolbar
      aria-label="富文本格式"
      className="box-border w-full min-w-0 flex-wrap gap-1 px-2 py-1.5"
    >
      <ButtonGroup size="sm" variant="tertiary">
        <Button
          isIconOnly
          aria-label="撤销"
          isDisabled={!can.undo()}
          onPress={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={16} />
        </Button>
        <SafeButtonGroupSeparator />
        <Button
          isIconOnly
          aria-label="重做"
          isDisabled={!can.redo()}
          onPress={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={16} />
        </Button>
      </ButtonGroup>

      <Separator className="mx-0.5 h-6" orientation="vertical" />

      <div className="flex items-center gap-0.5">
        <ToggleButton
          isIconOnly
          aria-label="加粗"
          isSelected={editor.isActive('bold')}
          size="sm"
          variant="ghost"
          onPress={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToggleButton>
        <ToggleButton
          isIconOnly
          aria-label="斜体"
          isSelected={editor.isActive('italic')}
          size="sm"
          variant="ghost"
          onPress={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToggleButton>
      </div>

      <Separator className="mx-0.5 h-6" orientation="vertical" />

      <div className="flex items-center gap-0.5">
        <ToggleButton
          isIconOnly
          aria-label="无序列表"
          isSelected={editor.isActive('bulletList')}
          size="sm"
          variant="ghost"
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToggleButton>
        <ToggleButton
          isIconOnly
          aria-label="有序列表"
          isSelected={editor.isActive('orderedList')}
          size="sm"
          variant="ghost"
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToggleButton>
      </div>

      <Separator className="mx-0.5 h-6" orientation="vertical" />

      <ButtonGroup size="sm" variant="tertiary">
        <Button
          isIconOnly
          aria-label="增加段落缩进"
          isDisabled={!can.increaseParagraphIndent()}
          onPress={() => editor.chain().focus().increaseParagraphIndent().run()}
        >
          <IndentIncrease size={16} />
        </Button>
        <SafeButtonGroupSeparator />
        <Button
          isIconOnly
          aria-label="减少段落缩进"
          isDisabled={!can.decreaseParagraphIndent()}
          onPress={() => editor.chain().focus().decreaseParagraphIndent().run()}
        >
          <IndentDecrease size={16} />
        </Button>
      </ButtonGroup>

      <Separator className="mx-0.5 h-6" orientation="vertical" />

      <ButtonGroup size="sm" variant="tertiary">
        <Button
          isIconOnly
          aria-label="清除字体格式"
          onPress={() => editor.chain().focus().unsetAllMarks().run()}
        >
          <RemoveFormatting size={16} />
        </Button>
      </ButtonGroup>
    </Toolbar>
  );
}
