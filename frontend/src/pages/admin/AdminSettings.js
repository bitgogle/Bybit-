import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { settingsAPI, adminAPI } from '@/lib/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await adminAPI.updateSettings(settings);
      setSuccess('Configurações atualizadas com sucesso!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao atualizar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const updatePaymentMethod = (field, value) => {
    setSettings({
      ...settings,
      payment_methods: {
        ...settings.payment_methods,
        [field]: value
      }
    });
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
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Plataforma</h1>
          <p className="text-muted-foreground">Gerencie métodos de pagamento e taxas</p>
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
          {/* Withdrawal Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Configurações de Saque</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Taxa de Saque (R$)</label>
                <input
                  type="number"
                  value={settings?.withdrawal_fee || 0}
                  onChange={(e) => updateField('withdrawal_fee', parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Método de Cobrança da Taxa</label>
                <select
                  value={settings?.withdrawal_fee_method || 'require_deposit'}
                  onChange={(e) => updateField('withdrawal_fee_method', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="require_deposit">Exigir depósito separado</option>
                  <option value="deduct_from_balance">Deduzir do saldo</option>
                </select>
                <p className="text-sm text-muted-foreground mt-2">
                  {settings?.withdrawal_fee_method === 'require_deposit'
                    ? 'Usuário deve depositar a taxa antes de sacar'
                    : 'Taxa será deduzida automaticamente do saldo'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Saque Mínimo (R$)</label>
                <input
                  type="number"
                  value={settings?.min_withdrawal || 0}
                  onChange={(e) => updateField('min_withdrawal', parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Deposit Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Configurações de Depósito</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Depósito Mínimo (R$)</label>
                <input
                  type="number"
                  value={settings?.min_deposit || 0}
                  onChange={(e) => updateField('min_deposit', parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Depósito Máximo (R$)</label>
                <input
                  type="number"
                  value={settings?.max_deposit || 0}
                  onChange={(e) => updateField('max_deposit', parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* PIX Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Configurações PIX</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">CPF</label>
                <input
                  type="text"
                  value={settings?.payment_methods?.pix_cpf || ''}
                  onChange={(e) => updatePaymentMethod('pix_cpf', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Banco</label>
                <input
                  type="text"
                  value={settings?.payment_methods?.pix_bank || ''}
                  onChange={(e) => updatePaymentMethod('pix_bank', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nome do banco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nome do Beneficiário</label>
                <input
                  type="text"
                  value={settings?.payment_methods?.pix_name || ''}
                  onChange={(e) => updatePaymentMethod('pix_name', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="BYBIT"
                />
              </div>
            </div>
          </div>

          {/* USDT Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Configurações USDT</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Carteira USDT (TRC20)</label>
                <input
                  type="text"
                  value={settings?.payment_methods?.usdt_wallet_trc20 || ''}
                  onChange={(e) => updatePaymentMethod('usdt_wallet_trc20', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Carteira USDT (BEP20) - Opcional</label>
                <input
                  type="text"
                  value={settings?.payment_methods?.usdt_wallet_bep20 || ''}
                  onChange={(e) => updatePaymentMethod('usdt_wallet_bep20', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Bybit Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Configurações Bybit</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Bybit UID</label>
              <input
                type="text"
                value={settings?.payment_methods?.bybit_uid || ''}
                onChange={(e) => updatePaymentMethod('bybit_uid', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="467135313"
              />
            </div>
          </div>

          {/* Support Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Suporte</h2>
            <div>
              <label className="block text-sm font-medium mb-2">WhatsApp de Suporte</label>
              <input
                type="text"
                value={settings?.payment_methods?.whatsapp_support || ''}
                onChange={(e) => updatePaymentMethod('whatsapp_support', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+55 11 99999-9999"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
