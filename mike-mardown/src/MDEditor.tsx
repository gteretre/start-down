import React, { useRef } from 'react';
import MDRender from './rendermd';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Link as LinkIcon,
  List,
  Code,
  Quote,
  Trash2,
} from 'lucide-react';

type MDEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const MDEditor: React.FC<MDEditorProps> = ({ value, onChange, placeholder, className = '' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = React.useState(false);

  // Helper to insert or wrap selection
  const insertMarkdown = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length + selected.length);
    }, 0);
  };

  // Insert link markdown
  const insertLink = () => {
    insertMarkdown('[', '](url)');
  };

  // Insert unordered list
  const insertList = () => {
    insertMarkdown('- ', '');
  };

  // Insert ordered list
  const insertOrderedList = () => {
    insertMarkdown('1. ', '');
  };

  // Insert code block
  const insertCode = () => {
    insertMarkdown('\n```\n', '\n```\n');
  };

  // Insert quote
  const insertQuote = () => {
    insertMarkdown('> ', '');
  };

  // Insert H2
  const insertH2 = () => {
    insertMarkdown('## ', '');
  };

  // Insert H3
  const insertH3 = () => {
    insertMarkdown('### ', '');
  };

  // Clear editor
  const handleClear = () => {
    onChange('');
    textareaRef.current?.focus();
  };

  // Handle Enter key for lists
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const before = value.slice(0, start);
      const after = value.slice(start);
      // Find the current line
      const lines = before.split(/\r?\n/);
      const currentLine = lines[lines.length - 1];
      // Ordered list: "1. ...", "2. ...", etc.
      const olMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
      if (olMatch) {
        e.preventDefault();
        const indent = olMatch[1] || '';
        const num = parseInt(olMatch[2], 10) + 1;
        const insert = `\n${indent}${num}. `;
        const newValue = before + insert + after;
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + insert.length, start + insert.length);
        }, 0);
        return;
      }
      // Unordered list: "- ..."
      const ulMatch = currentLine.match(/^(\s*)-\s/);
      if (ulMatch) {
        e.preventDefault();
        const indent = ulMatch[1] || '';
        const insert = `\n${indent}- `;
        const newValue = before + insert + after;
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + insert.length, start + insert.length);
        }, 0);
        return;
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          title="Heading 1"
          className="btn-normal"
          onClick={() => insertMarkdown('# ', '')}
        >
          <Heading1 size={18} />
        </button>
        <button type="button" title="Heading 2" className="btn-normal" onClick={insertH2}>
          <Heading2 size={18} />
        </button>
        <button type="button" title="Heading 3" className="btn-normal" onClick={insertH3}>
          <Heading3 size={18} />
        </button>
        <button
          type="button"
          title="Bold"
          className="btn-normal"
          onClick={() => insertMarkdown('**', '**')}
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          title="Italic"
          className="btn-normal"
          onClick={() => insertMarkdown('*', '*')}
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          title="Underline"
          className="btn-normal"
          onClick={() => insertMarkdown('__', '__')}
        >
          <Underline size={18} />
        </button>
        <button type="button" title="Link" className="btn-normal" onClick={insertLink}>
          <LinkIcon size={18} />
        </button>
        <button type="button" title="List" className="btn-normal" onClick={insertList}>
          <List size={18} />
        </button>
        <button
          type="button"
          title="Ordered List"
          className="btn-normal"
          onClick={insertOrderedList}
        >
          1.
        </button>
        <button type="button" title="Code Block" className="btn-normal" onClick={insertCode}>
          <Code size={18} />
        </button>
        <button type="button" title="Quote" className="btn-normal" onClick={insertQuote}>
          <Quote size={18} />
        </button>
        <button type="button" title="Clear" className="btn-normal ml-2" onClick={handleClear}>
          <Trash2 size={18} />
        </button>
        <button
          type="button"
          title="Toggle Preview"
          className="btn-normal ml-auto"
          onClick={() => setShowPreview((v) => !v)}
        >
          <Eye size={18} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={10}
        style={{
          width: '100%',
          fontFamily: 'monospace',
          fontSize: 14,
          padding: 12,
          borderRadius: 8,
        }}
      />
      {showPreview && (
        <div className="articleBox mt-4 border px-8">
          <MDRender markdown={value} />
        </div>
      )}
    </div>
  );
};

export default MDEditor;
