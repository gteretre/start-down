import React from 'react';

function parseInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  // Regex for **bold**, *italic*, __underline__, `code`
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(__([^_]+)__)|(`([^`]+)`)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      result.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      result.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5]) {
      result.push(<u key={key++}>{match[6]}</u>);
    } else if (match[7]) {
      result.push(<code key={key++}>{match[8]}</code>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

function parseMarkdown(md: string): React.ReactNode[] {
  const lines = md.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
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
      elements.push(<h3 key={i}>{parseInline(line.replace(/^### /, ''))}</h3>);
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
      elements.push(<h2 key={i}>{parseInline(line.replace(/^## /, ''))}</h2>);
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
      elements.push(<h1 key={i}>{parseInline(line.replace(/^# /, ''))}</h1>);
    } else if (/^> (.*)/.test(line)) {
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
      elements.push(<blockquote key={i}>{parseInline(line.replace(/^> /, ''))}</blockquote>);
    } else if (/^- (.*)/.test(line)) {
      if (!inUl) {
        if (inOl) {
          elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
          listItems = [];
          inOl = false;
        }
        inUl = true;
      }
      listItems.push(<li key={i}>{parseInline(line.replace(/^- /, ''))}</li>);
    } else if (/^\d+\. (.*)/.test(line)) {
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
          {parseInline(content)}
        </li>
      );
    } else if (line.trim() === '') {
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
    } else {
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
      elements.push(<p key={i}>{parseInline(line)}</p>);
    }
  }
  if (inUl) elements.push(<ul key="ul-end">{listItems}</ul>);
  if (inOl) elements.push(<ol key="ol-end">{listItems}</ol>);
  return elements;
}

type MDRenderProps = {
  markdown: string;
};

const MDRender: React.FC<MDRenderProps> = ({ markdown }) => (
  <div className="mdrender" style={{ fontFamily: 'inherit', fontSize: 16, lineHeight: 1.7 }}>
    {parseMarkdown(markdown)}
  </div>
);

export default MDRender;
