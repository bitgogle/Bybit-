import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Usuários', path: '/admin/users', icon: '👥' },
    { name: 'Transações', path: '/admin/transactions', icon: '💸' },
    { name: 'Configurações', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Blue Theme */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-blue-900 border-r border-blue-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-blue-800 bg-blue-950">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <h1 className="text-2xl font-bold text-white">BYBIT</h1>
                <p className="text-sm text-blue-300">Painel Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-800 text-blue-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-blue-800 bg-blue-950">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-white">{user?.full_name}</p>
                <p className="text-xs text-blue-300 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg font-semibold text-sm">
                MODO ADMINISTRATIVO
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-600">
          BYBIT Admin Panel © 2025
        </footer>
      </div>
    </div>
  );
}