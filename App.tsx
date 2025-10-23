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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Header currentView={view} setView={setView} />
      <main className="p-4 sm:p-6 md:p-8">
        {view === 'visitor' ? (
          <VisitorView cells={cellsHook.cells.filter(c => c.Status === 'Ativa')} />
        ) : (
          <AdminView cellsHook={cellsHook} />
        )}
      </main>
      <footer className="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Igreja Batista Atitude - Duque de Caxias. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;