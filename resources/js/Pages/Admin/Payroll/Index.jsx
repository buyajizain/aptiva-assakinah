import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    DollarSign, 
    FileSpreadsheet, 
    Printer, 
    Filter, 
    Settings, 
    Edit3, 
    CheckCircle2, 
    AlertTriangle,
    Wallet,
    Calendar,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    TrendingDown,
    X,
    FileText,
    ChevronRight,
    Coins,
    Banknote
} from 'lucide-react';

export default function PayrollIndex({ payroll, current_month, current_year, flash }) {
    const [month, setMonth] = useState(current_month);
    const [year, setYear] = useState(current_year);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const { data: editData, setData: setEditData, post: postEdit, processing: savingRate, errors: editErrors } = useForm({
        base_salary: 0,
        custom_daily_allowance: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.payroll.index'), { month, year }, { preserveState: true });
    };

    const openEditModal = (teacher) => {
        setSelectedTeacher(teacher);
        setEditData({
            base_salary: teacher.base_salary,
            custom_daily_allowance: teacher.daily_rate !== payroll.rates.daily_allowance ? teacher.daily_rate : '',
        });
    };

    const submitTeacherRate = (e) => {
        e.preventDefault();
        postEdit(route('admin.payroll.update-teacher', selectedTeacher.user_id), {
            onSuccess: () => setSelectedTeacher(null),
        });
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
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
            <Head title={`Rekap Gaji & Honorarium - ${payroll.month_name}`} />

            {/* Breadcrumb Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-outline mb-1 font-body">
                        <span>Aplikasi Presensi Guru</span>
                        <span>/</span>
                        <span>Keuangan & Penggajian</span>
                        <span>/</span>
                        <span className="text-primary font-bold">Rekap Bulanan</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
                        Rekapitulasi Gaji & Honorarium Guru
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                        Perhitungan otomatis berbasis kehadiran nyata periode: <span className="font-bold text-primary">{payroll.month_name} {current_year}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <a
                        href={route('admin.payroll.excel', { month, year })}
                        className="inline-flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-bold text-xs px-4 py-2.5 rounded-xl border border-outline-variant/50 transition shadow-sm"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Ekspor Excel</span>
                    </a>
                    <a
                        href={route('admin.payroll.pdf', { month, year })}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-container font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Laporan PDF</span>
                    </a>
                </div>
            </div>

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center shadow-sm">
                        <CheckCircle2 className="w-4 h-4 me-2 text-emerald-600 flex-shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* 4 Kartu Metrik Pengeluaran Gaji (Bento style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                            <span>Total Gaji Bersih (THP)</span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-headline font-extrabold text-on-surface mt-2 tabular-nums">
                            {formatRupiah(payroll.totals.total_net_salary)}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                            Akumulasi transfer untuk {payroll.teachers.length} guru
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                            <span>Total Gaji Pokok Dasar</span>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                <Banknote className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-headline font-extrabold text-on-surface mt-2 tabular-nums">
                            {formatRupiah(payroll.totals.total_base_salary)}
                        </div>
                        <div className="text-[11px] text-on-surface-variant/70 mt-1">
                            Akumulasi honor dasar tetap
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                            <span>Total Uang Hadir / Transport</span>
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-headline font-extrabold text-indigo-700 mt-2 tabular-nums">
                            {formatRupiah(payroll.totals.total_allowance)}
                        </div>
                        <div className="text-[11px] text-indigo-600 font-medium mt-1">
                            Dihitung dari hari hadir nyata
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                            <span>Total Denda & Potongan</span>
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-headline font-extrabold text-rose-600 mt-2 tabular-nums">
                            {formatRupiah(payroll.totals.total_deductions)}
                        </div>
                        <div className="text-[11px] text-rose-500 font-medium mt-1 tabular-nums">
                            Telat: {formatRupiah(payroll.totals.total_late_cut)} &bull; Alpa: {formatRupiah(payroll.totals.total_alpa_cut)}
                        </div>
                    </div>
                </div>

                {/* Filter Periode & Ringkasan Tarif Standar */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface">Bulan:</span>
                            <select
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface"
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
                                className="text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface"
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 font-bold text-white bg-primary rounded-xl hover:bg-primary-container transition flex items-center gap-1.5 shadow-sm"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Tampilkan Data
                        </button>
                    </form>

                    <div className="flex items-center gap-2 text-xs bg-surface-container-low border border-outline-variant/50 px-3.5 py-2 rounded-xl text-on-surface-variant">
                        <Settings className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="tabular-nums">
                            Tarif Default: Hadir <strong>{formatRupiah(payroll.rates.daily_allowance)}</strong> | Telat <strong>{formatRupiah(payroll.rates.late_cut_amount)}</strong> | Alpa <strong>{formatRupiah(payroll.rates.alpa_cut_amount)}</strong>
                        </span>
                    </div>
                </div>

                {/* Tabel Rekapitulasi Gaji Guru */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/40">
                                    <th className="px-4 py-3.5 text-center w-12">No</th>
                                    <th className="px-4 py-3.5">Nama Guru & NIP</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-right">Gaji Pokok</th>
                                    <th className="px-4 py-3.5 text-center">Kehadiran</th>
                                    <th className="px-4 py-3.5 text-right">Uang Hadir</th>
                                    <th className="px-4 py-3.5 text-right">Potongan Telat</th>
                                    <th className="px-4 py-3.5 text-right">Potongan Alpa</th>
                                    <th className="px-4 py-3.5 text-right font-extrabold text-emerald-800 bg-emerald-50/70">
                                        Gaji Bersih (THP)
                                    </th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-body">
                                {payroll.teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center text-on-surface-variant">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-outline/50" />
                                            Tidak ada data guru yang terdaftar pada sistem.
                                        </td>
                                    </tr>
                                ) : (
                                    payroll.teachers.map((t, idx) => (
                                        <tr key={t.user_id} className="hover:bg-surface-container-low/50 transition">
                                            <td className="px-4 py-3.5 text-center text-on-surface-variant tabular-nums font-mono">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-on-surface text-sm">{t.name}</div>
                                                <div className="text-[11px] text-on-surface-variant tabular-nums">NIP: {t.nip || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    t.schedule_type === 'part_time'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                    {t.schedule_type === 'part_time' ? 'Honorer' : 'Guru Tetap'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-semibold text-on-surface tabular-nums">
                                                {formatRupiah(t.base_salary)}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="font-bold text-on-surface tabular-nums">{t.present_days} Hari</div>
                                                <div className="text-[10px] text-on-surface-variant tabular-nums">
                                                    @{formatRupiah(t.daily_rate)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-semibold text-indigo-700 tabular-nums">
                                                {formatRupiah(t.total_allowance)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-rose-600 tabular-nums">
                                                {t.late_count > 0 ? (
                                                    <div>
                                                        <span className="font-semibold">-{formatRupiah(t.total_late_cut)}</span>
                                                        <div className="text-[10px] text-on-surface-variant">({t.late_count}x telat)</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-outline/40">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-rose-600 tabular-nums">
                                                {t.alpa_count > 0 ? (
                                                    <div>
                                                        <span className="font-semibold">-{formatRupiah(t.total_alpa_cut)}</span>
                                                        <div className="text-[10px] text-on-surface-variant">({t.alpa_count} hari)</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-outline/40">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-extrabold text-emerald-800 text-sm bg-emerald-50/50 tabular-nums">
                                                {formatRupiah(t.net_salary)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <a
                                                        href={route('admin.payroll.slip', { teacher: t.user_id, month, year })}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Cetak Slip Gaji PDF"
                                                        className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button
                                                        onClick={() => openEditModal(t)}
                                                        title="Atur Gaji Pokok & Tarif"
                                                        className="p-1.5 text-on-surface bg-surface-container-low hover:bg-surface-container rounded-lg border border-outline-variant/50 transition"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-surface-container-low font-bold text-on-surface border-t-2 border-outline-variant/40">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3.5 text-center font-headline">TOTAL KESELURUHAN</td>
                                    <td className="px-4 py-3.5 text-right tabular-nums">{formatRupiah(payroll.totals.total_base_salary)}</td>
                                    <td className="px-4 py-3.5 text-center">-</td>
                                    <td className="px-4 py-3.5 text-right text-indigo-700 tabular-nums">{formatRupiah(payroll.totals.total_allowance)}</td>
                                    <td className="px-4 py-3.5 text-right text-rose-600 tabular-nums">-{formatRupiah(payroll.totals.total_late_cut)}</td>
                                    <td className="px-4 py-3.5 text-right text-rose-600 tabular-nums">-{formatRupiah(payroll.totals.total_alpa_cut)}</td>
                                    <td className="px-4 py-3.5 text-right text-emerald-800 text-base font-extrabold bg-emerald-100 tabular-nums">
                                        {formatRupiah(payroll.totals.total_net_salary)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL ATUR GAJI POKOK & TARIF GURU */}
            {selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-outline-variant/30">
                        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
                            <div>
                                <h3 className="font-headline font-bold text-on-surface text-sm">
                                    Atur Gaji & Honor Guru
                                </h3>
                                <p className="text-xs text-on-surface-variant">{selectedTeacher.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTeacher(null)}
                                className="p-1 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitTeacherRate} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-on-surface mb-1">
                                    Gaji Pokok / Honor Tetap Bulanan (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.base_salary}
                                    onChange={(e) => setEditData('base_salary', parseInt(e.target.value, 10) || 0)}
                                    placeholder="Contoh: 3000000"
                                    className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface font-semibold tabular-nums"
                                />
                                <p className="text-[10px] text-on-surface-variant/70 mt-1">
                                    Bisa diisi Rp 0 jika guru honorer murni dibayar per hari hadir.
                                </p>
                                {editErrors.base_salary && (
                                    <p className="text-rose-600 mt-1 font-semibold">{editErrors.base_salary}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface mb-1">
                                    Tarif Khusus Uang Hadir / Transport (Rp/Hari)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.custom_daily_allowance}
                                    onChange={(e) => setEditData('custom_daily_allowance', e.target.value)}
                                    placeholder={`Default sekolah: ${payroll.rates.daily_allowance}`}
                                    className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface font-semibold tabular-nums"
                                />
                                <p className="text-[10px] text-on-surface-variant/70 mt-1">
                                    Kosongkan jika ingin mengikuti tarif standar sekolah ({formatRupiah(payroll.rates.daily_allowance)}/hari).
                                </p>
                                {editErrors.custom_daily_allowance && (
                                    <p className="text-rose-600 mt-1 font-semibold">{editErrors.custom_daily_allowance}</p>
                                )}
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-outline-variant/30">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTeacher(null)}
                                    className="px-4 py-2 font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingRate}
                                    className="px-5 py-2 font-bold text-white bg-primary hover:bg-primary-container rounded-xl shadow-sm transition disabled:opacity-50"
                                >
                                    {savingRate ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
