'use client';
import React from 'react';
import { Share2, Copy } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const absoluteUrl =
    typeof window !== 'undefined' && url.startsWith('/') ? window.location.origin + url : url;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(absoluteUrl);
    setShowMenu(false);
  };

  const openShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=800,height=600,left=100,top=100');
    setShowMenu(false);
  };

  // SVGs from Simple Icons (inline for each platform)
  const FacebookIcon = (
    <svg
      width="16"
      height="16"
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Facebook</title>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
  const BlueskyIcon = (
    <svg
      width="16"
      height="16"
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Bluesky</title>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
    </svg>
  );
  const XIconSvg = (
    <svg
      width="16"
      height="16"
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>X</title>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
  const LinkedInIcon = (
    <svg
      width="16"
      height="16"
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.025-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.369-1.849 3.602 0 4.267 2.369 4.267 5.455v6.285zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.549C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.271V1.723C24 .771 23.2 0 22.225 0z" />
    </svg>
  );
  const WhatsAppIcon = (
    <svg
      width="16"
      height="16"
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>WhatsApp</title>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  const shareOptions = [
    {
      label: 'Copy link',
      icon: <Copy size={16} className="text-blue-500 dark:text-white" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleCopy();
      },
    },
    {
      label: 'Share on X',
      icon: <span className="text-black dark:text-white">{XIconSvg}</span>,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openShare(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title + (text ? '\n' + text : ''))}&url=${encodeURIComponent(absoluteUrl)}`
        );
      },
    },
    {
      label: 'Share on Bluesky',
      icon: <span className="text-[#1183fe] dark:text-white">{BlueskyIcon}</span>,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openShare(
          `https://bsky.app/intent/compose?text=${encodeURIComponent(title + (text ? '\n' + text : '') + ' ' + absoluteUrl)}`
        );
      },
    },
    {
      label: 'Share on LinkedIn',
      icon: <span className="text-[#0a66c2] dark:text-white">{LinkedInIcon}</span>,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use shareArticle endpoint for more options
        openShare(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(absoluteUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`
        );
      },
    },

    {
      label: 'Share on WhatsApp',
      icon: <span className="text-[#25d366] dark:text-white">{WhatsAppIcon}</span>,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openShare(
          `https://wa.me/?text=${encodeURIComponent(title + (text ? '\n' + text : '') + ' ' + absoluteUrl)}`
        );
      },
    },

    {
      label: 'Share on Facebook',
      icon: <span className="text-[#1877f3] dark:text-white">{FacebookIcon}</span>,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Facebook only supports the 'u' param for public URLs
        openShare(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`
        );
      },
    },
  ];

  return (
    <div className="relative inline-block text-foreground">
      <button
        ref={buttonRef}
        className="btn-normal"
        onClick={() => setShowMenu((v) => !v)}
        onMouseEnter={() => setShowMenu(true)}
        type="button"
      >
        <Share2 size={16} />
        <span className="ml-1.5">Share</span>
      </button>
      {showMenu && (
        <div
          onMouseLeave={() => setShowMenu(false)}
          ref={menuRef}
          className="absolute left-0 z-20 mt-2 w-52 border bg-muted py-2 shadow-lg"
        >
          {shareOptions.map((opt) => (
            <button
              key={opt.label}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-blue-400"
              onClick={opt.onClick}
              type="button"
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareButton;
