import { ReactNode } from "react";

const Tooltip = ({
  children,
  text = "Text",
  position = "default"
}: {
  children: ReactNode;
  text?: string;
  position?: "default" | "left" | "right";
}) => {
  const positionClasses: Record<string, string> = {
    default: "-translate-x-1/2 left-1/2 top-full mt-2 origin-top",
    left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
    right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left"
  };

  return (
    <div className="group relative">
      <div className="nav-element">{children}</div>
      <div
        className={`
          absolute w-auto p-2 min-w-max
          rounded-md text-primary
          text-xs font-semibold transition-all duration-100
          ease-linear scale-0 bg-secondary ring-1 ring-ring
          group-hover:scale-100 z-50
          ${positionClasses[position] || positionClasses.default}
        `}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
