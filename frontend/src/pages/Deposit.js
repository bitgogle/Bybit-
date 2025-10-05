import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { transactionAPI, settingsAPI } from '@/lib/api';

export default function Deposit() {
  const [settings, setSettings] = useState(null);
  const [step, setStep] = useState(1); // 1: Amount, 2: Method, 3: Details
  const [amount, setAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const USDT_RATE = 5.45; // 1 USDT = R$ 5.45

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

  const handleConvert = () => {
    if (!amount || parseFloat(amount) < 200) {
      setError('Valor mínimo de depósito é R$ 200,00');
      return;
    }
    const usdtValue = (parseFloat(amount) / USDT_RATE).toFixed(6);
    setUsdtAmount(usdtValue);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // In a real app, you'd upload the file to a server first
      const proofUrl = proofPreview ? 'uploaded_receipt.jpg' : '';
      
      await transactionAPI.createDeposit({
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        payment_proof: proofUrl,
        notes: notes
      });
      
      setSuccess('Solicitação de depósito enviada com sucesso! Aguarde aprovação do administrador.');
      setTimeout(() => {
        setStep(1);
        setAmount('');
        setUsdtAmount('');
        setPaymentMethod('');
        setPaymentProof(null);
        setProofPreview('');
        setNotes('');
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar depósito');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = settings?.payment_methods || {};

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Depositar Fundos</h1>
          <p className="text-muted-foreground">Adicione saldo à sua conta</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                1
              </div>
              <span className={`font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Valor
              </span>
            </div>

            <div className="flex-1 h-1 bg-secondary mx-2">
              <div className={`h-full ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} style={{width: step >= 2 ? '100%' : '0%'}} />
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                2
              </div>
              <span className={`font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Método
              </span>
            </div>

            <div className="flex-1 h-1 bg-secondary mx-2">
              <div className={`h-full ${step >= 3 ? 'bg-primary' : 'bg-secondary'}`} style={{width: step >= 3 ? '100%' : '0%'}} />
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                3
              </div>
              <span className={`font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Comprovante
              </span>
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

        {/* Step 1: Amount Input */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Valor do Depósito</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valor em BRL (Mínimo: R$ 200,00)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setUsdtAmount('');
                      setError('');
                    }}
                    min="200"
                    step="0.01"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                    placeholder="200.00"
                  />
                </div>

                {!usdtAmount ? (
                  <button
                    onClick={handleConvert}
                    type="button"
                    className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-lg transition-colors"
                  >
                    Converter para USDT
                  </button>
                ) : (
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Valor em BRL:</span>
                      <span className="font-bold text-lg">R$ {parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Valor em USDT:</span>
                      <span className="font-bold text-lg text-primary">{usdtAmount} USDT</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      Taxa: 1 USDT = R$ {USDT_RATE.toFixed(2)}
                    </div>
                  </div>
                )}

                {usdtAmount && (
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors"
                  >
                    Prosseguir
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method Selection */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Selecione o Método de Pagamento</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-lg">PIX</p>
                        <p className="text-sm text-muted-foreground">Transferência instantânea</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value="usdt"
                    checked={paymentMethod === 'usdt'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-lg">USDT (TRC20)</p>
                        <p className="text-sm text-muted-foreground">Criptomoeda estável</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bybit_uid"
                    checked={paymentMethod === 'bybit_uid'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-lg">Bybit UID</p>
                        <p className="text-sm text-muted-foreground">Transferência via Bybit</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setStep(1);
                    setPaymentMethod('');
                  }}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => paymentMethod && setStep(3)}
                  disabled={!paymentMethod}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  Prosseguir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Details & Upload */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Detalhes do Pagamento</h2>

              {/* Payment Details */}
              {paymentMethod === 'pix' && (
                <div className="space-y-3 mb-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">CPF</p>
                    <p className="font-mono font-bold text-lg">{paymentMethods.pix_cpf}</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Banco</p>
                    <p className="font-bold">{paymentMethods.pix_bank}</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Beneficiário</p>
                    <p className="font-bold">{paymentMethods.pix_name}</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'usdt' && (
                <div className="space-y-3 mb-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Carteira USDT (TRC20)</p>
                    <p className="font-mono text-sm break-all">{paymentMethods.usdt_wallet_trc20}</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 p-3 rounded-lg text-sm">
                    ⚠️ Use apenas a rede TRC20! Outras redes resultarão em perda de fundos.
                  </div>
                </div>
              )}

              {paymentMethod === 'bybit_uid' && (
                <div className="space-y-3 mb-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Bybit UID</p>
                    <p className="font-bold text-2xl">{paymentMethods.bybit_uid}</p>
                  </div>
                </div>
              )}

              {/* Upload Receipt */}
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <h3 className="font-bold mb-4">Enviar Comprovante de Pagamento</h3>
                
                {!proofPreview ? (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-muted-foreground mb-2">Clique para fazer upload do comprovante</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <img src={proofPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      onClick={() => {
                        setPaymentProof(null);
                        setProofPreview('');
                      }}
                      className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium py-2 rounded-lg transition-colors"
                    >
                      Remover Comprovante
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Observações (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Adicione informações sobre o pagamento..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setStep(2);
                    setPaymentProof(null);
                    setProofPreview('');
                  }}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !proofPreview}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}