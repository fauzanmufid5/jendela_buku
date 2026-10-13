'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, clearAuth, setAuth } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Skip auth check if on login page
    if (pathname === '/admin/login') return;

    const savedToken = localStorage.getItem('jb_admin_token') || token;
    if (!savedToken) {
      router.push('/admin/login');
      return;
    }

    // Verify token validity
    api.getMe()
      .then((me) => {
        if (me.role !== 'admin' && me.role !== 'warehouse') {
          clearAuth();
          router.push('/admin/login');
        } else {
          setAuth(savedToken, me);
        }
      })
      .catch(() => {
        clearAuth();
        router.push('/admin/login');
      });
  }, [mounted, pathname]);

  // If on login page, render clean layout without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push('/admin/login');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Inventaris Buku', href: '/admin/books', icon: BookOpen, exact: false },
    { name: 'Pesanan Pelanggan', href: '/admin/orders', icon: ShoppingCart, exact: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-primary-950 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base">Jendela Buku</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-primary-900 transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-primary-950 text-white z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-primary-900/50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-primary-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-white tracking-wide">
                  Jendela Buku
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Back-Office
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <p className="px-3 text-[11px] font-bold text-primary-400 uppercase tracking-wider mb-2">
              Menu Utama
            </p>
            {navigation.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/20'
                      : 'text-primary-200 hover:text-white hover:bg-primary-900/80'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-primary-900/60">
              <p className="px-3 text-[11px] font-bold text-primary-400 uppercase tracking-wider mb-2">
                Pintasan Toko
              </p>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-primary-300 hover:text-white hover:bg-primary-900/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4" />
                  <span>Katalog Toko Online</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-primary-400" />
              </Link>
            </div>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-primary-900/60 bg-primary-900/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-primary-200 font-bold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-primary-300 uppercase font-semibold">
                  {user?.role || 'Admin'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
