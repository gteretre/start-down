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
    <div className="group relative">
      <div className="nav-element">{children}</div>
      <div
        className={`absolute z-50 w-auto min-w-max scale-0 rounded-md bg-secondary p-2 text-xs font-semibold text-primary ring-1 ring-ring transition-all duration-100 ease-linear group-hover:scale-100 ${positionClasses[position] || positionClasses.default} pointer-events-none cursor-default select-none`}
        style={{ userSelect: 'none', whiteSpace: multiline ? 'pre-line' : undefined }}
      >
        {multiline ? (
          <pre
            className="m-0 whitespace-pre-line border-none bg-transparent p-0 text-inherit"
            style={{ fontFamily: 'inherit' }}
          >
            {text}
          </pre>
        ) : (
          text
        )}
      </div>
    </div>
  );
};

export default Tooltip;
