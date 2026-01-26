import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { Trash2, Briefcase, Car, Heart, PiggyBank, ShoppingCart, Ticket, Home, Gift, Book, Coffee, Wallet, FileText, Smartphone, Pencil } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const ICONS = [
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Car', icon: Car },
  { name: 'Heart', icon: Heart },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Ticket', icon: Ticket },
  { name: 'Home', icon: Home },
  { name: 'Gift', icon: Gift },
  { name: 'Book', icon: Book },
  { name: 'Coffee', icon: Coffee },
  { name: 'Wallet', icon: Wallet },
  { name: 'FileText', icon: FileText },
  { name: 'Smartphone', icon: Smartphone }
];

const COLORS = [
  { name: 'Green', value: 'bg-emerald-500', text: 'text-emerald-600', bgLi: 'bg-emerald-100' },
  { name: 'Blue', value: 'bg-blue-500', text: 'text-blue-600', bgLi: 'bg-blue-100' },
  { name: 'Purple', value: 'bg-purple-500', text: 'text-purple-600', bgLi: 'bg-purple-100' },
  { name: 'Pink', value: 'bg-pink-500', text: 'text-pink-600', bgLi: 'bg-pink-100' },
  { name: 'Red', value: 'bg-red-500', text: 'text-red-600', bgLi: 'bg-red-100' },
  { name: 'Orange', value: 'bg-orange-500', text: 'text-orange-600', bgLi: 'bg-orange-100' },
  { name: 'Yellow', value: 'bg-yellow-500', text: 'text-yellow-600', bgLi: 'bg-yellow-100' },
];

const GET_CATEGORIES_DATA = gql`
  query GetCategoriesData {
    categories {
      id
      name
      description
      icon
      color
    }
    transactions {
      id
      category {
        id
        name
      }
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $description: String, $icon: String, $color: String) {
    createCategory(name: $name, description: $description, icon: $icon, color: $color) {
      id
      name
      description
      icon
      color
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $name: String, $description: String, $icon: String, $color: String) {
    updateCategory(id: $id, name: $name, description: $description, icon: $icon, color: $color) {
      id
      name
      description
      icon
      color
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
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES_DATA);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: 'Briefcase', color: 'bg-emerald-500' });

  const totalCategories = data?.categories?.length || 0;
  const totalTransactions = data?.transactions?.length || 0;
  
  const getMostUsedCategory = () => {
    if (!data?.transactions || !data?.categories) return null;
    const counts: Record<string, number> = {};
    data.transactions.forEach((t: any) => {
      if (t.category?.name) {
        counts[t.category.name] = (counts[t.category.name] || 0) + 1;
      }
    });
    
    let maxName = '';
    let maxCount = 0;
    
    Object.entries(counts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxName = name;
      }
    });
    
    const category = data.categories.find((c: any) => c.name === maxName);
    return category ? { ...category, count: maxCount } : null;
  };

  const mostUsed = getMostUsedCategory();

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory({ variables: { id: editingId, ...form } });
      } else {
        await createCategory({ variables: { ...form } });
      }
      setForm({ name: '', description: '', icon: 'Briefcase', color: 'bg-emerald-500' });
      setEditingId(null);
      setIsModalOpen(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'Briefcase',
      color: category.color || 'bg-emerald-500'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategory({ variables: { id } });
        refetch();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getIconComponent = (iconName: string) => {
    // @ts-ignore
    const Icon = LucideIcons[iconName] || Briefcase;
    return Icon;
  }

  const getColorClasses = (colorClass: string) => {
    const colorObj = COLORS.find(c => c.value === colorClass);
    return colorObj ? { bg: colorObj.bgLi, text: colorObj.text } : { bg: 'bg-gray-100', text: 'text-gray-600' };
  }

  const openNewModal = () => {
    setEditingId(null);
    setForm({ name: '', description: '', icon: 'Briefcase', color: 'bg-emerald-500' });
    setIsModalOpen(true);
  };

  if (loading) return <Layout><div className="text-white">Carregando...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">Erro: {error.message}</div></Layout>;

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorias</h1>
           <p className="text-gray-500">Organize suas transações por categorias</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
        >
          + Nova categoria
        </button>
      </header>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-gray-50 text-gray-600 rounded-lg">
              <LucideIcons.Tag size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-gray-900">{totalCategories}</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de categorias</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <LucideIcons.ArrowUpDown size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-gray-900">{totalTransactions}</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de transações</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
           {mostUsed ? (
             <>
                <div className={`p-3 rounded-lg ${getColorClasses(mostUsed.color).bg} ${getColorClasses(mostUsed.color).text}`}>
                   {(() => {
                      const Icon = getIconComponent(mostUsed.icon);
                      return <Icon size={24} />;
                   })()}
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{mostUsed.name}</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria mais utilizada</p>
                </div>
             </>
           ) : (
              <div className="text-gray-400 text-sm">Nenhuma categoria utilizada ainda</div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.categories.map((category: any) => {
          const Icon = getIconComponent(category.icon);
          const colors = getColorClasses(category.color);
          const itemCount = data.transactions.filter((t: any) => t.category?.id === category.id).length;
          
          return (
            <div key={category.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${colors.bg} ${colors.text}`}>
                      <Icon size={24} />
                  </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleDelete(category.id)} className="w-8 h-8 flex items-center justify-center text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                      </button>
                      <button onClick={() => handleEdit(category)} className="w-8 h-8 flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <Pencil size={14} />
                      </button>
                   </div>
               </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-gray-400 mb-4 h-10 overflow-hidden text-ellipsis">{category.description || 'Sem descrição'}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {category.name}
                  </span>
                  <span className="text-xs font-medium text-gray-400">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar categoria" : "Nova categoria"} subtitle={editingId ? "Atualize as informações da categoria" : "Organize suas transações com categorias"}>
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Título</label>
            <input
              type="text"
              placeholder="Ex. Alimentação"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 bg-gray-50 placeholder:text-gray-400 transition-all font-medium"
              required
            />
          </div>
          
           <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Descrição</label>
            <input
              type="text"
              placeholder="Descrição da categoria"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 bg-gray-50 placeholder:text-gray-400 transition-all font-medium"
            />
          </div>

          <div>
             <label className="block text-sm font-medium mb-2 text-gray-700">Ícone</label>
             <div className="grid grid-cols-7 gap-2">
                {ICONS.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setForm({ ...form, icon: name })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      form.icon === name 
                        ? 'bg-primary text-white shadow-md scale-105' 
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                ))}
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2 text-gray-700">Cor</label>
             <div className="flex gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setForm({ ...form, color: color.value })}
                    className={`w-8 h-8 rounded-full transition-all ${color.value} ${
                       form.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                    }`}
                  />
                ))}
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-emerald-600 text-white p-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 mt-4 active:scale-95"
          >
            {editingId ? "Atualizar" : "Salvar"}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
