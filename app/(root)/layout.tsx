import Navbar from "@/components/Navbar";
import SideBar from "@/components/SideBar";
export default function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="font-work-sans">
      <Navbar />
      {children}
    </main>
  );
}
