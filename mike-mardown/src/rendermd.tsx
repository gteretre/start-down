import React from 'react';
import Image from 'next/image';

// Returns a style object for code blocks based on language
function getCodeStyle(lang: string): React.CSSProperties {
  // All code blocks share these base styles
  const base: React.CSSProperties = {
    background: '#222',
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 6,
    overflowX: 'auto', // Correct type for React.CSSProperties
  };
  switch (lang) {
    case 'cpp':
    case 'c++':
      return { ...base, color: '#569CD6' };
    case 'java':
      return { ...base, color: '#B07219' };
    case 'js':
    case 'javascript':
      return { ...base, color: '#F7E018' };
    case 'html':
      return { ...base, color: '#E34C26' };
    default:
      return { ...base, color: '#fff' };
  }
}

// Parses inline markdown elements: images, links, bold, italic, underline, code
function parseInline(
  text: string,
  blockContent: { image?: boolean; code?: boolean; link?: boolean } = {}
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  // Regex for: ![alt](src), [text](url), **bold**, *italic*, __underline__, `code`
  const regex =
    /(!\[([^\]]+)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|__([^_]+)__|`([^`]+)`)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    // Image: ![alt](src)
    if (match[1] && match[2] && match[3]) {
      if (!blockContent.image) {
        result.push(
          <Image
            key={key++}
            alt={match[2]}
            src={match[3]}
            style={{ maxWidth: '100%' }}
            width={800}
            height={800}
            loading="lazy"
          />
        );
      } else {
        result.push(
          <span key={key++} style={{ color: 'red', fontWeight: 600 }}>
            [Image: {match[2]}]
          </span>
        );
      }
    }
    // Link: [text](url)
    else if (match[4] && match[5]) {
      if (!blockContent.link) {
        result.push(
          <a key={key++} href={match[5]} target="_blank" rel="noopener noreferrer">
            {match[4]}
          </a>
        );
      } else {
        result.push(
          <span key={key++} style={{ color: 'red', fontWeight: 600 }}>
            {match[4]}
          </span>
        );
      }
    }
    // Bold: **text**
    else if (match[6]) {
      result.push(<strong key={key++}>{match[6]}</strong>);
    }
    // Italic: *text*
    else if (match[7]) {
      result.push(<em key={key++}>{match[7]}</em>);
    }
    // Underline: __text__
    else if (match[8]) {
      result.push(<u key={key++}>{match[8]}</u>);
    }
    // Inline code: `code`
    else if (match[9]) {
      if (!blockContent.code) {
        result.push(<code key={key++}>{match[9]}</code>);
      } else {
        result.push(
          <span key={key++} style={{ color: 'red', fontWeight: 600 }}>
            [code]
          </span>
        );
      }
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

// Parses block-level markdown: headings, lists, blockquotes, code blocks, horizontal rules, paragraphs
function parseMarkdown(
  md: string,
  blockContent: { image?: boolean; code?: boolean; link?: boolean } = {}
): React.ReactNode[] {
  const lines = md.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inUl = false; // Unordered list
  let inOl = false; // Ordered list
  let inCode = false; // Code block
  let codeLang = '';
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Code block start/end: ```lang
    if (/^```/.test(line)) {
      if (!inCode) {
        inCode = true;
        codeLang = line.replace(/^```/, '').trim();
        codeLines = [];
      } else {
        inCode = false;
        if (!blockContent.code) {
          elements.push(
            <pre key={`code-${i}`} style={getCodeStyle(codeLang)}>
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
        } else {
          elements.push(<div key={`code-blocked-${i}`}>[code block]</div>);
        }
        codeLines = [];
        codeLang = '';
      }
      continue;
    }
    // Inside code block: just collect lines
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    // Horizontal rule: --- *** ___ (with optional spaces)
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      if (inUl) {
        elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        inUl = false;
      }
      if (inOl) {
        elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
        listItems = [];
        inOl = false;
      }
      elements.push(<hr key={`hr-${i}`} />);
      continue;
    }
    // Headings: ###, ##, #
    if (/^### (.*)/.test(line)) {
      if (inUl) {
        elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        inUl = false;
      }
      if (inOl) {
        elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
        listItems = [];
        inOl = false;
      }
      elements.push(<h3 key={i}>{parseInline(line.replace(/^### /, ''), blockContent)}</h3>);
    } else if (/^## (.*)/.test(line)) {
      if (inUl) {
        elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        inUl = false;
      }
      if (inOl) {
        elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
        listItems = [];
        inOl = false;
      }
      elements.push(<h2 key={i}>{parseInline(line.replace(/^## /, ''), blockContent)}</h2>);
    } else if (/^# (.*)/.test(line)) {
      if (inUl) {
        elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        inUl = false;
      }
      if (inOl) {
        elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
        listItems = [];
        inOl = false;
      }
      elements.push(<h1 key={i}>{parseInline(line.replace(/^# /, ''), blockContent)}</h1>);
    }
    // Blockquote: >
    else if (/^> (.*)/.test(line)) {
      if (inUl) {
        elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        inUl = false;
      }
      if (inOl) {
        elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
        listItems = [];
        inOl = false;
      }
      elements.push(
        <blockquote key={i}>{parseInline(line.replace(/^> /, ''), blockContent)}</blockquote>
      );
    }
    // Unordered list: - item
    else if (/^- (.*)/.test(line)) {
      if (!inUl) {
        if (inOl) {
          elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
          listItems = [];
          inOl = false;
        }
        inUl = true;
      }
      const content = line.replace(/^- /, '');
      listItems.push(<li key={i}>{parseInline(content, blockContent)}</li>);
    }
    // Ordered list: 1. item
    else if (/^\d+\. (.*)/.test(line)) {
      const match = line.match(/^(\d+)\. (.*)/);
      const number = match ? match[1] : undefined;
      const content = match ? match[2] : line.replace(/^\d+\. /, '');
      if (!inOl) {
        if (inUl) {
          elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
          listItems = [];
          inUl = false;
        }
        inOl = true;
      }
      listItems.push(
        <li key={i}>
          <span style={{ fontWeight: 400, marginRight: 6 }}>{number}.</span>
          {parseInline(content, blockContent)}
        </li>
      );
    }
    // Blank line: close any open lists
    else if (line.trim() === '') {
      if (inUl) {
        elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        inUl = false;
      }
      if (inOl) {
        elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
        listItems = [];
        inOl = false;
      }
    }
    // Paragraph: fallback for any other line
    else {
      if (inUl) {
        elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        inUl = false;
      }
      if (inOl) {
        elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
        listItems = [];
        inOl = false;
      }
      elements.push(<p key={i}>{parseInline(line, blockContent)}</p>);
    }
  }
  // Close any open lists at the end
  if (inUl) elements.push(<ul key="ul-end">{listItems}</ul>);
  if (inOl) elements.push(<ol key="ol-end">{listItems}</ol>);
  return elements;
}

// Props for the markdown renderer
type MDRenderProps = {
  markdown: string;
  blockContent?: { image?: boolean; code?: boolean; link?: boolean };
};

// Main markdown renderer component
const MDRender: React.FC<MDRenderProps> = ({ markdown, blockContent }) => (
  <div className="mdrender" style={{ fontFamily: 'inherit', fontSize: 16, lineHeight: 1.7 }}>
    {parseMarkdown(markdown, blockContent)}
  </div>
);

export default MDRender;
