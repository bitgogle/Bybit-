import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceForm, setBalanceForm] = useState({
    adjustment_type: 'add',
    balance_type: 'brl_balance',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers(filter === 'all' ? null : filter);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!confirm('Aprovar este usuário?')) return;
    
    try {
      await adminAPI.approveUser(userId);
      alert('Usuário aprovado!');
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao aprovar usuário');
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Rejeitar este usuário?')) return;
    
    try {
      await adminAPI.rejectUser(userId);
      alert('Usuário rejeitado!');
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao rejeitar usuário');
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!balanceForm.amount) return;

    try {
      await adminAPI.adjustBalance(selectedUser.id, {
        ...balanceForm,
        amount: parseFloat(balanceForm.amount)
      });
      alert('Saldo ajustado com sucesso!');
      setShowBalanceModal(false);
      setBalanceForm({ adjustment_type: 'add', balance_type: 'brl_balance', amount: '', notes: '' });
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao ajustar saldo');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600">Aprovar, editar e gerenciar usuários</p>
        </div>

        {/* Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFilter('suspended')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'suspended' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Suspensos
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Nome</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Email</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Saldo</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Data</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => !u.is_admin).map((user) => (
                    <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-blue-700">R$ {user.brl_balance?.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Disponível: R$ {user.available_for_withdrawal?.toFixed(2)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.status === 'active' ? 'bg-green-500/10 text-green-500' :
                          user.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {user.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                              >
                                Aprovar
                              </button>
                              <button
                                onClick={() => handleReject(user.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
                              >
                                Rejeitar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBalanceModal(true);
                            }}
                            className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium"
                          >
                            Ajustar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Ajustar Saldo</h2>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Usuário</p>
              <p className="font-bold">{selectedUser?.full_name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Ajuste</label>
                <select
                  value={balanceForm.adjustment_type}
                  onChange={(e) => setBalanceForm({ ...balanceForm, adjustment_type: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="add">Adicionar</option>
                  <option value="subtract">Subtrair</option>
                  <option value="set">Definir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Saldo</label>
                <select
                  value={balanceForm.balance_type}
                  onChange={(e) => setBalanceForm({ ...balanceForm, balance_type: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="brl_balance">Saldo Total</option>
                  <option value="available_for_withdrawal">Disponível para Saque</option>
                  <option value="referral_bonus">Bônus de Indicação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                <input
                  type="number"
                  value={balanceForm.amount}
                  onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                  step="0.01"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observações</label>
                <textarea
                  value={balanceForm.notes}
                  onChange={(e) => setBalanceForm({ ...balanceForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                  placeholder="Motivo do ajuste..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBalanceModal(false);
                    setBalanceForm({ adjustment_type: 'add', balance_type: 'brl_balance', amount: '', notes: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBalanceAdjustment}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}