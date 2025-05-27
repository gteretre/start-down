'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ProfilePicture } from '@/components/ImageUtilities';
import { Settings, User, UnplugIcon, LibraryIcon, Pencil } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface ProfileQuickSettingsProps {
  username: string | null | undefined;
  image?: string | null | undefined;
  position?: 'default' | 'left' | 'right';
}

const ProfileQuickSettings = ({
  username,
  image,
  position = 'default',
}: ProfileQuickSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses: Record<string, string> = {
    default: 'left-1/2 top-full mt-3 origin-top -translate-x-1/2',
    left: 'right-0 top-full mt-3 origin-top',
    right: 'left-0 top-full mt-3 origin-top',
  };

  const handleMobileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="group relative">
      {/* Desktop version - Link with hover */}
      <Link href={`/user/${username}`} className="hidden items-center md:inline-flex">
        <ProfilePicture
          src={image || '/default-avatar.png'}
          alt="Profile picture"
          width={40}
          height={40}
          className="avatar"
        />
      </Link>

      {/* Mobile version - Button with click */}
      <button onClick={handleMobileClick} className="inline-flex items-center md:hidden">
        <ProfilePicture
          src={image || '/default-avatar.png'}
          alt="Profile picture"
          width={40}
          height={40}
          className="avatar"
        />
      </button>

      <div
        className={`absolute z-50 w-80 scale-0 rounded-xl border border-border bg-card/95 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 ease-out md:w-72 md:hover:scale-100 md:hover:opacity-100 md:group-hover:scale-100 md:group-hover:opacity-100 ${
          isOpen ? 'scale-100 opacity-100 md:scale-0 md:opacity-0' : ''
        } ${positionClasses[position]}`}
        style={{
          transitionDelay: '0ms',
          pointerEvents: 'auto',
        }}
        onMouseEnter={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-4">
          <div className="mb-4 flex items-center gap-3">
            <ProfilePicture
              src={image || '/default-avatar.png'}
              alt={`${username}'s avatar`}
              width={48}
              height={48}
              className="rounded-full ring-2 ring-border"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-foreground">Your Profile</h3>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link
              href={`/user/${username}`}
              className="btn-normal text-base md:text-sm"
              onClick={handleLinkClick}
            >
              <User size={16} className="mr-2" />
              <span>View Profile</span>
            </Link>
            <Link
              href="/library"
              className="btn-normal text-base md:text-sm"
              onClick={handleLinkClick}
            >
              <LibraryIcon size={16} className="mr-2" />
              <span>Library</span>
            </Link>
            <Link
              href="/startup/create"
              className="btn-normal text-base md:text-sm"
              onClick={handleLinkClick}
            >
              <Pencil size={16} className="mr-2" />
              <span>Create Startup</span>
            </Link>
            <Link
              href="/settings/profile"
              className="btn-normal text-base md:text-sm"
              onClick={handleLinkClick}
            >
              <Settings size={16} className="mr-2" />
              <span>Profile Settings</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="btn-normal w-full text-base text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 md:text-sm"
            >
              <UnplugIcon size={16} className="mr-2" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileQuickSettings;
