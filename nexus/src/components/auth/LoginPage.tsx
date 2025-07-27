import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
  
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Incorrect email or password. Please try again.');
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-3 mb-4">
            <Rocket className="w-10 h-10 text-nexus-accent" />
            <span className="text-4xl font-bold text-nexus-accent glow-text">Nexus</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-100">Welcome Back, Explorer</h1>
          <p className="text-gray-400 mt-2">Log in to continue your journey through knowledge.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-nexus-surface/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="auth-input" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input" />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full auth-button" disabled={isLoading}>
            {isLoading ? 'Engaging...' : 'Engage Warp Drive'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-nexus-accent hover:underline">
            Join the Fleet
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;