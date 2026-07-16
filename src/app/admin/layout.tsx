import Link from 'next/link';
import { AdminGuard } from './AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-wider">Admin Dashboard</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/admin"
            className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            数据大盘 (Dashboard)
          </Link>
          <Link
            href="/admin/workflows"
            className="block px-4 py-3 rounded-lg bg-indigo-600 text-white shadow-md transition-colors"
          >
            商品与算力管理 (Workflows)
          </Link>
          <Link
            href="/admin/finance"
            className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            财务与分销 (Finance)
          </Link>
          <Link
            href="/admin/settings"
            className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            全局设置 (Settings)
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800 text-sm text-gray-500 text-center">
          &copy; 2024 Platform Admin
        </div>
      </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
