import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    country: 'Brasil'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirm_password) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { confirm_password, ...registerData } = formData;
      const response = await register(registerData);
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Admin Access Button */}
      <Link
        to="/admin/login"
        className="fixed bottom-8 left-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-lg transition-all hover:scale-110 flex items-center gap-2 font-medium z-50"
        title="Acesso Administrativo"
      >
        <span className="text-2xl">🛡️</span>
        <span className="hidden sm:inline">Admin</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">BYBIT</h1>
          <p className="text-muted-foreground">Criar Nova Conta</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Cadastrar</h2>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nome de Usuário</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">País</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Brasil">Brasil</option>
                <option value="Portugal">Portugal</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}