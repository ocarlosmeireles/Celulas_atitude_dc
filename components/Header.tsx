import React from 'react';
import type { View } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src="https://iba-caxias-logo.s3.amazonaws.com/logo-iba-caxias.png" alt="IBA Logo" className="h-10 w-10 rounded-lg object-cover" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Encontre sua Célula</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">IBA Caxias</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* iOS-style Segmented Control */}
           <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-800 rounded-full p-1">
              <button
                onClick={() => setView('visitor')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${
                  currentView === 'visitor' ? 'bg-white text-blue-600 dark:bg-gray-700 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Buscar
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${
                  currentView === 'admin' ? 'bg-white text-blue-600 dark:bg-gray-700 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Admin
              </button>
          </div>
          
           {/* Dark Mode Toggle */}
           <button onClick={toggleTheme} className="w-10 h-10 flex justify-center items-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
            {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun text-yellow-400"></i>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;