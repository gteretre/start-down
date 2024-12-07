import { ReactNode } from "react";

const Tooltip = ({
  children,
  text = "Text"
}: {
  children: ReactNode;
  text?: string;
}) => {
  return (
    <div className="group relative">
      <div className="nav-element">{children}</div>
      <div className="tooltip group-hover:scale-100">{text}</div>
    </div>
  );
};

export default Tooltip;
