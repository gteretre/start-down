import fs from 'fs';
import path from 'path';
import MDRender from '@/mike-mardown/src/rendermd';

export default function TermsPage() {
  let doc = '';
  try {
    doc = fs.readFileSync(path.join(process.cwd(), 'public/docs/tutorial-pitch-editor.md'), 'utf8');
  } catch {
    doc = 'Tutorial Pitch Editor documentation unavailable.';
  }
  return (
    <article>
      <MDRender markdown={doc} />
    </article>
  );
}
