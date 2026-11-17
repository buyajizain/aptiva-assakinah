import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    CalendarCheck, 
    Camera, 
    FileText, 
    Wallet, 
    Users, 
    ShieldAlert, 
    Settings, 
    LogOut, 
    Clock, 
    Cloud, 
    Menu, 
    X,
    School
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const formatted = new Intl.DateTimeFormat('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Jakarta',
            }).format(now);
            setCurrentDateTime(formatted.replace('.', ':') + ' WIB');
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const roleBadge = () => {
        switch (user.role) {
            case 'admin_tu':
                return { label: 'Admin Tata Usaha', bg: 'bg-primary-fixed text-on-primary-fixed' };
            case 'kepsek':
                return { label: 'Kepala Sekolah', bg: 'bg-purple-100 text-purple-800' };
            default:
                return { label: user.schedule_type === 'part_time' ? 'Guru Honorer' : 'Guru Tetap', bg: 'bg-secondary-container text-on-secondary-container' };
        }
    };

    const isCurrent = (name) => route().current(name);

    return (
        <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex flex-col">
            {/* BACKDROP MOBILE DRAWER */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden transition-opacity"
                />
            )}

            {/* SIDEBAR NAVIGATION (FIXED 288px) */}
            <aside className={`
                fixed top-0 bottom-0 left-0 w-72 bg-surface-container-low border-r border-outline-variant/30 z-50 
                flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col">
                    {/* Brand Header */}
                    <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-outline-variant/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md font-bold font-display text-lg tracking-wider">
                                AS
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display text-base text-primary leading-tight font-bold tracking-tight">
                                    Presensi Guru
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2 py-0.5 rounded">
                                        Yayasan As-Sakinah
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <div className="px-4 pt-6">
                        <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-outline font-display">
                            Menu Akademik & Tugas
                        </p>
                        <nav className="flex flex-col gap-1 text-xs">
                            {/* Dashboard Utama */}
                            {(user.role === 'admin_tu' || user.role === 'kepsek') && (
                                <Link
                                    href={route('dashboard')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('dashboard')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                                    <span>Dashboard Utama</span>
                                </Link>
                            )}

                            {/* Presensi Mandiri (Guru) */}
                            {user.role === 'guru' && (
                                <Link
                                    href={route('attendance.index')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('attendance.*')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <Camera className="w-4 h-4 flex-shrink-0" />
                                    <span>Presensi Mandiri</span>
                                </Link>
                            )}

                            {/* Log & Rekap Presensi (Admin / Kepsek) */}
                            {(user.role === 'admin_tu' || user.role === 'kepsek') && (
                                <Link
                                    href={route('admin.reports.index')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('admin.reports.*')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <CalendarCheck className="w-4 h-4 flex-shrink-0" />
                                    <span>Log & Rekap Presensi</span>
                                </Link>
                            )}

                            {/* Izin & Pengajuan Cuti (Guru: Form pengajuan, Admin: Persetujuan) */}
                            {user.role === 'guru' ? (
                                <Link
                                    href={route('leaves.index')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('leaves.*')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <FileText className="w-4 h-4 flex-shrink-0" />
                                    <span>Izin & Pengajuan Cuti</span>
                                </Link>
                            ) : (
                                <Link
                                    href={route('admin.leaves.index')}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('admin.leaves.*')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 flex-shrink-0" />
                                        <span>Persetujuan Izin & Cuti</span>
                                    </div>
                                </Link>
                            )}

                            {/* Rekapitulasi Gaji (Admin & Kepsek) */}
                            {(user.role === 'admin_tu' || user.role === 'kepsek') && (
                                <Link
                                    href={route('admin.payroll.index')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('admin.payroll.*')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <Wallet className="w-4 h-4 flex-shrink-0" />
                                    <span>Rekapitulasi Gaji</span>
                                </Link>
                            )}

                            {/* Manajemen Guru & Tendik (Admin TU) */}
                            {user.role === 'admin_tu' && (
                                <Link
                                    href={route('admin.teachers.index')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('admin.teachers.*')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <Users className="w-4 h-4 flex-shrink-0" />
                                    <span>Manajemen Guru</span>
                                </Link>
                            )}

                            {/* Audit Trail Koreksi (Admin TU) */}
                            {user.role === 'admin_tu' && (
                                <Link
                                    href={route('admin.attendance.audit-logs')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('admin.attendance.audit-logs')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                                    <span>Audit Trail</span>
                                </Link>
                            )}

                            {/* Pengaturan Sekolah (Admin TU) */}
                            {user.role === 'admin_tu' && (
                                <Link
                                    href={route('admin.settings.index')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isCurrent('admin.settings.*')
                                            ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                                    }`}
                                >
                                    <Settings className="w-4 h-4 flex-shrink-0" />
                                    <span>Pengaturan Sekolah</span>
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Bottom Card: Status Akademik */}
                <div className="p-4 border-t border-outline-variant/20 bg-surface-container/60 space-y-3">
                    <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 flex flex-col gap-1 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-on-surface-variant">Tahun Akademik</span>
                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        </div>
                        <p className="text-xs text-on-surface font-bold">Semester Ganjil TA 2026/2027</p>
                        <div className="flex items-center gap-1.5 pt-1 text-on-secondary-container text-[11px] font-semibold">
                            <Cloud className="w-3.5 h-3.5 text-secondary" />
                            <span>GPS Geofencing & Cloud Aktif</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-outline-variant/20 text-[10px] text-on-surface-variant">
                            <span>Sistem v2.4</span>
                            <span className="font-bold text-primary">Powered by Aptiva Digital</span>
                        </div>
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Sistem</span>
                    </Link>
                </div>
            </aside>

            {/* MAIN APP CONTAINER (OFFSET LEFT ON DESKTOP) */}
            <div className="lg:pl-72 flex flex-col min-h-screen">
                {/* STICKY TOP HEADER */}
                <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 z-40 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-xl text-on-surface text-xs font-semibold tabular-nums shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{currentDateTime || 'Memuat waktu...'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/40 px-3 py-1 rounded-xl text-on-surface text-xs font-semibold">
                            <School className="w-3.5 h-3.5 text-primary" />
                            <span>Yayasan As-Sakinah</span>
                        </div>

                        <div className="h-6 w-px bg-outline-variant/40 hidden sm:block" />

                        {/* User Profile Pill */}
                        <div className="flex items-center gap-2.5 pl-1">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-outline-variant/50">
                                {user.name.charAt(0)}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-bold text-on-surface leading-tight truncate max-w-[150px]">
                                    {user.name}
                                </span>
                                <span className="text-[10px] text-outline font-medium">
                                    {roleBadge().label}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* PAGE MAIN CONTENT */}
                <main className="pt-16 flex-1 bg-surface">
                    {children}
                </main>
            </div>
        </div>
    );
}
