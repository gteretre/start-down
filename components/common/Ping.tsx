import React from 'react';

const Ping = () => {
  const bgColor = 'rgba(240,240,240,0.7)';
  return (
    <div className="relative">
      <div className="absolute -left-3.5 -top-0.5">
        <span className="flex size-[14px]">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gradient-to-tr from-primary to-blue-400 opacity-60 shadow-lg"
            style={{ animationDuration: '3s', filter: 'blur(1px)' }}
          ></span>
          <span
            className="relative inline-flex size-[14px] rounded-full shadow-md"
            style={{ background: bgColor }}
          ></span>
        </span>
      </div>
    </div>
  );
};

export default Ping;
