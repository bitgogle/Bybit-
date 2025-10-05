import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';

export default function Profile() {
  const { user, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    pix_key: user?.pix_key || '',
    usdt_wallet: user?.usdt_wallet || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userAPI.updateProfile(formData);
      setSuccess('Perfil atualizado com sucesso!');
      await checkAuth();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        {/* Account Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Informações da Conta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nome de Usuário</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Código de Indicação</p>
              <p className="font-mono font-bold text-primary">{user?.referral_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                user?.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {user?.status === 'active' ? 'ATIVA' : user?.status?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membro desde</p>
              <p className="font-medium">{new Date(user?.member_since).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KYC Verificado</p>
              <p className="font-medium">{user?.kyc_percentage}%</p>
            </div>
          </div>
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

        {/* Edit Profile */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Informações Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chave PIX</label>
                <input
                  type="text"
                  name="pix_key"
                  value={formData.pix_key}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Seu CPF, email, telefone ou chave aleatória"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Carteira USDT (TRC20)</label>
                <input
                  type="text"
                  name="usdt_wallet"
                  value={formData.usdt_wallet}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>

        {/* Security Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Segurança</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">Atualize sua senha periodicamente</p>
              </div>
              <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors">
                Alterar
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
              </div>
              <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors">
                Ativar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}