'use client';
import { ReactNode } from 'react';

const Tooltip = ({
  children,
  text = 'Text',
  position = 'default',
  multiline = false,
}: {
  children: ReactNode;
  text?: string;
  position?: 'default' | 'left' | 'right';
  multiline?: boolean;
}) => {
  const positionClasses: Record<string, string> = {
    default: '-translate-x-1/2 left-1/2 top-full mt-2 origin-top',
    left: 'right-full top-full mt-2 -translate-y-0.5 mr-2 origin-right',
    right: 'left-full top-full mt-2 -translate-y-0.5 ml-2 origin-left',
  };

  return (
    <div className="group relative inline-block">
      <span className="cursor-pointer">{children}</span>
      <div
        className={`pointer-events-none absolute z-50 min-w-max scale-95 rounded bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow transition-all duration-100 ease-linear group-hover:scale-100 group-hover:opacity-100 ${positionClasses[position] || positionClasses.default} hidden sm:block`}
        style={{
          userSelect: 'none',
          whiteSpace: multiline ? 'pre-line' : undefined,
        }}
      >
        {multiline ? <span className="whitespace-pre-line">{text}</span> : text}
      </div>
    </div>
  );
};

export default Tooltip;
