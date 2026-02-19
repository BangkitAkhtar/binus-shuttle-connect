import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  
  return (
    <div className="page-container max-w-md mx-auto animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Profil Saya</h1>
      </div>

      {/* Avatar Card */}
      <div className="card-primary mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black text-white">
          {user?.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-sm opacity-80 text-white">{user?.nim}</p>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Mahasiswa</span>
        </div>
      </div>

      {/* Info Card */}
      <div className="card-binus mb-4 space-y-4">
        {[
          { label: 'Nama Lengkap', value: user?.name, icon: '👤' },
          { label: 'NIM', value: user?.nim, icon: '🎓' },
          { label: 'Fakultas', value: user?.faculty, icon: '🏛️' },
          { label: 'Role', value: 'Mahasiswa', icon: '🏷️' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1 border-b border-border pb-3 last:border-0 last:pb-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{item.value || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-2xl border-2 border-destructive/30 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/5 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Keluar dari Akun
      </button>
    </div>
  );
}
