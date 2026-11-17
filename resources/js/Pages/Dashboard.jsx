import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Camera, 
    Filter, 
    Edit3, 
    X, 
    TrendingUp, 
    FileText, 
    RefreshCw,
    ShieldAlert,
    TimerOff,
    BadgeAlert,
    ExternalLink,
    Search
} from 'lucide-react';

export default function Dashboard({ 
    metrics, 
    selected_date, 
    formatted_selected_date, 
    photo_audits, 
    attendances, 
    not_present_teachers, 
    school_name, 
    can_correct, 
    flash 
}) {
    const user = usePage().props.auth.user;
    const [activeTab, setActiveTab] = useState('photo_audit'); // 'photo_audit' | 'table' | 'not_present'
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [correctionTarget, setCorrectionTarget] = useState(null);

    // Form Koreksi Manual
    const { data: correctData, setData: setCorrectData, post: postCorrect, processing: correcting, errors: correctErrors, reset: resetCorrect } = useForm({
        user_id: '',
        date: selected_date,
        status: 'tepat_waktu',
        checkin_time: '07:00',
        reason: '',
    });

    const handleDateChange = (newDate) => {
        router.get(route('dashboard'), { date: newDate }, { preserveState: true });
    };

    const openCorrectionModal = (target) => {
        setCorrectionTarget(target);
        setCorrectData({
            user_id: target.user_id || target.id,
            date: selected_date,
            status: target.status || 'tepat_waktu',
            checkin_time: target.checkin_time ? target.checkin_time.substring(0, 5) : '07:00',
            reason: '',
        });
    };

    const submitCorrection = (e) => {
        e.preventDefault();
        postCorrect(route('admin.attendance.correct'), {
            onSuccess: () => {
                setCorrectionTarget(null);
                resetCorrect();
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'tepat_waktu':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container border border-secondary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Tepat Waktu
                    </span>
                );
            case 'terlambat':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant border border-tertiary-container/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                        Terlambat
                    </span>
                );
            case 'sakit':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Sakit
                    </span>
                );
            case 'izin':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Izin
                    </span>
                );
            case 'dinas_luar':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Dinas Luar
                    </span>
                );
            case 'htap':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        HTAP
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-error-container text-on-error-container border border-error/20">
                        Alpa
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Utama Presensi - Yayasan As-Sakinah" />

            <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 gap-6 max-w-7xl mx-auto">
                {/* Flash Messages */}
                {flash.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center shadow-sm">
                        <CheckCircle2 className="w-4 h-4 me-2 text-emerald-600 flex-shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs font-semibold flex items-center shadow-sm">
                        <AlertTriangle className="w-4 h-4 me-2 text-red-600 flex-shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* 1. TOP GREETING & OPERATIONAL STATUS BANNER (STITCH DESIGN) */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-surface-tint p-6 sm:p-8 text-on-primary shadow-lg">
                    <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-secondary-fixed/10 blur-3xl pointer-events-none"></div>
                    <div className="absolute right-1/4 -bottom-16 h-48 w-48 rounded-full bg-surface-bright/5 blur-2xl pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col gap-1.5 max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-on-primary/10 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                                <span className="inline-block w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                                <span className="text-[11px] font-bold tracking-wide uppercase text-surface-bright">
                                    Pembaruan Langsung Real-Time
                                </span>
                            </div>
                            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-on-primary">
                                Selamat Datang, {user.name}!
                            </h1>
                            <p className="text-xs sm:text-sm text-surface-container-high leading-relaxed">
                                Ringkasan presensi dewan guru hari ini, <strong className="text-surface-bright">{formatted_selected_date}</strong> (Batas Jam Masuk: 07:15 WIB).
                            </p>
                        </div>

                        {/* Quick Controls */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => router.reload({ preserveScroll: true })}
                                className="inline-flex items-center gap-2 bg-on-primary/15 hover:bg-on-primary/25 text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Segarkan Data</span>
                            </button>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={selected_date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="bg-surface-container-lowest text-on-surface text-xs font-bold px-3.5 py-2.5 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-white"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. 5 KEY METRICS KPI ROW (STITCH SYSTEM) */}
                <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Card 1: Total Staf & Guru */}
                    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-display">
                                    Total Staf & Guru
                                </span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="font-display text-2xl font-black text-on-surface tabular-nums">
                                        {metrics.total_teachers}
                                    </span>
                                    <span className="text-xs text-outline font-medium">Orang</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-outline text-[11px]">
                            <span>Kehadiran</span>
                            <span className="font-bold text-primary">{metrics.attendance_rate}%</span>
                        </div>
                    </div>

                    {/* Card 2: Hadir Tepat Waktu */}
                    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-display">
                                    Tepat Waktu
                                </span>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="font-display text-2xl font-black text-secondary tabular-nums">
                                        {metrics.tepat_waktu_count}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                                        {metrics.total_teachers > 0 ? Math.round((metrics.tepat_waktu_count / metrics.total_teachers) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] text-on-secondary-container font-semibold">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>&le; Pukul 07:15 WIB</span>
                        </div>
                    </div>

                    {/* Card 3: Terlambat Masuk */}
                    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-display">
                                    Terlambat
                                </span>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="font-display text-2xl font-black text-tertiary-container tabular-nums">
                                        {metrics.terlambat_count}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold">
                                        {metrics.total_teachers > 0 ? Math.round((metrics.terlambat_count / metrics.total_teachers) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary-container">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-on-tertiary-fixed-variant font-semibold">
                            &gt; Pukul 07:15 WIB
                        </div>
                    </div>

                    {/* Card 4: Izin / Sakit / Dinas */}
                    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-display">
                                    Izin & Sakit
                                </span>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="font-display text-2xl font-black text-primary-container tabular-nums">
                                        {metrics.leave_count}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
                                        Disetujui
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary-fixed/50 flex items-center justify-center text-primary-container">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-outline">
                            Surat izin / sakit valid
                        </div>
                    </div>

                    {/* Card 5: Belum Hadir */}
                    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition col-span-2 md:col-span-4 lg:col-span-1">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-display">
                                    Belum Hadir
                                </span>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="font-display text-2xl font-black text-error tabular-nums">
                                        {metrics.not_present_count}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                                        Belum Absen
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-error">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-error font-semibold">
                            Menunggu presensi
                        </div>
                    </div>
                </section>

                {/* 3. TAB CONTROLS (STITCH NAVIGATION STYLE) */}
                <div className="flex items-center space-x-2 border-b border-outline-variant/30 pb-2">
                    <button
                        onClick={() => setActiveTab('photo_audit')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'photo_audit'
                                ? 'bg-primary-container text-on-primary shadow-sm'
                                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                        }`}
                    >
                        <Camera className="w-4 h-4" />
                        <span>Photo Audit Grid ({photo_audits.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('table')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'table'
                                ? 'bg-primary-container text-on-primary shadow-sm'
                                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span>Tabel Presensi ({attendances.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('not_present')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'not_present'
                                ? 'bg-primary-container text-on-primary shadow-sm'
                                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Belum Hadir ({not_present_teachers.length})</span>
                    </button>
                </div>

                {/* 4. TAB CONTENTS */}
                {/* TAB 1: Photo Audit Grid */}
                {activeTab === 'photo_audit' && (
                    <div>
                        {photo_audits.length === 0 ? (
                            <div className="bg-surface-container-lowest p-12 rounded-2xl text-center border border-outline-variant/30 text-outline text-xs">
                                Belum ada swafoto presensi yang tercatat untuk tanggal {formatted_selected_date}.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {photo_audits.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedPhoto(item)}
                                        className="group relative bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/40 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                            <img
                                                src={item.photo_url}
                                                alt={item.user_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            <div className="absolute top-2 right-2">
                                                {getStatusBadge(item.status)}
                                            </div>
                                            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white">
                                                <div className="text-xs font-bold truncate">{item.user_name}</div>
                                                <div className="text-[10px] text-gray-300 flex items-center justify-between mt-0.5">
                                                    <span>{item.checkin_time} WIB</span>
                                                    <span>±{Math.round(item.accuracy || 0)}m</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: Tabel Presensi Hari Ini */}
                {activeTab === 'table' && (
                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-outline-variant/20 text-left text-xs">
                                <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="px-6 py-4">Nama Guru</th>
                                        <th className="px-6 py-4">Absen Masuk</th>
                                        <th className="px-6 py-4">Absen Pulang</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Akurasi GPS</th>
                                        {can_correct && <th className="px-6 py-4 text-right">Aksi TU</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                                    {attendances.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-outline">
                                                Belum ada data presensi pada tanggal ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        attendances.map((att) => (
                                            <tr key={att.id} className="hover:bg-surface-container/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-on-surface">{att.user?.name}</div>
                                                    <div className="text-[11px] text-outline">NIP: {att.user?.nip || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold">
                                                    {att.checkin_time ? (
                                                        <span>{att.checkin_time.substring(0, 5)} WIB</span>
                                                    ) : (
                                                        <span className="text-outline">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-semibold">
                                                    {att.checkout_time ? (
                                                        <span>{att.checkout_time.substring(0, 5)} WIB</span>
                                                    ) : (
                                                        <span className="text-outline">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(att.status)}
                                                    {att.is_manual_correction && (
                                                        <span className="ms-2 text-[10px] text-tertiary-container font-semibold bg-tertiary-fixed px-2 py-0.5 rounded-full">
                                                            Koreksi Manual
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-outline font-mono">
                                                    {att.checkin_accuracy ? `±${Math.round(att.checkin_accuracy)}m` : '-'}
                                                </td>
                                                {can_correct && (
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => openCorrectionModal(att)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-primary bg-primary-fixed hover:bg-primary-fixed-dim rounded-xl transition shadow-sm"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5 me-1" />
                                                            Koreksi
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: Guru Belum Hadir */}
                {activeTab === 'not_present' && (
                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-outline-variant/20 text-left text-xs">
                                <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="px-6 py-4">Nama Guru</th>
                                        <th className="px-6 py-4">Tipe Jadwal</th>
                                        <th className="px-6 py-4">Kontak</th>
                                        {can_correct && <th className="px-6 py-4 text-right">Aksi TU</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                                    {not_present_teachers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-secondary font-bold">
                                                Luar biasa! Seluruh dewan guru telah melakukan presensi hari ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        not_present_teachers.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-surface-container/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-on-surface">{teacher.name}</div>
                                                    <div className="text-[11px] text-outline">NIP: {teacher.nip || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface-variant">
                                                        {teacher.schedule_type === 'part_time' ? 'Guru Honorer' : 'Guru Tetap'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-outline font-mono">
                                                    {teacher.phone || '-'}
                                                </td>
                                                {can_correct && (
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => openCorrectionModal(teacher)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-primary bg-primary-fixed hover:bg-primary-fixed-dim rounded-xl transition shadow-sm"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5 me-1" />
                                                            Koreksi Hadir
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL PREVIEW FOTO SWAFOTO WATERMARK */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-outline-variant/30">
                        <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/20">
                            <div>
                                <h3 className="font-bold text-sm text-on-surface">{selectedPhoto.user_name}</h3>
                                <p className="text-[11px] text-outline">NIP: {selectedPhoto.user_nip}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="p-1 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-black/5 flex items-center justify-center">
                            <img
                                src={selectedPhoto.photo_url}
                                alt="Foto Presensi"
                                className="rounded-2xl max-h-[480px] object-contain shadow-md"
                            />
                        </div>

                        <div className="p-5 flex items-center justify-between text-xs bg-surface-container-lowest">
                            <div>
                                <div className="text-outline">Waktu Presensi:</div>
                                <div className="font-bold text-on-surface mt-0.5">
                                    Masuk: {selectedPhoto.checkin_time} WIB {selectedPhoto.checkout_time ? `• Pulang: ${selectedPhoto.checkout_time} WIB` : ''}
                                </div>
                            </div>
                            <div>
                                {getStatusBadge(selectedPhoto.status)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KOREKSI MANUAL (DENGAN AUDIT TRAIL MANDATORI) */}
            {correctionTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-outline-variant/30">
                        <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-on-surface">Koreksi Presensi Manual</h3>
                                <p className="text-[11px] text-outline">Target: {correctionTarget.name || correctionTarget.user?.name}</p>
                            </div>
                            <button
                                onClick={() => setCorrectionTarget(null)}
                                className="p-1 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCorrection} className="p-6 space-y-4 text-xs">
                            <div className="p-3 bg-tertiary-fixed/40 border border-tertiary-container/20 rounded-xl text-on-tertiary-fixed-variant text-[11px] flex items-start gap-2">
                                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-tertiary-container" />
                                <span>
                                    Setiap perubahan manual akan dicatat mandatori dalam log audit (*Audit Trail*) sistem untuk akuntabilitas.
                                </span>
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface mb-1">Status Kehadiran Baru</label>
                                <select
                                    value={correctData.status}
                                    onChange={(e) => setCorrectData('status', e.target.value)}
                                    className="w-full text-xs border-outline-variant/60 rounded-xl focus:ring-primary focus:border-primary"
                                >
                                    <option value="tepat_waktu">Tepat Waktu</option>
                                    <option value="terlambat">Terlambat</option>
                                    <option value="sakit">Sakit</option>
                                    <option value="izin">Izin</option>
                                    <option value="dinas_luar">Dinas Luar</option>
                                    <option value="alpa">Alpa</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface mb-1">Jam Absen Masuk</label>
                                <input
                                    type="time"
                                    value={correctData.checkin_time}
                                    onChange={(e) => setCorrectData('checkin_time', e.target.value)}
                                    className="w-full text-xs border-outline-variant/60 rounded-xl focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface mb-1">
                                    Alasan Koreksi Manual <span className="text-error">*Wajib</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={correctData.reason}
                                    onChange={(e) => setCorrectData('reason', e.target.value)}
                                    placeholder="Contoh: Guru hadir mengajar piket, namun HP kehabisan baterai."
                                    className="w-full text-xs border-outline-variant/60 rounded-xl focus:ring-primary focus:border-primary"
                                    required
                                />
                                {correctErrors.reason && (
                                    <p className="text-error mt-1">{correctErrors.reason}</p>
                                )}
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCorrectionTarget(null)}
                                    className="px-4 py-2 font-semibold text-outline hover:bg-surface-container rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={correcting}
                                    className="px-5 py-2 font-bold text-on-primary bg-primary hover:bg-primary-container rounded-xl shadow-md transition disabled:opacity-50"
                                >
                                    {correcting ? 'Menyimpan...' : 'Simpan Koreksi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
