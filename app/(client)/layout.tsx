import { ClientBottomNav } from "@/components/client/ClientBottomNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-24">
      {children}
      <ClientBottomNav />
    </div>
  );
}
