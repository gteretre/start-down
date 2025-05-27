'use client';
import { ReactNode } from 'react';
import { ProfilePicture } from '@/components/ImageUtilities';

interface UserCardProps {
  children: ReactNode;
  user: {
    name: string;
    username: string;
    bio?: string;
    image?: string;
    followersCount?: number;
    followingCount?: number;
  };
  position?: 'default' | 'left' | 'right';
}

const UserCard = ({ children, user, position = 'default' }: UserCardProps) => {
  const positionClasses: Record<string, string> = {
    default: 'left-1/2 top-full mt-3 origin-top -translate-x-1/2',
    left: 'right-full top-0 mr-3 origin-right',
    right: 'left-full top-0 ml-3 origin-left',
  };
  return (
    <div className="group relative">
      {children}
      <div
        className={`absolute z-50 w-80 scale-0 rounded-xl border border-border bg-card/95 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 ease-out hover:scale-100 hover:opacity-100 group-hover:scale-100 group-hover:opacity-100 ${positionClasses[position]}`}
        style={{
          transitionDelay: '0ms',
          pointerEvents: 'auto',
        }}
        onMouseEnter={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          {/* Header with avatar and basic info */}
          <div className="mb-3 flex items-start gap-3">
            <ProfilePicture
              src={user.image || '/default-avatar.png'}
              alt={`${user.name}'s avatar`}
              width={64}
              height={64}
              className="rounded-full ring-2 ring-border"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-bold leading-tight text-foreground">
                  {user.name}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-foreground">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">{user.followingCount || 0}</span>
              <span className="text-muted-foreground">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">{user.followersCount || 0}</span>
              <span className="text-muted-foreground">Followers</span>
            </div>
          </div>

          {/* Follow button */}
          <div className="mt-4">
            <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Follow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
