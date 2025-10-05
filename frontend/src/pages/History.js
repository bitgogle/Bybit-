import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { transactionAPI } from '@/lib/api';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Depósito',
      withdrawal: 'Saque',
      investment: 'Investimento',
      profit: 'Lucro',
      referral_bonus: 'Bônus de Indicação',
      admin_adjustment: 'Ajuste Admin'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
      completed: 'bg-blue-500/10 text-blue-500'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500';
  };

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

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
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Transações</h1>
          <p className="text-muted-foreground">Todas as suas transações</p>
        </div>

        {/* Filter */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('deposit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'deposit'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Depósitos
            </button>
            <button
              onClick={() => setFilter('withdrawal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'withdrawal'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Saques
            </button>
            <button
              onClick={() => setFilter('investment')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'investment'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Investimentos
            </button>
            <button
              onClick={() => setFilter('profit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'profit'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Lucros
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium">Data</th>
                    <th className="text-left py-4 px-6 font-medium">Tipo</th>
                    <th className="text-left py-4 px-6 font-medium">Valor</th>
                    <th className="text-left py-4 px-6 font-medium">Status</th>
                    <th className="text-left py-4 px-6 font-medium">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="py-4 px-6">
                        {new Date(txn.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">{getTypeLabel(txn.type)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-bold ${
                          ['deposit', 'profit', 'referral_bonus'].includes(txn.type)
                            ? 'text-green-500'
                            : txn.type === 'withdrawal'
                            ? 'text-red-500'
                            : ''
                        }`}>
                          {['deposit', 'profit', 'referral_bonus'].includes(txn.type) ? '+' : '-'}
                          R$ {txn.amount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {txn.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}