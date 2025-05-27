import React from 'react';

const Ping = () => {
  // Use Tailwind's dark: and light mode classes for adaptive colors
  return (
    <div className="relative">
      <div className="absolute -left-3.5 -top-0.5">
        <span className="flex size-[14px]">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gradient-to-tr from-blue-300 to-blue-500 opacity-60 shadow-lg dark:from-primary dark:to-blue-400"
            style={{ animationDuration: '3s', filter: 'blur(1px)' }}
          ></span>
          <span className="relative inline-flex size-[14px] rounded-full border border-blue-200 bg-white/80 shadow-md dark:border-none dark:bg-[rgba(240,240,240,0.7)]"></span>
        </span>
      </div>
    </div>
  );
};

export default Ping;
