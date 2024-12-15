"use client";
import React from "react";
import { X } from "lucide-react";

import Tooltip from "./Tooltip";

const Banner = ({ visibility = true }: { visibility: boolean }) => {
  const info = "TEST";
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (visibility) {
      setVisible(true);
    }
  }, [visibility]);

  if (!visible) return "";

  return (
    <div className={`banner`}>
      <h1>{info}</h1>
      <Tooltip text="Close">
        <button
          className="flex justify-end btn-pure ring-2"
          onClick={() => setVisible(false)}
        >
          <X />
        </button>
      </Tooltip>
    </div>
  );
};

const setBanner = (text: string) => {};

export default setBanner;
export { setBanner, Banner };
