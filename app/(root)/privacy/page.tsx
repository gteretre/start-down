import { redirect } from 'next/navigation';

export default function SettingsRootPage() {
  redirect('/docs/privacy');
  return null;
}
