import { EditorContent, useEditor } from '@tiptap/react';
import { TInfoLayerFC } from './hoc';
import StarterKit from '@tiptap/starter-kit';

const RichText: TInfoLayerFC = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! 🌎️</p>',
    immediatelyRender: false,
  });

  return (
    <div>
      <section></section>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichText;
