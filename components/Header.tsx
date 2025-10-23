
import React from 'react';
import type { View } from '../types';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src="https://picsum.photos/50/50" alt="IBA Logo" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Encontre sua Célula</h1>
            <p className="text-sm text-gray-500">Igreja Batista Atitude - Caxias</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-gray-200 rounded-full p-1">
          <button
            onClick={() => setView('visitor')}
            className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
              currentView === 'visitor' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            <i className="fas fa-search mr-2"></i>Buscar
          </button>
          <button
            onClick={() => setView('admin')}
            className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
              currentView === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
             <i className="fas fa-user-shield mr-2"></i>Admin
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
