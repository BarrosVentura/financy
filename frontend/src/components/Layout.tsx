import { Link, useLocation } from 'react-router-dom';

import { useQuery, gql } from '@apollo/client';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Transações', path: '/transactions' },
    { name: 'Categorias', path: '/categories' },
  ];


  const GET_ME = gql`
    query GetMe {
      me {
        id
        name
      }
    }
  `;

  const { data } = useQuery(GET_ME);
  const user = data?.me;
  
  const getInitials = (name: string) => {
      if (!name) return 'CT';
      const parts = name.split(' ');
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const userInitials = user ? getInitials(user.name) : '...'; 

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/assets/Logo.svg" alt="Financy Logo" className="h-8" />
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <Link to="/profile" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium hover:bg-gray-300 transition-colors">
            {userInitials}
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
