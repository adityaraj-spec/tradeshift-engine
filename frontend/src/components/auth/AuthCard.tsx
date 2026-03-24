import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 transition-all hover:border-gray-700">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
          <p className="mt-2 text-gray-400 text-sm">Welcome back to TradeShift</p>
        </div>
        {children}
      </div>
    </div>
  );
};
