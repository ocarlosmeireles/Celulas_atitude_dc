
import React from 'react';
import type { View } from '../types';
import ThemeToggleButton from './ThemeToggleButton';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-brand-surface-light/80 dark:bg-brand-surface-dark/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-light to-purple-600 dark:from-brand-primary-dark dark:to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-church text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-primary-light dark:text-white">Encontre sua Célula</h1>
            <p className="text-sm text-brand-text-secondary-light dark:text-brand-text-secondary-dark -mt-1">Igreja Batista Atitude - Caxias</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <nav className="hidden sm:flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-full p-1">
            <button
              onClick={() => setView('visitor')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                currentView === 'visitor' ? 'bg-brand-primary-light text-white shadow-md' : 'text-brand-text-secondary-light dark:text-brand-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <i className="fas fa-search mr-2 opacity-80"></i>Buscar
            </button>
            <button
              onClick={() => setView('admin')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                currentView === 'admin' ? 'bg-brand-primary-light text-white shadow-md' : 'text-brand-text-secondary-light dark:text-brand-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
               <i className="fas fa-user-shield mr-2 opacity-80"></i>Admin
            </button>
          </nav>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default Header;