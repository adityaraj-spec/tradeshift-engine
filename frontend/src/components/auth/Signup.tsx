import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface SignupProps {
  onSuccess?: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data?.user?.identities?.length === 0) {
        setError('User already exists');
        setLoading(false);
      } else {
        setMessage('Registration successful! Please check your email for a confirmation link.');
        setLoading(false);
        if (onSuccess) onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="signup-email">
          Email Address
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="name@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm">
          {message}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transform transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
      >
        {loading ? 'Creating Account...' : 'Get Started'}
      </button>
    </form>
  );
};
