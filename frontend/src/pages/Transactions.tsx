import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { Trash2 } from 'lucide-react';

const GET_DATA = gql`
  query GetData {
    transactions {
      id
      description
      amount
      type
      date
      category {
        id
        name
      }
    }
    categories {
      id
      name
    }
  }
`;

const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($description: String!, $amount: Float!, $type: String!, $date: String!, $categoryId: String) {
    createTransaction(description: $description, amount: $amount, type: $type, date: $date, categoryId: $categoryId) {
      id
    }
  }
`;

const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id) {
      id
    }
  }
`;

export default function Transactions() {
  const { data, loading, error, refetch } = useQuery(GET_DATA);
  const [createTransaction] = useMutation(CREATE_TRANSACTION);
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        variables: {
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: formData.type,
          date: new Date(formData.date).toISOString(), // Or simple string depending on backend
          categoryId: formData.categoryId || null,
        },
      });
      setFormData({ description: '', amount: '', type: 'EXPENSE', date: new Date().toISOString().split('T')[0], categoryId: '' });
      setIsModalOpen(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction({ variables: { id } });
        refetch();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) return <Layout><div className="text-white">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">Error: {error.message}</div></Layout>;

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transações</h1>
        <p className="text-gray-500">Gerencie todas as suas transações financeiras</p>
      </header>
      
      {/* Filters (Mock) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
         <div className="flex-1">
             <input type="text" placeholder="Buscar por descrição" className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary" />
         </div>
         <select className="px-4 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:border-primary">
             <option>Todos</option>
             <option>Receita</option>
             <option>Despesa</option>
         </select>
         <select className="px-4 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:border-primary">
             <option>Todas Categorias</option>
         </select>
         <button  onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            + Nova transação
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-5 font-semibold">Descrição</th>
              <th className="p-5 font-semibold">Data</th>
              <th className="p-5 font-semibold">Categoria</th>
              <th className="p-5 font-semibold">Tipo</th>
              <th className="p-5 font-semibold text-right">Valor</th>
              <th className="p-5 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {data.transactions.map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          t.category?.name === 'Alimentação' ? 'bg-blue-100 text-blue-500' :
                          'bg-gray-100 text-gray-500'
                     }`}>
                        {/* Icon placeholder */}
                         <span className="font-bold text-xs">{t.description[0]}</span>
                     </div>
                    <span className="font-medium text-gray-900">{t.description}</span>
                </td>
                <td className="p-5 text-gray-500">
                  {new Date(parseInt(t.date)).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                     t.category?.name === 'Alimentação' ? 'bg-blue-100 text-blue-700' :
                     t.category?.name === 'Mercado' ? 'bg-orange-100 text-orange-700' :
                     'bg-gray-100 text-gray-700'
                  }`}>
                    {t.category?.name || 'Geral'}
                  </span>
                </td>
                <td className="p-5">
                     <span className={`flex items-center gap-1.5 font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                     </span>
                </td>
                <td className={`p-5 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-gray-900'}`}>
                  {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2).replace('.', ',')}
                </td>
                <td className="p-5 text-right">
                  <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova transação" subtitle="Registre sua despesa ou receita">
        <form onSubmit={handleCreate} className="space-y-5">
           
           {/* Type Toggle */}
           <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  formData.type === 'EXPENSE' 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                 <div className={`w-4 h-4 rounded-full border-2 ${formData.type === 'EXPENSE' ? 'border-red-600' : 'border-gray-400'}`}>
                    {formData.type === 'EXPENSE' && <div className="w-2 h-2 bg-red-600 rounded-full m-0.5" />}
                 </div>
                 Despesa
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  formData.type === 'INCOME' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                  <div className={`w-4 h-4 rounded-full border-2 ${formData.type === 'INCOME' ? 'border-green-600' : 'border-gray-400'}`}>
                    {formData.type === 'INCOME' && <div className="w-2 h-2 bg-green-600 rounded-full m-0.5" />}
                 </div>
                 Receita
              </button>
           </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Descrição</label>
            <input
              type="text"
              placeholder="Ex. Almoço no restaurante"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 bg-gray-50 placeholder:text-gray-400 transition-all font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 bg-gray-50 transition-all font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-9 p-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 bg-gray-50 placeholder:text-gray-400 transition-all font-bold"
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Categoria</label>
              <div className="relative">
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 bg-gray-50 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="">Selecione</option>
                  {data.categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white p-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 mt-2 active:scale-95"
          >
            Salvar
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
