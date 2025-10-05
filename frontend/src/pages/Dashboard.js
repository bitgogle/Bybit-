import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { userAPI } from '@/lib/api';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await userAPI.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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

  const balance = dashboard?.balance || {};
  const stats = dashboard?.stats || {};
  const transactions = dashboard?.recent_transactions || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo!</h1>
          <p className="text-muted-foreground">Acompanhe seus investimentos e lucros</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <p className="text-sm text-muted-foreground">Saldo Total</p>
            </div>
            <p className="text-2xl font-bold text-primary">
              R$ {balance.brl_balance?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <p className="text-sm text-muted-foreground">Investido</p>
            </div>
            <p className="text-2xl font-bold">
              R$ {balance.total_invested?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-xl">💵</span>
              </div>
              <p className="text-sm text-muted-foreground">Lucro</p>
            </div>
            <p className="text-2xl font-bold text-green-500">
              R$ {balance.total_returns?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <p className="text-sm text-muted-foreground">Indicações</p>
            </div>
            <p className="text-2xl font-bold text-purple-500">
              R$ {balance.referral_bonus?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/deposit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-6 text-center transition-colors"
          >
            <span className="text-3xl mb-2 block">💳</span>
            <p className="font-bold text-lg">Depositar</p>
          </a>

          <a
            href="/investments"
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg p-6 text-center transition-colors"
          >
            <span className="text-3xl mb-2 block">💰</span>
            <p className="font-bold text-lg">Investir</p>
          </a>

          <a
            href="/withdrawal"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 text-center transition-colors"
          >
            <span className="text-3xl mb-2 block">🏦</span>
            <p className="font-bold text-lg">Sacar</p>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investimentos Ativos</span>
                <span className="font-bold">{stats.active_investments || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Indicações</span>
                <span className="font-bold">{stats.total_referrals || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Transações Recentes</h3>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma transação ainda</p>
              ) : (
                transactions.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{txn.type}</span>
                    <span className="font-medium">
                      R$ {txn.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}