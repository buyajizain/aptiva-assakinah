import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Calendar, 
    Check, 
    X, 
    FileText, 
    Clock, 
    AlertCircle, 
    Search, 
    CheckCircle2, 
    XCircle,
    ExternalLink,
    Filter,
    ShieldCheck,
    FileCheck,
    AlertTriangle
} from 'lucide-react';

export default function AdminLeavesIndex({ leaves, filters, pending_count, flash }) {
    const [status, setStatus] = useState(filters.status || 'pending');
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [rejectingLeave, setRejectingLeave] = useState(null);

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejecting, errors: rejectErrors, reset: resetReject } = useForm({
        rejection_note: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.leaves.index'), {
            status,
            search,
            type,
        }, { preserveState: true });
    };

    const handleApprove = (leave) => {
        if (confirm(`Setujui permohonan ${leave.type} untuk ${leave.user.name}? Status presensi harian pada rentang tanggal tersebut akan otomatis disinkronkan.`)) {
            router.post(route('admin.leaves.approve', leave.id));
        }
    };

    const submitReject = (e) => {
        e.preventDefault();
        if (!rejectingLeave) return;

        postReject(route('admin.leaves.reject', rejectingLeave.id), {
            onSuccess: () => {
                setRejectingLeave(null);
                resetReject();
            },
        });
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'sakit':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Sakit</span>;
            case 'dinas_luar':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Dinas Luar</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Izin</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                        <Check className="w-3 h-3" /> Disetujui
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-error-container text-on-error-container">
                        <X className="w-3 h-3" /> Ditolak
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant">
                        <Clock className="w-3 h-3" /> Menunggu Tindakan
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Persetujuan Izin & Cuti Guru - Yayasan As-Sakinah" />

            <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto gap-6">
                {/* Header Context Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
                    <div>
                        <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-wider mb-1 font-display">
                            <ShieldCheck className="w-4 h-4 text-secondary" />
                            <span>Modul Kepegawaian & SDM Pendidik</span>
                        </div>
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                            Pusat Permohonan Izin, Sakit & Cuti Dewan Guru
                        </h1>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                            Alur verifikasi dokumen pendukung (surat dokter / surat tugas) dan sinkronisasi otomatis ke log kehadiran.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {pending_count > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error-container text-on-error-container font-bold text-xs shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                                {pending_count} Berkas Menunggu Tindakan
                            </span>
                        )}
                    </div>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center shadow-sm">
                        <CheckCircle2 className="w-4 h-4 me-2 text-emerald-600 flex-shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* Filter Control Bar (Stitch Tabs + Search) */}
                <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                        {[
                            { id: '', label: 'Semua Status' },
                            { id: 'pending', label: 'Menunggu Tindakan' },
                            { id: 'approved', label: 'Disetujui' },
                            { id: 'rejected', label: 'Ditolak' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setStatus(tab.id);
                                    router.get(route('admin.leaves.index'), { status: tab.id, search, type }, { preserveState: true });
                                }}
                                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                                    status === tab.id
                                        ? 'bg-primary-container text-on-primary shadow-sm'
                                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search & Type Filters */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="text-xs border-outline-variant/60 rounded-xl focus:ring-primary focus:border-primary"
                        >
                            <option value="">Semua Jenis</option>
                            <option value="sakit">Sakit</option>
                            <option value="izin">Izin</option>
                            <option value="dinas_luar">Dinas Luar</option>
                        </select>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari nama guru..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-xs pl-8 pr-3 py-2 border-outline-variant/60 rounded-xl focus:ring-primary focus:border-primary w-48 sm:w-60"
                            />
                            <Search className="w-3.5 h-3.5 text-outline absolute left-2.5 top-2.5" />
                        </div>

                        <button
                            type="submit"
                            className="px-3.5 py-2 font-bold text-on-primary bg-primary hover:bg-primary-container rounded-xl transition text-xs shadow-sm"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Table of Leaves */}
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-outline-variant/20 text-left text-xs">
                            <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-6 py-4">Guru Pemohon</th>
                                    <th className="px-6 py-4">Jenis Permohonan</th>
                                    <th className="px-6 py-4">Rentang Tanggal</th>
                                    <th className="px-6 py-4">Alasan & Dokumen</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi Verifikasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                                {leaves.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-outline">
                                            Tidak ada permohonan izin atau cuti yang sesuai filter.
                                        </td>
                                    </tr>
                                ) : (
                                    leaves.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-container/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-on-surface">{item.user?.name}</div>
                                                <div className="text-[11px] text-outline">NIP: {item.user?.nip || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getTypeBadge(item.type)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-on-surface">
                                                    {item.start_date} s/d {item.end_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-on-surface truncate font-medium">{item.reason}</div>
                                                {item.document_path ? (
                                                    <a
                                                        href={`/storage/${item.document_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-bold mt-0.5"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        Lihat Dokumen Pendukung
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-outline italic">Tanpa lampiran</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(item.status)}
                                                {item.rejection_note && (
                                                    <div className="text-[10px] text-error mt-1 italic">
                                                        Alasan: {item.rejection_note}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(item)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-white bg-secondary hover:bg-secondary-container hover:text-on-secondary-container transition text-xs shadow-sm"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectingLeave(item)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-error bg-error-container hover:bg-red-200 transition text-xs shadow-sm"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-outline font-medium">Telah Diproses</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL REJEKSI PERMOHONAN */}
            {rejectingLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-outline-variant/30">
                        <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                            <h3 className="font-bold text-sm text-on-surface">Alasan Penolakan Permohonan</h3>
                            <button
                                onClick={() => setRejectingLeave(null)}
                                className="p-1 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitReject} className="p-6 space-y-4 text-xs">
                            <p className="text-on-surface-variant">
                                Berikan catatan penolakan untuk <strong>{rejectingLeave.user?.name}</strong>:
                            </p>

                            <textarea
                                rows="3"
                                value={rejectData.rejection_note}
                                onChange={(e) => setRejectData('rejection_note', e.target.value)}
                                placeholder="Contoh: Dokumen surat dokter belum ditandatangani / tidak terbaca."
                                className="w-full text-xs border-outline-variant/60 rounded-xl focus:ring-primary focus:border-primary"
                                required
                            />
                            {rejectErrors.rejection_note && (
                                <p className="text-error mt-1">{rejectErrors.rejection_note}</p>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingLeave(null)}
                                    className="px-4 py-2 font-semibold text-outline hover:bg-surface-container rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejecting}
                                    className="px-5 py-2 font-bold text-on-error bg-error hover:bg-red-700 rounded-xl shadow-md transition disabled:opacity-50"
                                >
                                    {rejecting ? 'Memproses...' : 'Tolak Permohonan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
