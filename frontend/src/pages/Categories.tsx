import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { Trash2, Tags, ArrowRightLeft } from 'lucide-react';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;

export default function Categories() {
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({ variables: { name: newCategoryName } });
      setNewCategoryName('');
      setIsModalOpen(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory({ variables: { id } });
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
      <header className="mb-8 flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorias</h1>
           <p className="text-gray-500">Organize suas transações por categorias</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
        >
          + Nova categoria
        </button>
      </header>

      {/* Summary Stats (Mock Data for Visual Match) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                  <Tags size={24} />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-gray-900">{data.categories.length}</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total de Categorias</p>
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                  <ArrowRightLeft size={24} />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-gray-900">--</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total de Transações</p>
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <div className="font-bold text-lg">Al</div>
              </div>
              <div>
                  <h3 className="text-lg font-bold text-gray-900">Alimentação</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Categoria mais utilizada</p>
              </div>
           </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.categories.map((category: any) => (
          <div key={category.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
             <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                     category.name === 'Alimentação' ? 'bg-blue-100 text-blue-600' :
                     category.name === 'Transporte' ? 'bg-purple-100 text-purple-600' :
                     category.name === 'Mercado' ? 'bg-orange-100 text-orange-600' :
                     'bg-gray-100 text-gray-600'
                }`}>
                    {/* Icon Mock */}
                    {category.name[0]}
                </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        {/* Edit Icon Mock */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                     </button>
                    <button onClick={() => handleDelete(category.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                 </div>
             </div>
            
            <h3 className="font-bold text-gray-900 text-lg mb-1">{category.name}</h3>
            {/* Mock description and count */}
            <p className="text-sm text-gray-400 mb-4">Descrição da categoria {category.name}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                     category.name === 'Alimentação' ? 'bg-blue-100 text-blue-700' :
                     category.name === 'Transporte' ? 'bg-purple-100 text-purple-700' :
                     category.name === 'Mercado' ? 'bg-orange-100 text-orange-700' :
                     'bg-gray-100 text-gray-700'
                }`}>
                    {category.name}
                </span>
                <span className="text-xs font-medium text-gray-400">0 itens</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 outline-none text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded font-bold transition-colors"
          >
            Save
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
