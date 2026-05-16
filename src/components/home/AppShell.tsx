import { AppSidebar } from "@/components/home/AppSidebar";
import { MobileSectionNav } from "@/components/home/MobileSectionNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full bg-white">
      <AppSidebar />
      <main className="flex-1 bg-white">
        <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-10">
          <MobileSectionNav />
          {children}
        </div>
      </main>
    </div>
  );
}
