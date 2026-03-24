import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from './AuthCard';
import { Login } from './Login';
import { Signup } from './Signup';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  const handleSuccess = () => {
    console.log('Auth successful!');
    navigate('/profile');
  };

  return (
    <AuthCard title={mode === 'login' ? 'Sign In' : 'Create Account'}>
      {mode === 'login' ? (
        <Login onSuccess={handleSuccess} />
      ) : (
        <Signup onSuccess={handleSuccess} />
      )}
      
      <div className="mt-8 pt-6 border-t border-gray-800 text-center">
        <button
          onClick={toggleMode}
          className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
        >
          {mode === 'login' 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Sign in"}
        </button>
      </div>
    </AuthCard>
  );
};
