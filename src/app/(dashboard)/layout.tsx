import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { LiveQueueManager } from "@/components/ui/live-queue-manager";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
          <LiveQueueManager />
        </main>
      </div>
    </div>
  );
}