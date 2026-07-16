'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (process.env.NEXT_PUBLIC_BYPASS_GUARD === 'true') {
        setIsAuthorized(true);
        return;
      }
      const adminUuid = process.env.NEXT_PUBLIC_ADMIN_UUID;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || session.user.id !== adminUuid) {
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);

  // Optionally show a loading state while checking
  if (isAuthorized === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">Verifying access...</div>;
  }

  return <>{children}</>;
}
