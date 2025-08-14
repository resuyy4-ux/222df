import React, { useMemo, useState, useEffect } from 'react';
import { ViewType, User } from '../types';
import { NAV_ITEMS, LogOutIcon, MoonIcon, SunIcon, UsersIcon } from '../constants';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLogout: () => void;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen, handleLogout, currentUser }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const visibleNavItems = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') {
      return NAV_ITEMS;
    }
    // Member role
    const memberPermissions = new Set(currentUser.permissions || []);
    memberPermissions.add(ViewType.DASHBOARD); // Always show dashboard
    return NAV_ITEMS.filter(item => memberPermissions.has(item.view));
  }, [currentUser]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside id="sidebar" className={`fixed xl:relative inset-y-0 left-0 w-64 bg-brand-surface flex-col flex-shrink-0 flex z-40 transform transition-transform duration-300 ease-in-out xl:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-6 border-b border-brand-border">
           <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-gradient">Vena Pictures</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul>
            {visibleNavItems.map((item) => (
              <li key={item.view}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView(item.view);
                  }}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-semibold rounded-lg transition-colors duration-200
                    ${
                      activeView === item.view
                        ? 'bg-brand-accent text-white'
                        : 'text-brand-text-primary hover:bg-brand-input'
                    }`}
                >
                  <div className="w-6 mr-3 flex-shrink-0 flex items-center justify-center">
                    <item.icon className={`w-5 h-5 ${activeView !== item.view ? 'text-brand-text-secondary' : ''}`} />
                  </div>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 py-4 flex-shrink-0 border-t border-brand-border">
           {currentUser && (
            <div className='flex items-center gap-3 mb-4'>
                <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-brand-text-secondary" />
                </div>
                <div>
                    <p className="font-semibold text-sm text-brand-text-light">{currentUser.fullName}</p>
                    <p className="text-xs text-brand-text-secondary">{currentUser.role}</p>
                </div>
            </div>
           )}
           <div className="flex items-center gap-2">
            <button 
                onClick={handleLogout} 
                className="flex items-center w-full px-4 py-3 my-1 text-sm font-semibold rounded-lg text-brand-text-primary hover:bg-brand-input transition-colors"
                aria-label="Keluar dari aplikasi"
            >
                <div className="w-6 mr-3 flex-shrink-0 flex items-center justify-center">
                    <LogOutIcon className="w-5 h-5 text-brand-text-secondary" />
                </div>
                <span>Keluar</span>
            </button>
             <button
                onClick={toggleTheme}
                className="p-3 my-1 rounded-lg text-brand-text-primary hover:bg-brand-input transition-colors"
                aria-label={`Ganti ke mode ${theme === 'light' ? 'gelap' : 'terang'}`}
              >
                {theme === 'light' ? <MoonIcon className="w-5 h-5 text-brand-text-secondary" /> : <SunIcon className="w-5 h-5 text-brand-text-secondary" />}
              </button>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
