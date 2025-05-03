'use client';
import { useRouter } from 'next/navigation';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { updateProfile } from '@/lib/actions';
import type { Author } from '@/lib/models';
import { allowedImageDomains } from '@/lib/allowedDomains';
import { useToast } from '@/hooks/use-toast';
import ImagePreview from './ImagePreview';

interface ProfileFormProps {
  user: Author;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [form, setForm] = useState({
    name: user.name || '',
    username: user.username || '',
    image: user.image || '',
    bio: user.bio || '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const original = {
    name: user.name || '',
    username: user.username || '',
    image: user.image || '',
    bio: user.bio || '',
  };

  const isUnchanged =
    form.name === original.name &&
    form.username === original.username &&
    form.image === original.image &&
    form.bio === original.bio;

  function isAllowedImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;
      return allowedImageDomains.some((domain) => {
        if (typeof domain === 'string') {
          return hostname === domain || hostname.endsWith('.' + domain);
        } else if (domain instanceof RegExp) {
          return domain.test(hostname);
        }
        return false;
      });
    } catch {
      return false;
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUndo = (field: keyof typeof form) => {
    setForm((prev) => ({ ...prev, [field]: original[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    const res = await updateProfile(form);
    setLoading(false);
    if (res?.error) {
      setStatus(res.error);
      toast({ title: 'Profile update failed', description: res.error, variant: 'destructive' });
    } else if (form.username !== user.username) {
      setStatus('Username updated. Please log in again.');
      toast({
        title: 'Username changed',
        description: 'You will be logged out to refresh your session.',
      });
      signOut({ callbackUrl: '/' });
    } else {
      setStatus('Profile updated!');
      toast({ title: 'Profile updated', description: 'Your profile was updated successfully.' });
      router.push(`/user/${user.username}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto max-w-3xl items-center">
      <div className="mx-10 grid items-center gap-8">
        <div className="relative flex items-center gap-2">
          <div className="flex-1">
            <label className="form-label">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-input" />
          </div>
          {form.name !== original.name && (
            <button
              type="button"
              className="clear-btn clear-btn-center-y"
              onClick={() => handleUndo('name')}
            >
              Undo
            </button>
          )}
        </div>
        <div className="relative flex items-center gap-2">
          <div className="flex-1">
            <label className="form-label">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="form-input"
            />
            {form.username !== original.username && (
              <p className="mt-1 text-xs text-yellow-600">
                Changing your username will require you to log out and log in again.
              </p>
            )}
          </div>
          {form.username !== original.username && (
            <button
              type="button"
              className="clear-btn clear-btn-center-y"
              onClick={() => handleUndo('username')}
            >
              Undo
            </button>
          )}
        </div>
        <div className="relative flex items-center gap-2">
          <div className="flex-1">
            <label className="form-label">Email</label>
            <input
              name="email"
              value={user.email}
              disabled={['google', 'azuread', 'github'].includes(user.provider)}
              className="form-input"
              readOnly
            />
            {['google', 'azuread', 'github'].includes(user.provider) && (
              <p className="mt-1 text-xs text-gray-500">
                {`Email is managed by your authentication provider (${
                  user.provider === 'google'
                    ? 'Google'
                    : user.provider === 'azuread'
                      ? 'Microsoft'
                      : user.provider === 'github'
                        ? 'GitHub'
                        : user.provider
                }) and cannot be changed here.`}
              </p>
            )}
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <div className="flex-1">
            <label className="form-label">Image URL</label>
            <input name="image" value={form.image} onChange={handleChange} className="form-input" />
            {form.image !== original.image && (
              <button
                type="button"
                className="clear-btn clear-btn-center-y"
                onClick={() => handleUndo('image')}
              >
                Undo
              </button>
            )}
            <div className="mt-2 flex h-40 w-full items-center justify-center rounded border bg-muted/10">
              {form.image && isAllowedImageUrl(form.image) ? (
                <ImagePreview src={form.image} alt="Startup preview" />
              ) : (
                <span className="pointer-events-none select-none text-sm text-muted-foreground">
                  {form.image ? 'Image preview: Invalid/disallowed URL' : 'Image preview area'}
                </span>
              )}
            </div>
            <p className="mx-10 mt-2 text-xs text-muted-foreground">
              Allowed domains:{' '}
              <span className="whitespace-normal break-words">
                placehold.co, drive.google.com, docs.google.com, photos.google.com,
                dl.dropboxusercontent.com, onedrive.live.com, icloud.com, i.imgur.com,
                live.staticflickr.com, *.s3.amazonaws.com, www.dropbox.com, imgur.com, imgbb.com,
                images.unsplash.com, unsplash.com, cdn.pixabay.com, pixabay.com,
                media.istockphoto.com, i.pinimg.com, pinimg.com, pbs.twimg.com, twitter.com,
                facebook.com, pinterest.com, scontent.xx.fbcdn.net, media.tumblr.com, tumblr.com,
                media.giphy.com, giphy.com, cdn.discordapp.com, discordapp.com,
                raw.githubusercontent.com, githubusercontent.com, static.wikia.nocookie.net,
                wikimedia.org, upload.wikimedia.org
              </span>
              <br />
              <span className="italic">Remember to make the image public!</span>
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <div className="flex-1">
            <label className="form-label">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} className="form-input" />
          </div>
          {form.bio !== original.bio && (
            <button
              type="button"
              className="clear-btn clear-btn-center-y"
              onClick={() => handleUndo('bio')}
            >
              Undo
            </button>
          )}
        </div>
      </div>
      <div className="mt-12 flex justify-center border-t border-muted pt-8">
        <button
          type="submit"
          className={`btn-normal text-white ring-1 ring-ring hover:bg-green-600 ${loading || isUnchanged ? 'cursor-not-allowed bg-gray-700' : 'bg-green-700'}`}
          disabled={loading || isUnchanged}
        >
          {loading ? (
            <>
              <div className="mr-1 h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
              Updating...
            </>
          ) : (
            <>Update</>
          )}
        </button>
      </div>
      {status && <div className="mt-2 text-center text-sm text-red-600">{status}</div>}
    </form>
  );
}
