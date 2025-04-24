import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
// import SideBar from "@/components/SideBar";
// import { Banner } from "@/components/Banner";
import { Toaster } from '@/components/ui/toaster';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="font-work-sans flex min-h-screen flex-col">
      <div className="mx-auto w-full flex-1">
        <Navbar />
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        <Toaster />
      </div>
      <Footer />
    </main>
  );
}
