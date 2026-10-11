import { Leaf, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#fcfcf8] px-5 py-10">

      {/* Botanical background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-top bg-no-repeat"
        style={{
          backgroundImage: "url('/images/eco-botanical-bg.png')",
          backgroundSize: '100% auto',
        }}
      />

      {/* Soft fade into the clean background */}
      <div className="pointer-events-none absolute inset-x-0 top-[260px] h-[200px] bg-gradient-to-b from-transparent via-[#fcfcf8]/75 to-[#fcfcf8]" />

      {/* Branding */}
      <header className="relative z-10 mt-24 mb-7 w-full max-w-3xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#20583e] text-white shadow-md">
          <Leaf size={32} />
        </div>

        <h1 className="text-3xl font-bold tracking-wide text-[#214c38]">
          ECO-SENTINEL
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Decentralized Forest Intelligence Platform
        </p>

        <div className="mx-auto mt-6 flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-[#cbd8c9]" />
          <Leaf size={15} className="text-[#9db79a]" />
          <span className="h-px w-16 bg-[#cbd8c9]" />
        </div>

        <h2 className="mt-4 text-xl font-semibold text-[#183f32]">
          Select your portal
        </h2>
      </header>

      {/* Portal cards */}
      <main className="relative z-10 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">

        <button
          type="button"
          onClick={() => navigate('/login/government')}
          className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-[#e7ede4] bg-white/95 p-7 text-left shadow-[0_8px_28px_rgba(35,70,45,0.08)] transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ec] text-[#20583e]">
            <ShieldCheck size={30} />
          </div>

          <h3 className="text-xl font-bold text-[#183f32]">
            Government Portal
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            For authorized forest and government officials to monitor
            deforestation alerts, AI detections, evidence, analytics,
            blockchain records and live monitoring.
          </p>

          <span className="mt-auto pt-6 text-sm font-semibold text-[#20583e]">
            Government Official Login →
          </span>

          <Leaf
            size={100}
            className="pointer-events-none absolute -bottom-7 -right-5 text-[#e8f1e5] opacity-80"
          />
        </button>

        <button
          type="button"
          onClick={() => navigate('/login/community')}
          className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-[#e7ede4] bg-white/95 p-7 text-left shadow-[0_8px_28px_rgba(35,70,45,0.08)] transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ec] text-[#20583e]">
            <Users size={30} />
          </div>

          <h3 className="text-xl font-bold text-[#183f32]">
            Community Portal
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            For citizens and community users to view forest alerts,
            environmental trends and awareness resources.
          </p>

          <span className="mt-auto pt-6 text-sm font-semibold text-[#20583e]">
            Community Login / Sign Up →
          </span>

          <Leaf
            size={100}
            className="pointer-events-none absolute -bottom-7 -right-5 text-[#e8f1e5] opacity-80"
          />
        </button>

      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-8 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="hidden h-px w-12 bg-[#d6dfd2] sm:block" />
        ECO-SENTINEL · Forest Intelligence
        <span className="hidden h-px w-12 bg-[#d6dfd2] sm:block" />
      </footer>

    </div>
  );
}