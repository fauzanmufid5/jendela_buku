'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('admin@jendelabuku.test');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login({ email, password });
      
      if (data.user.role !== 'admin' && data.user.role !== 'warehouse') {
        setError('Akun ini tidak memiliki hak akses administrator.');
        setLoading(false);
        return;
      }

      setAuth(data.token, data.user);
      router.push('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Email atau kata sandi tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Jendela Buku
          </h1>
          <p className="text-xs uppercase tracking-widest text-primary-300 font-semibold mt-1">
            Portal Administrasi & Back-Office
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Masuk Administrator</h2>
              <p className="text-xs text-gray-500">Akses modul inventaris buku dan pesanan.</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-50 text-primary-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jendelabuku.test"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Demo Credential Box */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              <p className="font-semibold">Kredensial Pengujian Default:</p>
              <p className="font-mono text-[11px] mt-0.5">Email: admin@jendelabuku.test | Sandi: password123</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-900 hover:bg-primary-800 active:bg-primary-950 text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengotentikasi...
                </>
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-primary-800 transition-colors inline-flex items-center gap-1"
            >
              ← Kembali ke Katalog Utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
