import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { transactionAPI, settingsAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Withdrawal() {
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // 1: Method, 2: Details, 3: Fee Payment, 4: Fee Receipt
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    pix_key: '',
    usdt_wallet: '',
    bybit_uid: ''
  });
  const [amount, setAmount] = useState('');
  const [feePaymentMethod, setFeePaymentMethod] = useState('');
  const [feeReceipt, setFeeReceipt] = useState(null);
  const [feeReceiptPreview, setFeeReceiptPreview] = useState('');
  const [loading, setLoading] = useState(false);

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
      toast.error('Erro ao carregar dados');
    }
  };

  const handleFeeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeeReceipt(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeeReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const withdrawalData = {
        amount: parseFloat(amount),
        payment_method: withdrawalMethod,
        fee_payment_proof: feeReceiptPreview ? 'fee_receipt.jpg' : '',
        notes: `Withdrawal to: ${withdrawalDetails[withdrawalMethod === 'pix' ? 'pix_key' : withdrawalMethod === 'usdt' ? 'usdt_wallet' : 'bybit_uid']}`
      };

      await transactionAPI.createWithdrawal(withdrawalData);
      
      toast.success('Solicitação de saque enviada com sucesso!');
      
      setTimeout(() => {
        setStep(1);
        setAmount('');
        setWithdrawalMethod('');
        setWithdrawalDetails({ pix_key: '', usdt_wallet: '', bybit_uid: '' });
        setFeePaymentMethod('');
        setFeeReceipt(null);
        setFeeReceiptPreview('');
        loadData();
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar saque');
    } finally {
      setLoading(false);
    }
  };

  const withdrawalFee = settings?.withdrawal_fee || 500;
  const feeMethod = settings?.withdrawal_fee_method || 'require_deposit';
  const paymentMethods = settings?.payment_methods || {};

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sacar Fundos</h1>
          <p className="text-muted-foreground">Retire seus fundos da conta</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>1</div>
              <span className={`text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Método</span>
            </div>
            <div className="flex-1 h-1 bg-secondary mx-2">
              <div className={`h-full ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} style={{width: step >= 2 ? '100%' : '0%'}} />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>2</div>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Detalhes</span>
            </div>
            <div className="flex-1 h-1 bg-secondary mx-2">
              <div className={`h-full ${step >= 3 ? 'bg-primary' : 'bg-secondary'}`} style={{width: step >= 3 ? '100%' : '0%'}} />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>3</div>
              <span className={`text-sm font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Taxa</span>
            </div>
            <div className="flex-1 h-1 bg-secondary mx-2">
              <div className={`h-full ${step >= 4 ? 'bg-primary' : 'bg-secondary'}`} style={{width: step >= 4 ? '100%' : '0%'}} />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>4</div>
              <span className={`text-sm font-medium ${step >= 4 ? 'text-foreground' : 'text-muted-foreground'}`}>Comprovante</span>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Disponível</p>
            <p className="text-xl font-bold text-primary">R$ {user?.available_for_withdrawal?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Investido</p>
            <p className="text-xl font-bold">R$ {user?.total_invested?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Taxa de Saque</p>
            <p className="text-xl font-bold text-yellow-500">R$ {withdrawalFee.toFixed(2)}</p>
          </div>
        </div>

        {/* Step 1: Choose Withdrawal Method */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold">Selecione o Método de Saque</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                <input
                  type="radio"
                  name="withdrawal_method"
                  value="pix"
                  checked={withdrawalMethod === 'pix'}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
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
                      <p className="text-sm text-muted-foreground">Recebimento instantâneo</p>
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                <input
                  type="radio"
                  name="withdrawal_method"
                  value="usdt"
                  checked={withdrawalMethod === 'usdt'}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
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
                      <p className="text-sm text-muted-foreground">5-30 minutos</p>
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                <input
                  type="radio"
                  name="withdrawal_method"
                  value="bybit_uid"
                  checked={withdrawalMethod === 'bybit_uid'}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
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

            <button
              onClick={() => withdrawalMethod && setStep(2)}
              disabled={!withdrawalMethod}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Prosseguir
            </button>
          </div>
        )}

        {/* Step 2: Enter Withdrawal Details & Amount */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold">Detalhes do Saque</h2>
            
            <div className="space-y-4">
              {withdrawalMethod === 'pix' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Chave PIX</label>
                  <input
                    type="text"
                    value={withdrawalDetails.pix_key}
                    onChange={(e) => setWithdrawalDetails({...withdrawalDetails, pix_key: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="CPF, Email, Telefone ou Chave Aleatória"
                  />
                </div>
              )}

              {withdrawalMethod === 'usdt' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Carteira USDT (TRC20)</label>
                  <input
                    type="text"
                    value={withdrawalDetails.usdt_wallet}
                    onChange={(e) => setWithdrawalDetails({...withdrawalDetails, usdt_wallet: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-sm text-yellow-500 mt-2">⚠️ Certifique-se de usar apenas endereço TRC20</p>
                </div>
              )}

              {withdrawalMethod === 'bybit_uid' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Bybit UID</label>
                  <input
                    type="text"
                    value={withdrawalDetails.bybit_uid}
                    onChange={(e) => setWithdrawalDetails({...withdrawalDetails, bybit_uid: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Seu Bybit UID"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Valor do Saque (Mín: R$ {settings?.min_withdrawal || 10})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={settings?.min_withdrawal || 10}
                  max={user?.available_for_withdrawal || 0}
                  step="0.01"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                  placeholder="10.00"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Máximo disponível: R$ {user?.available_for_withdrawal?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  const detail = withdrawalDetails[withdrawalMethod === 'pix' ? 'pix_key' : withdrawalMethod === 'usdt' ? 'usdt_wallet' : 'bybit_uid'];
                  if (detail && amount && parseFloat(amount) >= (settings?.min_withdrawal || 10)) {
                    setStep(3);
                  } else {
                    toast.error('Preencha todos os campos');
                  }
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors"
              >
                Prosseguir
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Fee Payment Method Selection */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Pagamento da Taxa de Saque</h2>
              <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 p-4 rounded-lg mb-4">
                <p className="font-semibold">Taxa: R$ {withdrawalFee.toFixed(2)}</p>
                <p className="text-sm mt-1">
                  {feeMethod === 'require_deposit' 
                    ? 'Você deve pagar esta taxa separadamente antes do saque ser processado.'
                    : 'A taxa será deduzida automaticamente do seu saldo.'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">Escolha o Método de Pagamento da Taxa</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="radio"
                    name="fee_payment_method"
                    value="pix"
                    checked={feePaymentMethod === 'pix'}
                    onChange={(e) => setFeePaymentMethod(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className="font-bold">PIX</p>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="radio"
                    name="fee_payment_method"
                    value="usdt"
                    checked={feePaymentMethod === 'usdt'}
                    onChange={(e) => setFeePaymentMethod(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className="font-bold">USDT (TRC20)</p>
                    <p className="text-sm text-muted-foreground">Criptomoeda</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="radio"
                    name="fee_payment_method"
                    value="bybit_uid"
                    checked={feePaymentMethod === 'bybit_uid'}
                    onChange={(e) => setFeePaymentMethod(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className="font-bold">Bybit UID</p>
                    <p className="text-sm text-muted-foreground">Transferência via Bybit</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => feePaymentMethod && setStep(4)}
                disabled={!feePaymentMethod}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                Prosseguir para Pagamento
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Fee Payment Details & Upload Receipt */}
        {step === 4 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold">Comprovante de Pagamento da Taxa</h2>

            {/* Payment Details */}
            {feePaymentMethod === 'pix' && (
              <div className="space-y-3">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">CPF</p>
                  <p className="font-mono font-bold text-lg">{paymentMethods.pix_cpf}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Banco</p>
                  <p className="font-bold">{paymentMethods.pix_bank}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valor da Taxa</p>
                  <p className="font-bold text-xl text-primary">R$ {withdrawalFee.toFixed(2)}</p>
                </div>
              </div>
            )}

            {feePaymentMethod === 'usdt' && (
              <div className="space-y-3">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Carteira USDT (TRC20)</p>
                  <p className="font-mono text-sm break-all">{paymentMethods.usdt_wallet_trc20}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valor da Taxa</p>
                  <p className="font-bold text-xl text-primary">{(withdrawalFee / 5.45).toFixed(6)} USDT</p>
                </div>
              </div>
            )}

            {feePaymentMethod === 'bybit_uid' && (
              <div className="space-y-3">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Bybit UID</p>
                  <p className="font-bold text-2xl">{paymentMethods.bybit_uid}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valor da Taxa</p>
                  <p className="font-bold text-xl text-primary">R$ {withdrawalFee.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Upload Receipt */}
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <h3 className="font-bold mb-4">Enviar Comprovante do Pagamento da Taxa</h3>
              
              {!feeReceiptPreview ? (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-muted-foreground mb-2">Clique para fazer upload do comprovante</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeeFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <img src={feeReceiptPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => {
                      setFeeReceipt(null);
                      setFeeReceiptPreview('');
                    }}
                    className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium py-2 rounded-lg transition-colors"
                  >
                    Remover Comprovante
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !feeReceiptPreview}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Solicitar Saque'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}