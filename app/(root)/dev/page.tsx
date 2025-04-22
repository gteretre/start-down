"use client";
function Page() {
  return (
    <>
      <div className="blueContainer">
        <div className="textBox">Dev Tools</div>
        <div className="search-form m-10">
          <input className="search-input"></input>
        </div>
      </div>
      <div className="flex justify-center m-20">
        <div
          className="peer bg-blue-200 group h-40 w-40 place-items-center hover:bg-blue-300 grid
      transition-all duration-300 delay-100"
        >
          <div
            className=" h-10 w-10 bg-primary
              group-hover:bg-secondary transition-colors duration-300 delay-100"
          ></div>
          <div
            className=" h-10 w-10 bg-primary
              group-hover:bg-blue-400 transition-colors duration-300 delay-100"
          ></div>
        </div>

        <div className="peer bg-blue-300 h-40 w-40 place-items-center grid peer-hover:bg-slate-500">
          <div className="animate-spin">spin</div>
        </div>

        <div className="peer bg-blue-500 h-40 w-40 place-items-center grid peer-hover:bg-slate-400">
          <div className="animate-ping">ping</div>
        </div>
        <div className="peer bg-blue-800 h-40 w-40 place-items-center grid peer-hover:bg-slate-300">
          <div className="animate-pulse">pulse</div>
          <div className="animate-bounce anima">bounce</div>
        </div>
      </div>
      <div className="w-80 h-60 bg-black shadow-neon mx-auto"></div>
    </>
  );
}

export default Page;
