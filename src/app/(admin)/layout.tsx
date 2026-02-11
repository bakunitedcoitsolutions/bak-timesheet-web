import AdminLayout from "@/components/layout/AdminLayout";
import { GlobalDataProvider } from "@/context/GlobalDataContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalDataProvider>
      <AdminLayout>{children}</AdminLayout>
    </GlobalDataProvider>
  );
}
