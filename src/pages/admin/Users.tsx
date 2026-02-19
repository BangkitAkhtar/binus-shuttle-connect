import { useState, useEffect } from 'react';
import { getUsers, saveUsers } from '../../data/mockData';
import { User } from '../../types';

export default function AdminUsers() {
  const [students, setStudents] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nim: '', faculty: '' });
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const load = () => setStudents(getUsers().filter(u => u.role === 'student'));
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = getUsers();
    if (editId) {
      const updated = all.map(u => u.id === editId ? { ...u, ...form } : u);
      saveUsers(updated);
      showToast('✅ Data mahasiswa diperbarui');
    } else {
      if (all.find(u => u.nim === form.nim)) { showToast('NIM sudah terdaftar!'); return; }
      const newUser: User = { id: `u-${Date.now()}`, role: 'student', ...form };
      saveUsers([...all, newUser]);
      showToast('✅ Mahasiswa ditambahkan');
    }
    setForm({ name: '', nim: '', faculty: '' });
    setShowForm(false);
    setEditId(null);
    load();
  };

  const handleEdit = (u: User) => {
    setForm({ name: u.name, nim: u.nim || '', faculty: u.faculty || '' });
    setEditId(u.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = getUsers().filter(u => u.id !== id);
    saveUsers(updated);
    setDeleteConfirm(null);
    load();
    showToast('Mahasiswa dihapus');
  };

  const filtered = students.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.nim || '').includes(search)
  );

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manajemen Mahasiswa</h1>
          <p className="text-sm text-muted-foreground">{students.length} mahasiswa terdaftar</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', nim: '', faculty: '' }); }} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Tambah
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama atau NIM..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-binus"
        />
      </div>

      <div className="space-y-2">
        {filtered.map(student => (
          <div key={student.id} className="card-binus flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-primary-foreground" style={{ background: 'var(--gradient-primary)' }}>
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{student.name}</p>
              <p className="text-xs text-muted-foreground">{student.nim} · {student.faculty}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(student)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => setDeleteConfirm(student.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">Tidak ada data</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-5 w-full max-w-md animate-slide-up">
            <h3 className="font-bold text-foreground text-lg mb-4">{editId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Nama Lengkap</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama mahasiswa" className="input-binus" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">NIM</label>
                <input required value={form.nim} onChange={e => setForm(f => ({ ...f, nim: e.target.value }))} placeholder="Nomor Induk Mahasiswa" className="input-binus" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Fakultas</label>
                <select value={form.faculty} onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))} className="input-binus">
                  <option value="">Pilih Fakultas</option>
                  <option>School of Computer Science</option>
                  <option>School of Business Management</option>
                  <option>School of Design</option>
                  <option>School of Information Systems</option>
                  <option>School of Communication</option>
                  <option>Faculty of Engineering</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold">Batal</button>
                <button type="submit" className="flex-1 btn-primary py-2.5">{editId ? 'Simpan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-bold text-foreground text-lg mb-2">Hapus Mahasiswa?</h3>
            <p className="text-muted-foreground text-sm mb-4">Data mahasiswa akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
