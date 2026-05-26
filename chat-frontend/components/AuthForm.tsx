import { useState, FormEvent } from 'react';

interface AuthFormProps {
  onSubmit: (endpoint: 'login' | 'register', user: string, pass: string) => void;
  error: string;
}

export default function AuthForm({ onSubmit, error }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(isRegistering ? 'register' : 'login', username, password);
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
        SyncChat
      </h1>
      <p className="text-slate-400 text-sm mb-6">
        {isRegistering ? 'Create a secure account identity to start streaming.' : 'Sign in to access your synchronized channels.'}
      </p>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg p-3 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-600" required />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-600" required />
        </div>
        <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-3 text-sm font-semibold tracking-wide shadow-lg shadow-cyan-500/20">
          {isRegistering ? 'Complete Registration' : 'Secure Login'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button onClick={() => setIsRegistering(!isRegistering)} className="text-xs text-cyan-400 hover:underline">
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
