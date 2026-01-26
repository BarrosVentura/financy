import { useQuery, gql } from '@apollo/client';
import Layout from '../components/Layout';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';

const DASHBOARD_QUERY = gql`
  query GetDashboardData {
    me {
      id
      name
    }
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
  }
`;

export default function Dashboard() {
  const { data, loading, error } = useQuery(DASHBOARD_QUERY);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (error) return <div className="text-red-500 p-10">Error: {error.message}</div>;

  const transactions = data.transactions;
  const income = transactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((acc: number, t: any) => acc + t.amount, 0);
  const expense = transactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((acc: number, t: any) => acc + t.amount, 0);
  const balance = income - expense;

  // Calculate Category Stats for Widget
  const categoryStats = transactions.reduce((acc: any, t: any) => {
    const catName = t.category?.name || 'Sem Categoria';
    if (!acc[catName]) {
      acc[catName] = { count: 0, amount: 0 };
    }
    acc[catName].count += 1;
    acc[catName].amount += t.amount;
    return acc;
  }, {});

  const categoryList = Object.entries(categoryStats).map(([name, stats]: [string, any]) => ({
    name,
    ...stats
  })).sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <Layout>
      {/* Header */}
      <header className="mb-8">
        {/* Breadcrumb-ish or title could go here if needed, but reference just has content */}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                 <div className="flex items-center gap-2 mb-2 text-purple-600 font-medium text-sm uppercase tracking-wide">
                    <div className="p-1.5 bg-purple-100 rounded-md">
                        <DollarSign size={16} />
                    </div>
                    <span>Saldo Total</span>
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900">R$ {balance.toFixed(2).replace('.', ',')}</h3>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
             <div>
                 <div className="flex items-center gap-2 mb-2 text-green-600 font-medium text-sm uppercase tracking-wide">
                    <div className="p-1.5 bg-green-100 rounded-md">
                        <ArrowUpCircle size={16} />
                    </div>
                    <span>Receitas do Mês</span>
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900">R$ {income.toFixed(2).replace('.', ',')}</h3>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
             <div>
                 <div className="flex items-center gap-2 mb-2 text-red-600 font-medium text-sm uppercase tracking-wide">
                    <div className="p-1.5 bg-red-100 rounded-md">
                         <ArrowDownCircle size={16} />
                    </div>
                    <span>Despesas do Mês</span>
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900">R$ {expense.toFixed(2).replace('.', ',')}</h3>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions - Left Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Transações Recentes</h3>
                <a href="/transactions" className="text-primary text-sm font-medium hover:underline">Ver todas &gt;</a>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {transactions.slice(0, 5).map((t: any) => (
                    <div key={t.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-default">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 
                                t.category?.name === 'Alimentação' ? 'bg-blue-100 text-blue-600' :
                                t.category?.name === 'Transporte' ? 'bg-purple-100 text-purple-600' :
                                'bg-orange-100 text-orange-600'
                            }`}>
                                {/* Icon placeholder - could be dynamic based on category */}
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{t.description}</h4>
                                <p className="text-sm text-gray-400">{new Date(parseInt(t.date)).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                             <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 
                                t.category?.name === 'Alimentação' ? 'bg-blue-100 text-blue-700' :
                                t.category?.name === 'Transporte' ? 'bg-purple-100 text-purple-700' :
                                'bg-orange-100 text-orange-700'
                            }`}>
                                {t.type === 'INCOME' ? 'Receita' : t.category?.name || 'Geral'}
                             </span>
                             <span className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-900'}`}>
                                {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2).replace('.', ',')}
                             </span>
                             {/* Small indicator circle */}
                             <div className={`w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                    </div>
                    ))}
                    {transactions.length === 0 && (
                        <div className="p-8 text-center text-gray-500">Nenhuma transação encontrada.</div>
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-50">
                     <button className="w-full py-3 text-center text-primary font-medium hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                        + Nova transação
                     </button>
                </div>
            </div>
        </div>

        {/* Categories Widget - Right Column */}
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Categorias</h3>
                <a href="/categories" className="text-primary text-sm font-medium hover:underline">Gerenciar &gt;</a>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-6">
                    {categoryList.map((cat: any) => (
                        <div key={cat.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    cat.name === 'Alimentação' ? 'bg-blue-100 text-blue-700' :
                                    cat.name === 'Transporte' ? 'bg-purple-100 text-purple-700' :
                                    cat.name === 'Mercado' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {cat.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">{cat.count} items</span>
                                <span className="text-sm font-bold text-gray-900">R$ {cat.amount.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    ))}
                    {categoryList.length === 0 && (
                         <div className="text-center text-gray-500 py-4">Sem dados de categorias.</div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
