import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Leaf, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export default function GovernmentLogin() {
  const navigate = useNavigate();
  const { loginGovernment } = useAuth();

  const [governmentId, setGovernmentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const success = loginGovernment(
      governmentId.trim(),
      password
    );

    if (!success) {
      setError('Invalid government ID or password.');
      return;
    }

    navigate('/government/dashboard', { replace: true });
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

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-canopy-700)] text-white">
              <Leaf size={25} />
            </div>

            <h1 className="font-display text-2xl font-semibold text-[var(--color-canopy-950)]">
              Government Portal
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Authorized official access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Government ID
              </label>

              <input
                value={governmentId}
                onChange={(e) => setGovernmentId(e.target.value)}
                placeholder="GOV-KA-00125"
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

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-canopy-700)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-canopy-800)]"
            >
              <ShieldCheck size={17} />
              Sign in as Government Official
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-[var(--color-canopy-50)] p-3 text-xs text-[var(--color-canopy-800)]">
            <p className="font-semibold">Demo credentials</p>
            <p className="mt-1">ID: GOV-KA-00125</p>
            <p>Password: eco@2026</p>
          </div>

        </div>
      </div>
    </div>
  );
}