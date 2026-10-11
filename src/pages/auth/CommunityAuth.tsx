import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Leaf, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export default function CommunityAuth() {
  const navigate = useNavigate();
  const { loginCommunity, signupCommunity } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }

      const success = signupCommunity(name.trim(), email.trim(), password);

      if (!success) {
        setError('An account with this email already exists.');
        return;
      }

      navigate('/ngo/dashboard', { replace: true });
      return;
    }

    const success = loginCommunity(email.trim(), password);

    if (!success) {
      setError('Invalid email or password.');
      return;
    }

    navigate('/ngo/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[var(--color-sand-50)] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={16} />
          Back to portal selection
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-canopy-700)] text-white">
              <Leaf size={25} />
            </div>

            <h1 className="font-display text-2xl font-semibold text-[var(--color-canopy-950)]">
              Community Portal
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {mode === 'login'
                ? 'Sign in to your community account'
                : 'Create your community account'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-md py-2 text-sm font-medium ${
                mode === 'login'
                  ? 'bg-white text-[var(--color-canopy-700)] shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`rounded-md py-2 text-sm font-medium ${
                mode === 'signup'
                  ? 'bg-white text-[var(--color-canopy-700)] shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-gray-200 bg-[var(--color-sand-50)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 bg-[var(--color-sand-50)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-gray-200 bg-[var(--color-sand-50)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full rounded-lg border border-gray-200 bg-[var(--color-sand-50)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-canopy-500)]"
                  required
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-canopy-700)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-canopy-800)]"
            >
              <Users size={17} />
              {mode === 'login'
                ? 'Sign In'
                : 'Create Community Account'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}