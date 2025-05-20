'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // /game に直接アクセスした場合はトップページにリダイレクト
    if (pathname === '/game') {
      router.replace('/');
    }
  }, [pathname, router]);

  return <>{children}</>;
} 
