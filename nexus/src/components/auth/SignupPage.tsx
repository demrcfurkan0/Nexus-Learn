import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Rocket } from 'lucide-react';
import apiClient from '../../services/apiClient';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/api/auth/register', {
        username,
        email,
        password,
      });
      // Başarılı kayıt sonrası login sayfasına yönlendir
      navigate('/login');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-100">Chart a New Course</h1>
          <p className="text-gray-400 mt-2">Create your account to start exploring the universe of knowledge.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-nexus-surface/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="auth-input" />
          </div>
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
            {isLoading ? 'Joining...' : 'Begin Expedition'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Already have a starmap?{' '}
          <Link to="/login" className="font-semibold text-nexus-accent hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;