import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
      }
    }
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: { email, password } });
      localStorage.setItem('token', data.login.token);
      localStorage.setItem('user', JSON.stringify(data.login.user));
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 font-sans">
      <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-8">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" fillOpacity="0.2"/>
            <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
        </svg>
        <span>FINANCY</span>
      </div>
      
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Fazer login</h2>
        <p className="text-gray-500 text-center mb-8">Entre na sua conta para continuar</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">{error.message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
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
          </div>
          
          <div className="flex items-center justify-between text-sm">
             <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                 <span className="text-gray-500">Lembrar-me</span>
             </label>
             <a href="#" className="text-primary font-medium hover:underline">Recuperar senha</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-emerald-600 text-white py-3 rounded-lg font-bold transition-colors shadow-sm"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500 mb-4">ou</p>
            <div className="text-sm text-gray-600">
             Ainda não tem uma conta?
            </div>
             <Link to="/register" className="mt-3 block w-full py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>
                Criar conta
             </Link>
        </div>
      </div>
    </div>
  );
}
