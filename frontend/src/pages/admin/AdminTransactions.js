import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { adminAPI } from '@/lib/api';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [filter, statusFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTransactions(
        filter === 'all' ? null : filter,
        statusFilter === 'all' ? null : statusFilter
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (txnId) => {
    if (!confirm('Aprovar esta transação?')) return;
    
    try {
      await adminAPI.approveTransaction(txnId);
      alert('Transação aprovada!');
      loadTransactions();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao aprovar transação');
    }
  };

  const handleReject = async (txnId) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;
    
    try {
      await adminAPI.rejectTransaction(txnId, reason);
      alert('Transação rejeitada!');
      loadTransactions();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao rejeitar transação');
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Depósito',
      withdrawal: 'Saque',
      investment: 'Investimento',
      profit: 'Lucro',
      referral_bonus: 'Bônus',
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Transações</h1>
          <p className="text-muted-foreground">Aprovar depósitos e saques</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Tipo</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'deposit' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Depósitos
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'withdrawal' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Saques
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'approved' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Aprovadas
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'rejected' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Rejeitadas
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Todas
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium">Data</th>
                    <th className="text-left py-4 px-6 font-medium">Usuário</th>
                    <th className="text-left py-4 px-6 font-medium">Tipo</th>
                    <th className="text-left py-4 px-6 font-medium">Valor</th>
                    <th className="text-left py-4 px-6 font-medium">Método</th>
                    <th className="text-left py-4 px-6 font-medium">Status</th>
                    <th className="text-left py-4 px-6 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="py-4 px-6 text-sm">
                        {new Date(txn.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-4 px-6 text-sm">{txn.user_id}</td>
                      <td className="py-4 px-6">
                        <span className="font-medium">{getTypeLabel(txn.type)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-lg">
                          R$ {txn.amount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {txn.payment_method?.toUpperCase() || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(txn.status)}`}>
                          {txn.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {txn.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(txn.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleReject(txn.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
                            >
                              Rejeitar
                            </button>
                          </div>
                        )}
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