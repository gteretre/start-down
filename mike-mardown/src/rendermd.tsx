import React from 'react';

// Only support #, ##, ### as headers, - and 1. as lists, and inline formatting
function simpleMarkdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inUl = false;
  let inOl = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Inline formatting: bold, italic, underline, code
    const htmlLine = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // bold
      .replace(/\*(.+?)\*/g, '<em>$1</em>') // italic
      .replace(/__(.+?)__/g, '<u>$1</u>') // underline
      .replace(/`([^`]+)`/g, '<code>$1</code>'); // inline code
    if (/^### (.*)/.test(line)) {
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
      html += `<h3>${htmlLine.replace(/^### /, '')}</h3>`;
    } else if (/^## (.*)/.test(line)) {
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
      html += `<h2>${htmlLine.replace(/^## /, '')}</h2>`;
    } else if (/^# (.*)/.test(line)) {
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
      html += `<h1>${htmlLine.replace(/^# /, '')}</h1>`;
    } else if (/^> (.*)/.test(line)) {
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
      html += `<blockquote>${htmlLine.replace(/^> /, '')}</blockquote>`;
    } else if (/^- (.*)/.test(line)) {
      if (!inUl) {
        html += '<ul>';
        inUl = true;
      }
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
      html += `<li>${htmlLine.replace(/^- /, '')}</li>`;
    } else if (/^1\. (.*)/.test(line)) {
      if (!inOl) {
        html += '<ol>';
        inOl = true;
      }
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      html += `<li>${htmlLine.replace(/^1\. /, '')}</li>`;
    } else if (line.trim() === '') {
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
    } else {
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
      html += `<p>${htmlLine}</p>`;
    }
  }
  if (inUl) html += '</ul>';
  if (inOl) html += '</ol>';
  return html;
}

type MDRenderProps = {
  markdown: string;
};

const MDRender: React.FC<MDRenderProps> = ({ markdown }) => (
  <div
    className="mdrender"
    dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(markdown) }}
    style={{ fontFamily: 'inherit', fontSize: 16, lineHeight: 1.7 }}
  />
);

export default MDRender;
