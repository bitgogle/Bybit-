import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { investmentAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Investments() {
  const [plans, setPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, investmentsRes, dashboardRes] = await Promise.all([
        investmentAPI.getPlans(),
        investmentAPI.getInvestments(),
        userAPI.getDashboard()
      ]);
      setPlans(plansRes.data);
      setInvestments(investmentsRes.data);
      setUser(dashboardRes.data.balance);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInvest = async () => {
    if (!amount || !selectedPlan) return;

    setError('');
    setLoading(true);

    try {
      await investmentAPI.createInvestment({
        plan_id: selectedPlan.id,
        amount: parseFloat(amount)
      });
      setShowModal(false);
      setAmount('');
      setSelectedPlan(null);
      loadData();
      alert('Investimento criado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar investimento');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
    setError('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">Escolha um plano e comece a lucrar</p>
        </div>

        {/* Investment Plans */}
        <div>
          <h2 className="text-xl font-bold mb-4">Planos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-card border-2 rounded-lg p-6 relative ${
                  plan.popular ? 'border-primary' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ POPULAR
                    </span>
                  </div>
                )}

                <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Bloqueio: {plan.lock_hours}h
                </p>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Mínimo:</span>{' '}
                    <span className="font-bold">R$ {plan.min_amount}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Máximo:</span>{' '}
                    <span className="font-bold">R$ {plan.max_amount}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Lucro:</span>{' '}
                    <span className="font-bold text-green-500">R$40/R$200 (6h)</span>
                  </div>
                </div>

                <button
                  onClick={() => openModal(plan)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-medium transition-colors"
                >
                  Investir Agora
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Investments */}
        <div>
          <h2 className="text-xl font-bold mb-4">Meus Investimentos</h2>
          {investments.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Você ainda não tem investimentos ativos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {investments.map((inv) => (
                <div key={inv.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{inv.plan_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(inv.start_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      inv.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {inv.status === 'active' ? 'ATIVO' : 'CONCLUÍDO'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Investido</p>
                      <p className="font-bold">R$ {inv.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro Total</p>
                      <p className="font-bold text-green-500">R$ {inv.total_profit?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ciclos</p>
                      <p className="font-bold">{inv.completed_cycles}/{inv.total_cycles}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progresso</p>
                      <p className="font-bold">{((inv.completed_cycles / inv.total_cycles) * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {inv.status === 'active' && (
                    <div className="mt-4">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(inv.completed_cycles / inv.total_cycles) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Investment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Novo Investimento</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Plano Selecionado</p>
                <p className="font-bold text-lg">{selectedPlan?.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Saldo Disponível</p>
                <p className="font-bold text-primary text-xl">
                  R$ {user?.available_for_withdrawal?.toFixed(2) || '0.00'}
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Valor do Investimento (R$ {selectedPlan?.min_amount} - R$ {selectedPlan?.max_amount})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={selectedPlan?.min_amount}
                  max={selectedPlan?.max_amount}
                  step="0.01"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="200.00"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setAmount('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInvest}
                  disabled={loading || !amount}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Investindo...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}