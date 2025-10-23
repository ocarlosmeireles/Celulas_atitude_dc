import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center rounded-full text-brand-text-secondary-light dark:text-brand-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-light dark:focus:ring-offset-brand-surface-dark transition-all duration-300"
      aria-label="Toggle dark mode"
    >
      <span className="relative w-6 h-6 flex items-center justify-center">
        <i className={`fas fa-moon absolute transition-all duration-300 transform text-lg ${theme === 'light' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}></i>
        <i className={`fas fa-sun absolute text-yellow-500 transition-all duration-300 transform text-lg ${theme === 'dark' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}></i>
      </span>
    </button>
  );
};

export default ThemeToggleButton;