'use client';

import { useAuth } from '@/src/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RequirePasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const mustChange = userData?.user.requirePasswordChange;
    const isVeterinarian = userData?.user.role === 'veterinarian';

    const isPublicRoute =
      pathname === '/' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/login');

    if (mustChange && isVeterinarian && !isPublicRoute && pathname !== '/change-password') {
      router.replace('/change-password');
    }
  }, [userData, pathname, router]);

  return <>{children}</>;
}
