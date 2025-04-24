import { ReactNode } from 'react';

const Tooltip = ({
  children,
  text = 'Text',
  position = 'default',
}: {
  children: ReactNode;
  text?: string;
  position?: 'default' | 'left' | 'right';
}) => {
  const positionClasses: Record<string, string> = {
    default: '-translate-x-1/2 left-1/2 top-full mt-2 origin-top',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left',
  };

  return (
    <div className="group relative">
      <div className="nav-element">{children}</div>
      <div
        className={`absolute z-50 w-auto min-w-max scale-0 rounded-md bg-secondary p-2 text-xs font-semibold text-primary ring-1 ring-ring transition-all duration-100 ease-linear group-hover:scale-100 ${positionClasses[position] || positionClasses.default} `}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
