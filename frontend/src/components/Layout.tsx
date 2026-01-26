import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Transações', path: '/transactions' },
    { name: 'Categorias', path: '/categories' },
  ];

  // Mock initials - in real app would come from user context
  const userInitials = "CT"; 

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" fillOpacity="0.2"/>
              <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
            </svg>
            <span>FINANCY</span>
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
