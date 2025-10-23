
import React, { useState } from 'react';
import VisitorView from './views/VisitorView';
import AdminView from './views/AdminView';
import { useCells } from './hooks/useCells';
import Header from './components/Header';
import type { View } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('visitor');
  const cellsHook = useCells();

  return (
    <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark font-sans">
      <Header currentView={view} setView={setView} />
      <main className="p-4 sm:p-6 md:p-8">
        {view === 'visitor' ? (
          <VisitorView cells={cellsHook.cells.filter(c => c.Status === 'Ativa')} />
        ) : (
          <AdminView cellsHook={cellsHook} />
        )}
      </main>
      <footer className="text-center p-6 text-brand-text-secondary-light dark:text-brand-text-secondary-dark text-sm border-t border-gray-200 dark:border-gray-700/50">
        <p className="font-semibold text-brand-text-light dark:text-brand-text-dark">Um novo começo, uma nova história.</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Igreja Batista Atitude - Duque de Caxias. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;