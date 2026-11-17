import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, 
    Smartphone, 
    UserCheck, 
    Upload, 
    Download, 
    Search, 
    RotateCcw, 
    Power,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Shield,
    GraduationCap,
    SlidersHorizontal,
    FileSpreadsheet
} from 'lucide-react';

export default function TeachersIndex({ users, filters, flash }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [scheduleType, setScheduleType] = useState(filters.schedule_type || '');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const { data: importData, setData: setImportData, post: postImport, processing: importing, errors: importErrors, reset: resetImport } = useForm({
        file: null,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.teachers.index'), {
            search,
            role,
            schedule_type: scheduleType,
        }, { preserveState: true });
    };

    const handleResetDevice = (user) => {
        if (confirm(`Yakin ingin me-reset ikatan perangkat untuk ${user.name}? Guru ini akan diizinkan login dari HP baru.`)) {
            router.post(route('admin.teachers.reset-device', user.id));
        }
    };

    const handleToggleActive = (user) => {
        const action = user.is_active ? 'menonaktifkan' : 'mengaktifkan';
        if (confirm(`Yakin ingin ${action} akun ${user.name}?`)) {
            router.post(route('admin.teachers.toggle-active', user.id));
        }
    };

    const submitImport = (e) => {
        e.preventDefault();
        postImport(route('admin.teachers.import'), {
            onSuccess: () => {
                setIsImportModalOpen(false);
                resetImport();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Direktori Guru & Staf Akademik" />

            {/* Breadcrumb Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-outline mb-1 font-body">
                        <span>Aplikasi Presensi Guru</span>
                        <span>/</span>
                        <span className="text-primary font-bold">Direktori Guru & Staf</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
                        Manajemen Guru & Karyawan
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                        Kelola akun pengguna, reset keterikatan perangkat (Device Binding), dan kelola penugasan kerja.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href={route('admin.teachers.template')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface bg-surface-container-low border border-outline-variant/60 rounded-xl hover:bg-surface-container transition-colors shadow-sm"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-primary" />
                        Unduh Format CSV
                    </a>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-container transition-colors shadow-sm"
                    >
                        <Upload className="w-4 h-4" />
                        Import Massal Pegawai
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash.success && (
                    <div className="flex items-center p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl shadow-sm">
                        <CheckCircle2 className="w-5 h-5 me-2 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-semibold">{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="flex items-center p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl shadow-sm">
                        <XCircle className="w-5 h-5 me-2 text-rose-600 flex-shrink-0" />
                        <span className="text-sm font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* Filter & Search Bar */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5 relative">
                            <Search className="w-4 h-4 text-outline absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Cari nama lengkap, NIP, atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full py-2 px-3 text-xs rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                            >
                                <option value="">Semua Hak Akses / Peran</option>
                                <option value="guru">Guru Pengajar</option>
                                <option value="admin_tu">Staf Tata Usaha</option>
                                <option value="kepsek">Kepala Sekolah</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <select
                                value={scheduleType}
                                onChange={(e) => setScheduleType(e.target.value)}
                                className="w-full py-2 px-3 text-xs rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                            >
                                <option value="">Semua Tipe Kerja</option>
                                <option value="full_time">Penuh Waktu</option>
                                <option value="part_time">Honorer / Khusus</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition shadow-sm"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/40">
                                    <th className="px-5 py-3.5">Guru / Tenaga Pendidik</th>
                                    <th className="px-5 py-3.5">Peran / Jabatan</th>
                                    <th className="px-5 py-3.5">Jadwal Tugas</th>
                                    <th className="px-5 py-3.5">Keterikatan HP (Device Binding)</th>
                                    <th className="px-5 py-3.5">Status Akun</th>
                                    <th className="px-5 py-3.5 text-right">Opsi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-body">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-outline/50" />
                                            Tidak ditemukan data guru atau pegawai yang sesuai filter.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-surface-container-low/50 transition">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-on-surface text-sm">{user.name}</div>
                                                        <div className="text-[11px] text-on-surface-variant tabular-nums">
                                                            NIP: {user.nip || 'Belum diisi'} &bull; {user.email || user.phone || 'Tanpa Kontak'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {user.role === 'admin_tu' && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                        Admin Tata Usaha
                                                    </span>
                                                )}
                                                {user.role === 'kepsek' && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        Kepala Sekolah
                                                    </span>
                                                )}
                                                {user.role === 'guru' && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        Guru Pengajar
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center text-xs font-semibold ${user.schedule_type === 'part_time' ? 'text-amber-700' : 'text-on-surface-variant'}`}>
                                                    {user.schedule_type === 'part_time' ? 'Honorer / Hari Tertentu' : 'Penuh Waktu (Senin-Sabtu)'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {user.device_id ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span className="tabular-nums">ID: {user.device_id.substring(0, 10)}...</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-outline italic">
                                                        Bebas (Belum terikat)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right space-x-2">
                                                {user.role === 'guru' && user.device_id && (
                                                    <button
                                                        onClick={() => handleResetDevice(user)}
                                                        className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                                                        title="Buka kunci perangkat agar guru bisa absen dari HP baru"
                                                    >
                                                        <RotateCcw className="w-3 h-3 me-1" />
                                                        Reset HP
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border transition ${user.is_active ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'}`}
                                                    title={user.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                                >
                                                    <Power className="w-3 h-3 me-1" />
                                                    {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <div className="px-5 py-3.5 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30">
                            <div className="text-xs text-on-surface-variant font-medium tabular-nums">
                                Menampilkan {users.from || 0} - {users.to || 0} dari total {users.total} guru
                            </div>
                            <div className="flex gap-1">
                                {users.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold tabular-nums transition ${
                                            link.active
                                                ? 'bg-primary text-white'
                                                : link.url
                                                ? 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                                                : 'text-outline/40 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Import CSV */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 relative">
                        <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                            Import Massal Guru via CSV
                        </h3>
                        <p className="text-xs text-on-surface-variant mb-5">
                            Gunakan format sesuai template resmi. Akun akan dibuat otomatis dengan password default (<span className="font-mono font-bold">Guru + 4 digit terakhir NIP</span>) dan wajib ubah password saat pertama login.
                        </p>

                        <form onSubmit={submitImport} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface mb-1.5">
                                    Pilih Berkas CSV
                                </label>
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={(e) => setImportData('file', e.target.files[0])}
                                    className="w-full text-xs text-on-surface-variant file:me-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border border-outline-variant/60 rounded-xl cursor-pointer"
                                />
                                {importErrors.file && (
                                    <p className="text-xs text-rose-600 mt-1 font-semibold">{importErrors.file}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={importing || !importData.file}
                                    className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-container disabled:opacity-50 rounded-xl transition shadow-sm"
                                >
                                    {importing ? 'Mengimpor...' : 'Mulai Proses Impor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
