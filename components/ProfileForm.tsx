'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { updateProfile } from '@/lib/actions';
import type { Author } from '@/lib/models';
import { useToast } from '@/hooks/use-toast';
import { ImagePreview, getSafeImageUrl, ProfilePicture } from '@/components/ImageUtilities';
import { formatDate } from '@/lib/utils';

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
  const [confirmedImage, setConfirmedImage] = useState<string>(user.image || '/logo.png');

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

  // Handler for preview image load status
  const handlePreviewStatus = React.useCallback(
    (status: string) => {
      if (status === 'loaded') {
        setConfirmedImage(form.image);
      } else if (form.image !== confirmedImage) {
        setConfirmedImage(user.image || '/logo.png');
      }
    },
    [form.image, user.image, confirmedImage]
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start lg:gap-12">
      <aside className="hidden w-full flex-col items-center rounded-3xl bg-card p-8 shadow-lg lg:sticky lg:top-8 lg:flex lg:w-1/3">
        <div className="flex flex-col items-center gap-4">
          <h1 className="animated-heading mb-2 text-3xl font-extrabold leading-tight tracking-tight text-primary drop-shadow-lg">
            {`User Profile`}
          </h1>

          <div className="relative">
            <ProfilePicture
              src={getSafeImageUrl(confirmedImage, user.image || '/logo.png')}
              alt={`${form.username || user.username}'s avatar`}
              width={120}
              height={120}
            />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold">{form.name || user.name}</h3>
            <h4 className="text-gray-500">@{form.username || user.username}</h4>
          </div>
        </div>
        <p className="mb-2 text-xl font-medium text-muted-foreground">
          {form.bio || user.bio || 'No bio provided yet.'}
        </p>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          On Start Down since {formatDate(user.createdAt)}
        </p>
      </aside>
      <section>
        <form onSubmit={handleSubmit} className="relative mx-auto max-w-3xl items-center">
          <div className="mx-10 grid items-center gap-8">
            <div className="relative flex items-center gap-2">
              <div className="flex-1">
                <label className="form-label">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input"
                />
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
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="form-input"
                />
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
                  <ImagePreview
                    src={form.image}
                    alt="Startup preview"
                    onImageLoadStatusChange={handlePreviewStatus}
                  />
                </div>
                <p className="mx-10 mt-2 text-xs text-muted-foreground">
                  Allowed domains:{' '}
                  <span className="whitespace-normal break-words">
                    placehold.co, drive.google.com, docs.google.com, photos.google.com,
                    dl.dropboxusercontent.com, onedrive.live.com, icloud.com, i.imgur.com,
                    live.staticflickr.com, *.s3.amazonaws.com, www.dropbox.com, imgur.com,
                    imgbb.com, images.unsplash.com, unsplash.com, cdn.pixabay.com, pixabay.com,
                    media.istockphoto.com, i.pinimg.com, pinimg.com, pbs.twimg.com, twitter.com,
                    facebook.com, pinterest.com, scontent.xx.fbcdn.net, media.tumblr.com,
                    tumblr.com, media.giphy.com, giphy.com, cdn.discordapp.com, discordapp.com,
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
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="form-input"
                />
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
          <div className="mt-12 flex justify-center gap-4 border-t border-muted pt-8">
            <button
              type="button"
              className="btn-normal bg-gray-600 text-white ring-1 ring-ring hover:bg-gray-500"
              disabled={loading}
              onClick={() => router.push(`/user/${user.username}`)}
            >
              Cancel
            </button>
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
                <>Update Profile</>
              )}
            </button>
          </div>
          {status && <div className="mt-2 text-center text-sm text-red-600">{status}</div>}
        </form>
      </section>
    </div>
  );
}
