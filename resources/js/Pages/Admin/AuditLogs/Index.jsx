import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, Clock, ArrowRight, UserCheck, ShieldCheck, History } from 'lucide-react';

export default function AuditLogsIndex({ logs }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'tepat_waktu':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Hadir Tepat</span>;
            case 'terlambat':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Terlambat</span>;
            case 'sakit':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Sakit</span>;
            case 'izin':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Izin</span>;
            case 'dinas_luar':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Dinas Luar</span>;
            case 'htap':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">HTAP</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant/60">{status || 'Alpa'}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Audit Trail & Rekam Jejak Koreksi" />

            {/* Breadcrumb Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-outline mb-1 font-body">
                        <span>Aplikasi Presensi Guru</span>
                        <span>/</span>
                        <span className="text-primary font-bold">Audit Trail & Keamanan</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
                        Jejak Audit Koreksi Presensi
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                        Log permanen dan transparan atas seluruh perubahan atau koreksi manual kehadiran guru oleh Tata Usaha.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Immutable Audit Log Terproteksi</span>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/40">
                                    <th className="px-5 py-3.5">Waktu Perubahan</th>
                                    <th className="px-5 py-3.5">Admin Pengubah (TU)</th>
                                    <th className="px-5 py-3.5">Guru Sasaran</th>
                                    <th className="px-5 py-3.5">Tanggal Absen</th>
                                    <th className="px-5 py-3.5">Status Koreksi</th>
                                    <th className="px-5 py-3.5">Catatan / Alasan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-body">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                                            <History className="w-8 h-8 mx-auto mb-2 text-outline/50" />
                                            Belum ada aktivitas koreksi presensi manual yang tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-surface-container-low/50 transition">
                                            <td className="px-5 py-4 whitespace-nowrap text-on-surface-variant tabular-nums font-mono text-[11px]">
                                                {log.created_at ? log.created_at.substring(0, 19).replace('T', ' ') : '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-on-surface text-sm">{log.modifier?.name || 'Admin TU'}</div>
                                                <div className="text-[11px] text-on-surface-variant tabular-nums">NIP: {log.modifier?.nip || '-'}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-on-surface text-sm">{log.attendance?.user?.name || 'Guru'}</div>
                                                <div className="text-[11px] text-on-surface-variant tabular-nums">NIP: {log.attendance?.user?.nip || '-'}</div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-on-surface tabular-nums">
                                                {log.attendance?.date || '-'}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    {getStatusBadge(log.old_status)}
                                                    <ArrowRight className="w-3.5 h-3.5 text-outline" />
                                                    {getStatusBadge(log.new_status)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 max-w-xs text-on-surface leading-relaxed">
                                                {log.reason}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="px-5 py-3.5 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30">
                            <div className="text-xs text-on-surface-variant font-medium tabular-nums">
                                Menampilkan {logs.from || 0} - {logs.to || 0} dari total {logs.total} riwayat audit
                            </div>
                            <div className="flex gap-1">
                                {logs.links.map((link, idx) => (
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
        </AuthenticatedLayout>
    );
}
