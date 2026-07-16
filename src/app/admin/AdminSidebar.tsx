'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: '数据大盘 (Dashboard)' },
    { href: '/admin/workflows', label: '商品与算力管理 (Workflows)' },
    { href: '/admin/finance', label: '财务与分销 (Finance)' },
    { href: '/admin/settings', label: '全局设置 (Settings)' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider">Admin Dashboard</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'block px-4 py-3 rounded-lg shadow-md transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        &copy; 2024 Platform Admin
      </div>
    </aside>
  );
}
