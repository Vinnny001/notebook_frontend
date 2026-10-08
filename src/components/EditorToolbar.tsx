import type { Editor } from "@tiptap/react";
import { Bold, Code, Heading1, Heading2, Italic, List, ListChecks, Quote, Save, Table2, Underline } from "lucide-react";

import { Button } from "./ui/Button";

export function EditorToolbar({ editor, onSave }: { editor: Editor | null; onSave: () => void }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
      <Button title="Heading 1" variant="ghost" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 size={16} />
      </Button>
      <Button title="Heading 2" variant="ghost" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={16} />
      </Button>
      <Button title="Bold" variant="ghost" onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={16} />
      </Button>
      <Button title="Italic" variant="ghost" onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={16} />
      </Button>
      <Button title="Underline" variant="ghost" onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline size={16} />
      </Button>
      <Button title="Bullet list" variant="ghost" onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={16} />
      </Button>
      <Button title="Checklist" variant="ghost" onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <ListChecks size={16} />
      </Button>
      <Button title="Code block" variant="ghost" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code size={16} />
      </Button>
      <Button title="Quote" variant="ghost" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={16} />
      </Button>
      <Button title="Table" variant="ghost" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <Table2 size={16} />
      </Button>
      <div className="flex-1" />
      <Button title="Save" onClick={onSave}>
        <Save size={16} />
      </Button>
    </div>
  );
}
