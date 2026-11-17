import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    FileSpreadsheet, 
    Printer, 
    Filter, 
    CheckCircle2, 
    Clock, 
    AlertTriangle,
    BadgeAlert,
    ChevronRight,
    Users,
    Table,
    FileText
} from 'lucide-react';

export default function ReportsIndex({ report, current_month, current_year }) {
    const [month, setMonth] = useState(current_month);
    const [year, setYear] = useState(current_year);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.reports.index'), { month, year }, { preserveState: true });
    };

    const months = [
        { id: 1, name: 'Januari' },
        { id: 2, name: 'Februari' },
        { id: 3, name: 'Maret' },
        { id: 4, name: 'April' },
        { id: 5, name: 'Mei' },
        { id: 6, name: 'Juni' },
        { id: 7, name: 'Juli' },
        { id: 8, name: 'Agustus' },
        { id: 9, name: 'September' },
        { id: 10, name: 'Oktober' },
        { id: 11, name: 'November' },
        { id: 12, name: 'Desember' },
    ];

    const years = [2024, 2025, 2026, 2027];

    return (
        <AuthenticatedLayout>
            <Head title={`Log & Rekap Presensi - ${report.month_name}`} />

            <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 max-w-full mx-auto gap-6">
                {/* Header Context Section with Breadcrumb */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1 font-display">
                            <span>Sistem Akademik</span>
                            <ChevronRight className="w-3.5 h-3.5 text-outline" />
                            <span>Presensi Pendidik</span>
                            <ChevronRight className="w-3.5 h-3.5 text-outline" />
                            <span className="text-primary font-extrabold">Rekapitulasi Bulanan</span>
                        </div>
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                            Log & Rekapitulasi Presensi Dewan Guru
                        </h1>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                            Matriks presensi harian tanggal 1 s/d {report.days_in_month} periode: <span className="font-bold text-primary">{report.month_name}</span>
                        </p>
                    </div>

                    {/* Action CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <a
                            href={route('admin.reports.excel', { month, year })}
                            className="inline-flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm border border-outline-variant/30 transition"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-secondary" />
                            <span>Ekspor XLSX</span>
                        </a>
                        <a
                            href={route('admin.reports.pdf', { month, year })}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-primary text-on-primary hover:bg-primary-container font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak PDF Rekap</span>
                        </a>
                    </div>
                </div>

                {/* Quick Stats Bento Overview (Stitch Design) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-outline">
                            <span className="text-[11px] font-bold uppercase tracking-wider font-display">Total Guru</span>
                            <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-display text-2xl font-black text-on-surface tabular-nums">
                                {report.teachers_matrix.length}
                            </span>
                            <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-bold">
                                100% Terdaftar
                            </span>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-secondary">
                            <span className="text-[11px] font-bold uppercase tracking-wider font-display text-outline">Tepat Waktu</span>
                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-display text-2xl font-black text-secondary tabular-nums">
                                {report.totals.tepat_waktu}
                            </span>
                            <span className="text-[10px] text-secondary bg-secondary-container/40 px-2 py-0.5 rounded font-bold">
                                Hadir Pagi
                            </span>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-tertiary-container">
                            <span className="text-[11px] font-bold uppercase tracking-wider font-display text-outline">Terlambat</span>
                            <Clock className="w-4 h-4 text-tertiary-container" />
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-display text-2xl font-black text-on-tertiary-fixed-variant tabular-nums">
                                {report.totals.terlambat}
                            </span>
                            <span className="text-[10px] text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded font-bold">
                                Toleransi 07:15
                            </span>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-primary">
                            <span className="text-[11px] font-bold uppercase tracking-wider font-display text-outline">Izin & Sakit</span>
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-display text-2xl font-black text-primary-container tabular-nums">
                                {report.totals.sakit + report.totals.izin + report.totals.dinas_luar}
                            </span>
                            <span className="text-[10px] text-primary-container bg-primary-fixed px-2 py-0.5 rounded font-bold">
                                Surat Valid
                            </span>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between col-span-2 md:col-span-4 lg:col-span-1">
                        <div className="flex items-center justify-between text-error">
                            <span className="text-[11px] font-bold uppercase tracking-wider font-display text-outline">Alpa</span>
                            <AlertTriangle className="w-4 h-4 text-error" />
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-display text-2xl font-black text-error tabular-nums">
                                {report.totals.alpa}
                            </span>
                            <span className="text-[10px] text-error bg-error-container px-2 py-0.5 rounded font-bold">
                                Mangkir
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter Control Bar */}
                <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface">Pilih Bulan:</span>
                            <select
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="text-xs border-outline-variant/60 rounded-xl focus:ring-primary focus:border-primary"
                            >
                                {months.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface">Tahun:</span>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="text-xs border-outline-variant/60 rounded-xl focus:ring-primary focus:border-primary"
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 font-bold text-on-primary bg-primary rounded-xl hover:bg-primary-container transition flex items-center gap-1.5 shadow-sm"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Tampilkan Data
                        </button>
                    </form>

                    <div className="flex items-center gap-2 text-[11px] text-outline font-medium">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> H = Hadir</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> T = Telat</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> S/I/D = Izin/Sakit</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> A = Alpa</span>
                    </div>
                </div>

                {/* Tabel Matriks Harian (1 s/d N) */}
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-left text-[11px]">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant font-bold uppercase border-b border-outline-variant/30">
                                    <th rowSpan="2" className="px-3 py-3 border-r border-outline-variant/30 text-center w-10">No</th>
                                    <th rowSpan="2" className="px-4 py-3 border-r border-outline-variant/30 min-w-[170px] sticky left-0 bg-surface-container-low z-10 shadow-[2px_0_4px_rgba(0,0,0,0.03)]">
                                        Nama Guru & NIP
                                    </th>
                                    <th colSpan={report.days_in_month} className="px-2 py-2 text-center border-b border-outline-variant/30 bg-surface-container/60 font-display">
                                        Tanggal ({report.month_name})
                                    </th>
                                    <th colSpan="7" className="px-2 py-2 text-center border-b border-outline-variant/30 bg-primary-fixed/40 text-on-primary-fixed font-display">
                                        Rekapitulasi Kehadiran
                                    </th>
                                    <th rowSpan="2" className="px-3 py-3 text-center bg-surface-container-low w-14 font-display">%</th>
                                </tr>
                                <tr className="bg-surface-container-lowest text-outline font-semibold border-b border-outline-variant/30">
                                    {/* Kolom Tanggal 1..N */}
                                    {Object.values(report.dates_info).map((date) => (
                                        <th
                                            key={date.day}
                                            className={`p-1 text-center w-7 border-r border-outline-variant/20 ${
                                                date.is_weekend || date.is_holiday ? 'bg-red-50/70 text-red-700' : ''
                                            }`}
                                        >
                                            <div className="font-bold">{date.day}</div>
                                            <div className="text-[9px] font-normal">{date.day_name}</div>
                                        </th>
                                    ))}

                                    {/* Kolom Agregat Total */}
                                    <th className="p-1 text-center font-bold text-secondary bg-secondary-container/30 w-8" title="Hadir Tepat Waktu">H</th>
                                    <th className="p-1 text-center font-bold text-tertiary-container bg-tertiary-fixed/40 w-8" title="Terlambat">T</th>
                                    <th className="p-1 text-center font-bold text-blue-800 bg-blue-50 w-8" title="Sakit">S</th>
                                    <th className="p-1 text-center font-bold text-indigo-800 bg-indigo-50 w-8" title="Izin">I</th>
                                    <th className="p-1 text-center font-bold text-purple-800 bg-purple-50 w-8" title="Dinas Luar">D</th>
                                    <th className="p-1 text-center font-bold text-amber-900 bg-amber-50 w-9" title="Hadir Tanpa Absen Pulang">HT</th>
                                    <th className="p-1 text-center font-bold text-error bg-error-container/40 w-8" title="Alpa / Mangkir">A</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                                {report.teachers_matrix.length === 0 ? (
                                    <tr>
                                        <td colSpan={report.days_in_month + 10} className="px-6 py-8 text-center text-outline">
                                            Tidak ada data guru yang terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    report.teachers_matrix.map((row, idx) => (
                                        <tr key={row.user_id} className="hover:bg-surface-container/50 transition">
                                            <td className="px-3 py-2 text-center border-r border-outline-variant/20 text-outline font-mono">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-2 border-r border-outline-variant/20 sticky left-0 bg-surface-container-lowest z-10 shadow-[2px_0_4px_rgba(0,0,0,0.03)]">
                                                <div className="font-bold text-on-surface truncate max-w-[190px]">{row.name}</div>
                                                <div className="text-[10px] text-outline">NIP: {row.nip}</div>
                                            </td>

                                            {/* Cell Kode Hari 1..N */}
                                            {Object.values(report.dates_info).map((date) => {
                                                const code = row.days[date.day];
                                                const isOff = (date.is_weekend || date.is_holiday) && code === '-';

                                                return (
                                                    <td
                                                        key={date.day}
                                                        className={`p-1 text-center border-r border-outline-variant/15 ${
                                                            isOff ? 'bg-red-50/40 text-red-300' : ''
                                                        } ${
                                                            code === 'H' ? 'font-bold text-secondary' :
                                                            code === 'T' ? 'font-bold text-tertiary-container' :
                                                            code === 'S' ? 'font-bold text-blue-600' :
                                                            code === 'I' ? 'font-bold text-indigo-600' :
                                                            code === 'D' ? 'font-bold text-purple-700' :
                                                            code === 'A' ? 'font-bold text-error bg-error-container/30' : 'text-outline/40'
                                                        }`}
                                                    >
                                                        {code}
                                                    </td>
                                                );
                                            })}

                                            {/* Rekap Kolom Total */}
                                            <td className="p-1 text-center font-bold text-secondary bg-secondary-container/20">
                                                {row.counts.tepat_waktu}
                                            </td>
                                            <td className="p-1 text-center font-bold text-tertiary-container bg-tertiary-fixed/30">
                                                {row.counts.terlambat}
                                            </td>
                                            <td className="p-1 text-center font-semibold text-blue-700">
                                                {row.counts.sakit}
                                            </td>
                                            <td className="p-1 text-center font-semibold text-indigo-700">
                                                {row.counts.izin}
                                            </td>
                                            <td className="p-1 text-center font-semibold text-purple-700">
                                                {row.counts.dinas_luar}
                                            </td>
                                            <td className="p-1 text-center font-semibold text-amber-900">
                                                {row.counts.htap}
                                            </td>
                                            <td className="p-1 text-center font-bold text-error bg-error-container/30">
                                                {row.counts.alpa}
                                            </td>
                                            <td className="p-1 text-center font-bold text-primary bg-primary-fixed/30 font-display">
                                                {row.attendance_rate}%
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
