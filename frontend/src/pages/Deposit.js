import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { transactionAPI, settingsAPI } from '@/lib/api';

export default function Deposit() {
  const [settings, setSettings] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentProof, setPaymentProof] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await transactionAPI.createDeposit({
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        payment_proof: paymentProof,
        notes: notes
      });
      setSuccess('Solicitação de depósito enviada! Aguarde aprovação do administrador.');
      setAmount('');
      setPaymentProof('');
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar depósito');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = settings?.payment_methods || {};

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Depositar</h1>
          <p className="text-muted-foreground">Adicione fundos à sua conta</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Valor do Depósito</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                Valor (Mín: R$ {settings?.min_deposit || 50} | Máx: R$ {settings?.max_deposit || 10000})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={settings?.min_deposit || 50}
                max={settings?.max_deposit || 10000}
                step="0.01"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                placeholder="50.00"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Método de Pagamento</h2>
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
                  <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
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
                  <p className="text-sm text-muted-foreground">Criptomoeda</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50">
                <input
                  type="radio"
                  name="payment_method"
                  value="bybit_uid"
                  checked={paymentMethod === 'bybit_uid'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">Bybit UID</p>
                  <p className="text-sm text-muted-foreground">Transferência Bybit</p>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Detalhes do Pagamento</h2>
            
            {paymentMethod === 'pix' && (
              <div className="space-y-3">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">CPF</p>
                  <p className="font-bold text-lg">{paymentMethods.pix_cpf || 'Carregando...'}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Banco</p>
                  <p className="font-bold">{paymentMethods.pix_bank || 'Carregando...'}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Nome</p>
                  <p className="font-bold">{paymentMethods.pix_name || 'BYBIT'}</p>
                </div>
              </div>
            )}

            {paymentMethod === 'usdt' && (
              <div className="space-y-3">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Carteira USDT (TRC20)</p>
                  <p className="font-mono text-sm break-all">{paymentMethods.usdt_wallet_trc20 || 'Carregando...'}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 p-3 rounded-lg text-sm">
                  ⚠️ Use apenas a rede TRC20. Outras redes resultarão em perda de fundos!
                </div>
              </div>
            )}

            {paymentMethod === 'bybit_uid' && (
              <div className="space-y-3">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Bybit UID</p>
                  <p className="font-bold text-2xl">{paymentMethods.bybit_uid || 'Carregando...'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Proof */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Comprovante de Pagamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Link ou Código do Comprovante (Opcional)</label>
                <input
                  type="text"
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Cole o link ou código aqui"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observações (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Adicione informações adicionais sobre o pagamento"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Solicitar Depósito'}
          </button>
        </form>
      </div>
    </Layout>
  );
}