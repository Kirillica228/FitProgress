import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="min-w-0 flex-1 px-4 pb-10 lg:px-8">
        <Topbar />
        <div>{children}</div>
      </div>
    </div>
  );
}
