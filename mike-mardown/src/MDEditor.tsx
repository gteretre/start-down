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
  Image as ImageIcon,
  Minus,
  Code2,
} from 'lucide-react';

type MDEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  blockContent?: { image?: boolean; code?: boolean; link?: boolean };
};

const MDEditor: React.FC<MDEditorProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  blockContent = {},
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = React.useState(false);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.style.minHeight = textarea.scrollHeight + 'px';
    }
  }, [value]);

  const insertMarkdown = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length + selected.length);
    }, 0);
  };

  // Helper to validate image URLs
  const isValidImageUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const allowedProtocols = ['http:', 'https:'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const ext = parsed.pathname.toLowerCase().split('.').pop();
      return (
        allowedProtocols.includes(parsed.protocol) &&
        ext &&
        allowedExtensions.some((e) => parsed.pathname.toLowerCase().endsWith(e))
      );
    } catch {
      return false;
    }
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

  // Insert horizontal rule
  const insertHr = () => {
    insertMarkdown('\n---\n', '');
  };

  // Insert image
  const insertImage = () => {
    const url = window.prompt(
      'Enter image URL (http(s)://... and must be .jpg/.png/.gif/.webp/.svg):'
    );
    if (!url) return;
    if (!isValidImageUrl(url)) {
      window.alert(
        'Invalid or unsafe image URL. Please use a valid http(s) image link ending with .jpg, .png, .gif, .webp, or .svg.'
      );
      return;
    }
    insertMarkdown(`![alt](${url})`, '');
  };

  // Insert inline code
  const insertInlineCode = () => {
    insertMarkdown('`', '`');
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
      const olMatch = currentLine.match(/^(\s*)(\d+)\.\s*$/);
      if (olMatch) {
        // If the line is just '1. ' (or similar), remove it and break the list
        e.preventDefault();
        // Remove the current line
        const beforeLines = lines.slice(0, -1).join('\n');
        const newValue = (beforeLines ? beforeLines + '\n' : '') + after;
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          const pos = beforeLines.length ? beforeLines.length + 1 : 0;
          textarea.setSelectionRange(pos, pos);
        }, 0);
        return;
      }
      // Unordered list: "- ..."
      const ulMatch = currentLine.match(/^(\s*)-\s*$/);
      if (ulMatch) {
        // If the line is just '- ', remove it and break the list
        e.preventDefault();
        // Remove the current line
        const beforeLines = lines.slice(0, -1).join('\n');
        const newValue = (beforeLines ? beforeLines + '\n' : '') + after;
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          const pos = beforeLines.length ? beforeLines.length + 1 : 0;
          textarea.setSelectionRange(pos, pos);
        }, 0);
        return;
      }
      // Ordered list: "1. ...", "2. ...", etc. (continue numbering)
      const olContinueMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
      if (olContinueMatch) {
        e.preventDefault();
        const indent = olContinueMatch[1] || '';
        const num = parseInt(olContinueMatch[2], 10) + 1;
        const insert = `\n${indent}${num}. `;
        const newValue = before + insert + after;
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + insert.length, start + insert.length);
        }, 0);
        return;
      }
      // Unordered list: "- ..." (continue list)
      const ulContinueMatch = currentLine.match(/^(\s*)-\s/);
      if (ulContinueMatch) {
        e.preventDefault();
        const indent = ulContinueMatch[1] || '';
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

  const minHeight = textareaRef.current ? textareaRef.current.scrollHeight : undefined;

  // Define all insert functions in a single object for cleaner button handlers
  const insertFns = {
    insertMarkdown,
    insertH2,
    insertH3,
    insertLink,
    insertList,
    insertOrderedList,
    insertCode,
    insertQuote,
    insertHr,
    insertImage,
    insertInlineCode,
    handleClear,
    setShowPreview,
  };

  // Toolbar button definitions
  const TOOLBAR_BUTTONS = [
    {
      key: 'h1',
      title: 'Heading 1',
      icon: Heading1,
      onClick: ({ insertMarkdown }: typeof insertFns) => insertMarkdown('# ', ''),
    },
    {
      key: 'h2',
      title: 'Heading 2',
      icon: Heading2,
      onClick: ({ insertH2 }: typeof insertFns) => insertH2(),
    },
    {
      key: 'h3',
      title: 'Heading 3',
      icon: Heading3,
      onClick: ({ insertH3 }: typeof insertFns) => insertH3(),
    },
    {
      key: 'bold',
      title: 'Bold',
      icon: Bold,
      onClick: ({ insertMarkdown }: typeof insertFns) => insertMarkdown('**', '**'),
    },
    {
      key: 'italic',
      title: 'Italic',
      icon: Italic,
      onClick: ({ insertMarkdown }: typeof insertFns) => insertMarkdown('*', '*'),
    },
    {
      key: 'underline',
      title: 'Underline',
      icon: Underline,
      onClick: ({ insertMarkdown }: typeof insertFns) => insertMarkdown('__', '__'),
    },
    {
      key: 'link',
      title: 'Link',
      icon: LinkIcon,
      blockKey: 'link',
      onClick: ({ insertLink }: typeof insertFns) => insertLink(),
      blockLabel: 'Link Blocked',
    },
    {
      key: 'ul',
      title: 'List',
      icon: List,
      onClick: ({ insertList }: typeof insertFns) => insertList(),
    },
    {
      key: 'ol',
      title: 'Ordered List',
      label: '1.',
      onClick: ({ insertOrderedList }: typeof insertFns) => insertOrderedList(),
    },
    {
      key: 'code',
      title: 'Code Block',
      icon: Code,
      blockKey: 'code',
      onClick: ({ insertCode }: typeof insertFns) => insertCode(),
      blockLabel: 'Code Blocked',
    },
    {
      key: 'inlineCode',
      title: 'Inline Code',
      icon: Code2,
      blockKey: 'code',
      onClick: ({ insertInlineCode }: typeof insertFns) => insertInlineCode(),
      blockLabel: 'Inline Code Blocked',
    },
    {
      key: 'image',
      title: 'Image',
      icon: ImageIcon,
      blockKey: 'image',
      onClick: ({ insertImage }: typeof insertFns) => insertImage(),
      blockLabel: 'Image Blocked',
    },
    {
      key: 'hr',
      title: 'Horizontal Rule',
      icon: Minus,
      onClick: ({ insertHr }: typeof insertFns) => insertHr(),
    },
    {
      key: 'quote',
      title: 'Quote',
      icon: Quote,
      onClick: ({ insertQuote }: typeof insertFns) => insertQuote(),
    },
    {
      key: 'clear',
      title: 'Clear',
      icon: Trash2,
      onClick: ({ handleClear }: typeof insertFns) => handleClear(),
    },
    {
      key: 'preview',
      title: 'Toggle Preview',
      icon: Eye,
      onClick: ({ setShowPreview }: typeof insertFns) => setShowPreview((v: boolean) => !v),
      extraClass: 'ml-auto',
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {TOOLBAR_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          const isBlocked =
            btn.blockKey && blockContent && blockContent[btn.blockKey as keyof typeof blockContent];
          if (isBlocked) {
            return (
              <span key={btn.key} style={{ color: 'red', fontWeight: 600, padding: '0 8px' }}>
                {btn.blockLabel || `${btn.title} Blocked`}
              </span>
            );
          }
          if (btn.label) {
            return (
              <button
                key={btn.key}
                type="button"
                title={btn.title}
                className="btn-normal"
                onClick={() => btn.onClick(insertFns)}
              >
                {btn.label}
              </button>
            );
          }
          return (
            <button
              key={btn.key}
              type="button"
              title={btn.title}
              className={`btn-normal${btn.extraClass ? ' ' + btn.extraClass : ''} p-2`}
              onClick={() => btn.onClick(insertFns)}
            >
              {Icon && <Icon size={18} />}
            </button>
          );
        })}
      </div>
      <textarea
        ref={textareaRef}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={8}
        style={{
          width: '100%',
          fontFamily: 'monospace',
          fontSize: 14,
          padding: 12,
          borderRadius: 8,
          overflow: 'hidden',
          minHeight,
        }}
      />
      {showPreview && (
        <div className="articleBox mt-4 border px-8">
          <MDRender markdown={value} blockContent={blockContent} />
        </div>
      )}
    </div>
  );
};

export default MDEditor;
