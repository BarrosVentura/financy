import { useQuery, gql } from '@apollo/client';
import Layout from '../components/Layout';
import { LogOut } from 'lucide-react';

const ME_QUERY = gql`
  query GetMe {
    me {
      id
      name
      email
      createdAt
    }
  }
`;

export default function Profile() {
  const { data, loading, error } = useQuery(ME_QUERY);

  if (loading) return <Layout><div className="text-white">Carregando...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">Erro: {error.message}</div></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-center h-full min-h-[80vh]">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mx-auto mb-6 text-2xl font-bold">
               {data.me.name.split(' ').map((n:string) => n[0]).join('').substring(0,2).toUpperCase()}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{data.me.name}</h2>
            <p className="text-gray-500 mb-8">{data.me.email}</p>

            <form className="text-left space-y-5">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
                    <input type="text" defaultValue={data.me.name} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-primary text-gray-900" />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                    <input type="email" defaultValue={data.me.email} disabled className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado</p>
                 </div>

                 <button type="button" className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors shadow-sm">
                    Salvar alterações
                 </button>
                 
                 <button type="button" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                 }} className="w-full border border-gray-200 hover:border-red-200 hover:text-red-500 text-gray-500 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <LogOut size={18} />
                    Sair da conta
                 </button>
            </form>
          </div>
      </div>
    </Layout>
  );
}
