import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
// import SideBar from "@/components/SideBar";
// import { Banner } from "@/components/Banner";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="font-work-sans min-h-screen flex flex-col">
      <div className="flex-1 mx-auto w-full">
        <Navbar />
        {children}
        <Toaster />
      </div>
      <Footer />
    </main>
  );
}
