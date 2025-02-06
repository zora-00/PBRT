import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  isRichText: boolean;
}

export default function Editor({ content, onChange, isRichText }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: true,
    onUpdate: ({ editor }) => {
      onChange(isRichText ? editor.getHTML() : editor.getText());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      <EditorContent
        editor={editor}
        className="prose max-w-none w-full min-h-[300px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}