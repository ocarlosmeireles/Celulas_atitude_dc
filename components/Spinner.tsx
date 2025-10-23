
import React from 'react';

const Spinner: React.FC<{ variant?: 'primary' | 'white' }> = ({ variant = 'primary' }) => {
  const colorClass = variant === 'white' 
    ? 'border-white' 
    : 'border-brand-primary-light dark:border-brand-accent-dark';
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${colorClass}`}></div>
    </div>
  );
};

export default Spinner;