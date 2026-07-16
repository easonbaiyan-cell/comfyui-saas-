import { AdminGuard } from './AdminGuard';
import { AdminSidebar } from './AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
        <AdminSidebar />
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
