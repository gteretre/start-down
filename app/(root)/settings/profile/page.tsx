import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
// import "@/app/(root)/settings/profile/stars.css"; // Import the CSS file

const Page = async () => {
  const session = await auth();
  if (!session) {
    return notFound();
  }

  return (
    <>
      <div className="blueContainer p-10">Hello, this site is not yet implemented (:</div>
      <section className="stars relative">
        <div>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>
    </>
  );
};

export default Page;
