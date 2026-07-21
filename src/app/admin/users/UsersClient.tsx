'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getUsersAction, toggleDistributorAction } from './actions';

interface UserProfile {
  id: string;
  created_at: string;
  is_distributor: boolean;
}

export function UsersClient() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setError('Unauthorized');
          setLoading(false);
          return;
        }

        const res = await getUsersAction(session.access_token);
        if (res.success && res.data) {
          setUsers(res.data);
        } else {
          setError(res.error || 'Failed to fetch users');
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);
  const handleToggleDistributor = async (userId: string, currentStatus: boolean) => {
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_distributor: !currentStatus } : u))
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await toggleDistributorAction(session.access_token, userId, !currentStatus);
      if (!res.success) {
        // Revert on failure
        alert('Failed to update distributor status: ' + res.error);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_distributor: currentStatus } : u))
        );
      }
    } catch (_e) {
      alert('Error updating distributor status');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_distributor: currentStatus } : u))
      );
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-4 font-semibold text-gray-700">用户ID (User ID)</th>
            <th className="p-4 font-semibold text-gray-700">头像/昵称 (Avatar/Nickname)</th>
            <th className="p-4 font-semibold text-gray-700">注册时间 (Registration Time)</th>
            <th className="p-4 font-semibold text-gray-700 text-right">经销商授权 (Distributor Auth)</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                暂无用户 (No users found)
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono text-sm text-gray-600">{u.id}</td>
                <td className="p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      U
                    </div>
                    <span>{`用户-${u.id.slice(-4)}`}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(u.created_at).toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleToggleDistributor(u.id, !!u.is_distributor)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      u.is_distributor ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        u.is_distributor ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
