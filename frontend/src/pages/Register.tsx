import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
      }
    }
  }
`;

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [signup, { loading, error }] = useMutation(SIGNUP_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await signup({ variables: { name, email, password } });
      localStorage.setItem('token', data.signup.token);
      localStorage.setItem('user', JSON.stringify(data.signup.user));
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 font-sans">
      <div className="mb-8">
        <img src="/assets/Logo.svg" alt="Financy Logo" className="h-12" />
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Criar conta</h2>
        <p className="text-gray-500 text-center mb-8">Comece a controlar suas finanças ainda hoje</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">{error.message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Nome completo</label>
            <input
              type="text"
              value={name}
              placeholder="Seu nome completo"
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              placeholder="mail@exemplo.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              placeholder="Digite sua senha"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
              required
            />
            <p className="text-xs text-gray-400 mt-1">A senha deve ter no mínimo 8 caracteres</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-emerald-600 text-white py-3 rounded-lg font-bold transition-colors shadow-sm"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500 mb-4">ou</p>
            <div className="text-sm text-gray-600">
             Já tem uma conta?
            </div>
            <Link to="/login" className="mt-3 block w-full py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 17L15 12L10 7V17Z" fill="currentColor"/><path d="M4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12ZM2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor"/></svg>
                Fazer login
            </Link>
        </div>
      </div>
    </div>
  );
}
