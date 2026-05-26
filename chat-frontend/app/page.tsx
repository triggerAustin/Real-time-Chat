'use client';

import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import AuthForm from '../components/AuthForm';
import ChatRoom from '../components/ChatRoom';

export default function Home() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const { token, user } = authService.getStoredSession();
    if (token && user) {
      setUsername(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSubmit = async (endpoint: 'login' | 'register', user: string, pass: string) => {
    try {
      setError('');
      const data = await authService.handleAuth(endpoint, user, pass);
      authService.setSession(data.token, data.username);
      setUsername(data.username);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    authService.clearSession();
    setIsAuthenticated(false);
    setUsername('');
  };

  if (isAuthenticated) {
    return (
      <main className="flex h-screen w-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
        <ChatRoom username={username} onLogout={handleLogout} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 antialiased">
      <AuthForm onSubmit={handleAuthSubmit} error={error} />
    </main>
  );
}
