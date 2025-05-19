import { redirect } from 'next/navigation';

export default function SettingsRootPage() {
  redirect('/docs/terms');
  return null;
}
