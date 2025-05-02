'use client';
function Page() {
  return (
    <>
      <div className="">
        <div className="textBox">We will have a blog in the future</div>
      </div>
      <div className="m-20 flex justify-center">
        <div className="group peer grid h-40 w-40 place-items-center bg-blue-200 transition-all delay-100 duration-300 hover:bg-blue-300">
          <div className="h-10 w-10 bg-primary transition-colors delay-100 duration-300 group-hover:bg-secondary"></div>
          <div className="h-10 w-10 bg-primary transition-colors delay-100 duration-300 group-hover:bg-blue-400"></div>
        </div>

        <div className="peer grid h-40 w-40 place-items-center bg-blue-300 peer-hover:bg-slate-500">
          <div className="animate-spin">spin</div>
        </div>

        <div className="peer grid h-40 w-40 place-items-center bg-blue-500 peer-hover:bg-slate-400">
          <div className="animate-ping">ping</div>
        </div>
        <div className="peer grid h-40 w-40 place-items-center bg-blue-800 peer-hover:bg-slate-300">
          <div className="animate-pulse">pulse</div>
          <div className="anima animate-bounce">bounce</div>
        </div>
      </div>
      <div className="mx-auto h-60 w-80 bg-black shadow-neon"></div>
    </>
  );
}

export default Page;
