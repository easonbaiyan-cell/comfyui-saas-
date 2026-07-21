import { UsersClient } from './UsersClient';

export default function AdminUsersPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">用户管理 (Users)</h1>
      <UsersClient />
    </div>
  );
}
