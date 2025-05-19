import fs from 'fs';
import path from 'path';
import MDRender from '@/mike-mardown/src/rendermd';

export default function TermsPage() {
  let doc = '';
  try {
    doc = fs.readFileSync(path.join(process.cwd(), 'public/docs/privacy.md'), 'utf8');
  } catch {
    doc = 'Terms of Service unavailable.';
  }
  return (
    <article>
      <MDRender markdown={doc} />
    </article>
  );
}
