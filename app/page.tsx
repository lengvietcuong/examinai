import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import ToggleSidebarButton from "@/components/sidebar/toggle-sidebar-button";
import Greeting from "@/components/chat/greeting/greeting";
import Chat from "@/components/chat/chat";

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="relative flex min-h-svh flex-1 flex-col">
        <ToggleSidebarButton className="sticky top-1/2 -mt-10 hidden -translate-y-1/2 lg:block" />
        <Header />
        <main className="mx-auto flex w-full flex-1 flex-col px-4 pt-4 max-w-[800px]">
          <Chat greeting={<Greeting />} />
        </main>
      </div>
    </div>
  );
}
