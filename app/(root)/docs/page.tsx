import { redirect } from 'next/navigation';

export default function SettingsRootPage() {
  redirect('/docs/guidelines-startup-form');
  return null;
}
