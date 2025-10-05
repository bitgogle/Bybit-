import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { transactionAPI, settingsAPI, userAPI } from '@/lib/api';

export default function Withdrawal() {
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [feePaymentProof, setFeePaymentProof] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, dashboardRes] = await Promise.all([
        settingsAPI.getSettings(),
        userAPI.getDashboard()
      ]);
      setSettings(settingsRes.data);
      setUser(dashboardRes.data.balance);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await transactionAPI.createWithdrawal({
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        fee_payment_proof: feePaymentProof
      });
      setSuccess(`Solicitação de saque enviada! Taxa: R$ ${response.data.withdrawal_fee}`);
      setAmount('');
      setFeePaymentProof('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar saque');
    } finally {
      setLoading(false);
    }
  };

  const withdrawalFee = settings?.withdrawal_fee || 500;
  const feeMethod = settings?.withdrawal_fee_method || 'require_deposit';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sacar</h1>
          <p className="text-muted-foreground">Retire seus fundos</p>
        </div>

        {/* Fee Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 p-4 rounded-lg">
          <h3 className="font-bold mb-2">⚠️ Taxa de Saque</h3>
          <p className="text-sm">
            Taxa de saque: <span className="font-bold">R$ {withdrawalFee.toFixed(2)}</span>
            {feeMethod === 'require_deposit' ? (
              <> - Deve ser paga como um depósito separado antes do saque.</>
            ) : (
              <> - Será deduzida do seu saldo automaticamente.</>
            )}
          </p>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Balance Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Disponível</p>
            <p className="text-2xl font-bold text-primary">
              R$ {user?.available_for_withdrawal?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Investido</p>
            <p className="text-2xl font-bold">
              R$ {user?.total_invested?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Total</p>
            <p className="text-2xl font-bold">
              R$ {user?.brl_balance?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Valor do Saque</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                Valor (Mín: R$ {settings?.min_withdrawal || 10})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={settings?.min_withdrawal || 10}
                max={user?.available_for_withdrawal || 0}
                step="0.01"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                placeholder="10.00"
                required
              />
              <p className="text-sm text-muted-foreground mt-2">
                Máximo disponível: R$ {user?.available_for_withdrawal?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Método de Recebimento</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50">
                <input
                  type="radio"
                  name="payment_method"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-muted-foreground">Recebimento instantâneo</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50">
                <input
                  type="radio"
                  name="payment_method"
                  value="usdt"
                  checked={paymentMethod === 'usdt'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">USDT (TRC20)</p>
                  <p className="text-sm text-muted-foreground">5-30 minutos</p>
                </div>
              </label>
            </div>
          </div>

          {/* Fee Payment Proof (if required) */}
          {feeMethod === 'require_deposit' && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-bold text-lg mb-4">Comprovante da Taxa</h2>
              <div className="bg-secondary/50 p-4 rounded-lg mb-4">
                <p className="text-sm">
                  Você deve depositar R$ {withdrawalFee.toFixed(2)} como taxa de saque antes de solicitar.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Link ou Código do Comprovante de Pagamento da Taxa
                </label>
                <input
                  type="text"
                  value={feePaymentProof}
                  onChange={(e) => setFeePaymentProof(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Cole o comprovante de pagamento da taxa"
                />
              </div>
            </div>
          )}

          {/* Important Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-bold mb-3">⚠️ Informações Importantes</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Saques são processados em até 24 horas</li>
              <li>• PIX: recebimento instantâneo após aprovação</li>
              <li>• USDT: 5-30 minutos após aprovação</li>
              <li>• Não é possível sacar com investimentos ativos</li>
              <li>• Configure seus dados de pagamento no perfil antes de sacar</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Solicitar Saque'}
          </button>
        </form>
      </div>
    </Layout>
  );
}