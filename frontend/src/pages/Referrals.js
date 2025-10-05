import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { referralAPI } from '@/lib/api';

export default function Referrals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await referralAPI.getReferrals();
      setData(response.data);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${data.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Programa de Indicações</h1>
          <p className="text-muted-foreground">Ganhe comissões indicando amigos</p>
        </div>

        {/* Referral Code */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Seu Código de Indicação</h2>
          <div className="flex gap-3">
            <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-mono text-2xl text-primary font-bold">
              {data?.referral_code}
            </div>
            <button
              onClick={copyReferralLink}
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
            >
              {copied ? '✓ Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Estrutura de Comissões</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { level: 1, rate: 10, color: 'bg-yellow-500' },
              { level: 2, rate: 5, color: 'bg-orange-500' },
              { level: 3, rate: 3, color: 'bg-red-500' },
              { level: 4, rate: 2, color: 'bg-purple-500' },
              { level: 5, rate: 1, color: 'bg-blue-500' }
            ].map((item) => (
              <div key={item.level} className="bg-secondary/50 rounded-lg p-4 text-center">
                <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2`}>
                  {item.level}
                </div>
                <p className="text-sm text-muted-foreground">Nível {item.level}</p>
                <p className="text-2xl font-bold text-primary">{item.rate}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Total de Indicações</p>
            <p className="text-3xl font-bold">{data?.total_referrals || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Comissões Ganhas</p>
            <p className="text-3xl font-bold text-primary">
              R$ {data?.total_commission?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Níveis Ativos</p>
            <p className="text-3xl font-bold">{data?.referrals?.length || 0}</p>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Suas Indicações</h2>
          {data?.referrals?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Você ainda não tem indicações</p>
              <p className="text-sm text-muted-foreground mt-2">Compartilhe seu link e comece a ganhar!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Nível</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Comissão</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.referrals?.map((ref) => (
                    <tr key={ref.id} className="border-b border-border">
                      <td className="py-3 px-4">Nível {ref.level}</td>
                      <td className="py-3 px-4">{new Date(ref.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4 font-bold text-primary">
                        R$ {ref.total_commission?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Como Funciona</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>1. Compartilhe seu link de indicação com amigos e familiares</p>
            <p>2. Quando eles se cadastrarem usando seu link, você ganha comissões</p>
            <p>3. As comissões são calculadas sobre os investimentos deles</p>
            <p>4. Você ganha em até 5 níveis de profundidade</p>
            <p>5. As comissões são creditadas automaticamente em sua conta</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}