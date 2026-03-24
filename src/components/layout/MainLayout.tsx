import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, LayoutDashboard, MessageSquare, User, LogOut } from 'lucide-react';
import { useStore } from '../../store';

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useStore();
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: <Home size={20} /> },
    { path: '/dashboard', label: '学习中心', icon: <LayoutDashboard size={20} />, requiresAuth: true },
    { path: '/courses', label: '分级课程', icon: <BookOpen size={20} /> },
    { path: '/community', label: '社区交流', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-xl font-bold text-slate-900 hidden sm:block">LinguaMaster</span>
              </Link>
              
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                {navItems.filter(item => !item.requiresAuth || isAuthenticated).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-1 px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-blue-500 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold text-blue-700">LV.{user.level}</span>
                    <span className="text-xs text-blue-600">{user.experiencePoints} XP</span>
                  </div>
                  <div className="relative group cursor-pointer">
                    <img 
                      src={user.avatar} 
                      alt="User avatar" 
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user.username}</p>
                      </div>
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        退出登录
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <User size={16} className="mr-2" />
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.filter(item => !item.requiresAuth || isAuthenticated).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                location.pathname === item.path ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
