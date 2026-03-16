'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from '@/lib/storage';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = getAuth();
    if (!user) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white/50 bg-transparent animate-pulse" />
              ))}
            </div>
          </div>
          <p className="text-gray-400 text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* Content area pushed right of sidebar on desktop, below header on mobile */}
      <div className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
