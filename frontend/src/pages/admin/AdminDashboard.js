import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-primary text-xl">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da plataforma</p>
        </div>

        {/* User Stats */}
        <div>
          <h2 className="text-xl font-bold mb-4">Usuários</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Total de Usuários</p>
              <p className="text-3xl font-bold">{stats?.users?.total || 0}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Pendentes Aprovação</p>
              <p className="text-3xl font-bold text-yellow-500">{stats?.users?.pending || 0}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Usuários Ativos</p>
              <p className="text-3xl font-bold text-green-500">{stats?.users?.active || 0}</p>
            </div>
          </div>
        </div>

        {/* Investment Stats */}
        <div>
          <h2 className="text-xl font-bold mb-4">Investimentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Investimentos Ativos</p>
              <p className="text-3xl font-bold text-accent">{stats?.investments?.active || 0}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Total de Investimentos</p>
              <p className="text-3xl font-bold">{stats?.investments?.total || 0}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Investido</p>
              <p className="text-3xl font-bold text-primary">
                R$ {stats?.investments?.total_invested?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Lucro Gerado</p>
              <p className="text-3xl font-bold text-green-500">
                R$ {stats?.investments?.total_profit?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Stats */}
        <div>
          <h2 className="text-xl font-bold mb-4">Transações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Depósitos Pendentes</p>
              <p className="text-3xl font-bold text-yellow-500">{stats?.transactions?.pending_deposits || 0}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Saques Pendentes</p>
              <p className="text-3xl font-bold text-orange-500">{stats?.transactions?.pending_withdrawals || 0}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/users"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-6 text-center transition-colors"
            >
              <span className="text-3xl mb-2 block">👥</span>
              <p className="font-bold text-lg">Gerenciar Usuários</p>
            </a>

            <a
              href="/admin/transactions"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg p-6 text-center transition-colors"
            >
              <span className="text-3xl mb-2 block">💸</span>
              <p className="font-bold text-lg">Transações</p>
            </a>

            <a
              href="/admin/settings"
              className="bg-secondary hover:bg-secondary/80 text-foreground rounded-lg p-6 text-center transition-colors"
            >
              <span className="text-3xl mb-2 block">⚙️</span>
              <p className="font-bold text-lg">Configurações</p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}