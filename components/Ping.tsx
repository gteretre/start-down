import React from "react";

const Ping = () => {
  return (
    <div className="relative">
      <div className="absolute -left-3.5 -top-0.5">
        <span className="flex size-[11px]">
          <span
            className="absolute inline-flex h-full w-full animate-ping
             rounded-full bg-primary opacity-75"
            style={{ animationDuration: "3s" }}
          ></span>
          <span className="relative inline-flex size-[11px] rounded-full bg-primary"></span>
        </span>
      </div>
    </div>
  );
};
export default Ping;
