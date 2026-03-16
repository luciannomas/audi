'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Car, LogOut, Menu, X } from 'lucide-react';
import { clearAuth } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/citas', label: 'Citas', icon: CalendarDays },
  { href: '/admin/vehiculos', label: 'Vehículos', icon: Car },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  const NavLinks = () => (
    <>
      <div className="px-4 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#bb0a14] rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">AH</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Audi Hercos</p>
            <p className="text-gray-400 text-xs">Panel de administración</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#bb0a14] text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 min-h-screen fixed left-0 top-0 z-40">
        <NavLinks />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 flex items-center justify-between px-4 h-14 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#bb0a14] rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">AH</span>
          </div>
          <span className="text-white font-semibold text-sm">Audi Hercos</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-300 hover:text-white p-1"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="flex flex-col w-60 bg-gray-900 min-h-screen"
            onClick={e => e.stopPropagation()}
          >
            <NavLinks />
          </aside>
        </div>
      )}
    </>
  );
}
