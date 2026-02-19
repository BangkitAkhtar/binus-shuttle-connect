import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero-shuttle.jpg';

type Tab = 'student' | 'driver' | 'admin';

const tabConfig = {
  student: { label: 'Mahasiswa', placeholder: 'Masukkan NIM', hint: 'Contoh: 2501234567' },
  driver: { label: 'Pengemudi', placeholder: 'Masukkan Driver ID', hint: 'Contoh: DRV001' },
  admin: { label: 'Admin', placeholder: 'Masukkan Admin ID', hint: 'Contoh: ADM001' },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('student');
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!id.trim()) { setError('ID tidak boleh kosong'); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(id.trim(), activeTab);
    if (!ok) setError('ID tidak ditemukan. Coba lagi.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div className="relative lg:flex-1 h-48 lg:h-screen overflow-hidden">
        <img src={heroImage} alt="BINUS Shuttle" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, hsl(213 68% 18% / 0.7), hsl(213 68% 10% / 0.85))' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center font-black text-lg lg:text-2xl text-white" style={{ background: 'var(--gradient-accent)' }}>
              B
            </div>
            <div>
              <div className="font-black text-xl lg:text-3xl tracking-tight">BINUS</div>
              <div className="text-xs lg:text-sm font-medium opacity-80 -mt-0.5">Shuttle System</div>
            </div>
          </div>
          <p className="text-xs lg:text-sm opacity-70 text-center mt-1 hidden lg:block">Layanan Shuttle Resmi Kampus Anggrek ↔ Alam Sutera</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base" style={{ background: 'var(--gradient-primary)' }}>B</div>
            <div>
              <div className="font-black text-lg text-foreground">BINUS Shuttle</div>
              <div className="text-xs text-muted-foreground -mt-0.5">Sistem Manajemen Shuttle Kampus</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Selamat Datang</h2>
          <p className="text-muted-foreground text-sm mb-6">Masuk untuk mengakses layanan shuttle</p>

          {/* Role Tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
            {(Object.keys(tabConfig) as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setId(''); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tabConfig[tab].label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {tabConfig[activeTab].label} ID
              </label>
              <input
                type="text"
                value={id}
                onChange={e => { setId(e.target.value); setError(''); }}
                placeholder={tabConfig[activeTab].placeholder}
                className="input-binus"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground mt-1">{tabConfig[activeTab].hint}</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Demo Akun:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div><span className="font-medium text-foreground">Mahasiswa:</span> NIM 2501234567</div>
              <div><span className="font-medium text-foreground">Pengemudi:</span> Driver ID DRV001</div>
              <div><span className="font-medium text-foreground">Admin:</span> Admin ID ADM001</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
