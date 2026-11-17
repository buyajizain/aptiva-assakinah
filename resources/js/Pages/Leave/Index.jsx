import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Calendar, 
    FileText, 
    Upload, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Plus, 
    FileCheck, 
    ChevronRight,
    ExternalLink,
    X,
    ShieldCheck,
    CalendarDays,
    FileSpreadsheet
} from 'lucide-react';

export default function LeaveIndex({ leaves, flash }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [uploadModalLeave, setUploadModalLeave] = useState(null);

    const leaveList = leaves?.data || (Array.isArray(leaves) ? leaves : []);
    const totalLeaves = leaves?.total ?? leaveList.length;

    // Form Pengajuan Baru
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'sakit',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
        attachment: null,
    });

    // Form Upload Susulan
    const { data: uploadData, setData: setUploadData, post: postUpload, processing: uploading, errors: uploadErrors, reset: resetUpload } = useForm({
        attachment: null,
    });

    const submitLeave = (e) => {
        e.preventDefault();
        post(route('leaves.store'), {
            onSuccess: () => {
                setIsFormOpen(false);
                reset();
            },
        });
    };

    const submitFollowupUpload = (e) => {
        e.preventDefault();
        if (!uploadModalLeave) return;

        postUpload(route('leaves.upload-attachment', uploadModalLeave.id), {
            onSuccess: () => {
                setUploadModalLeave(null);
                resetUpload();
            },
        });
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'sakit':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Sakit</span>;
            case 'dinas_luar':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Dinas Luar</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Izin</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Ditolak
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Menunggu Tindakan
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengajuan Izin & Sakit Guru" />

            <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto gap-6">
                {/* Header Context Section with Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-outline mb-1 font-body">
                            <span>Aplikasi Presensi Guru</span>
                            <span>/</span>
                            <span className="text-primary font-bold">Portal Mandiri Guru</span>
                        </div>
                        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                            Permohonan Izin, Sakit & Cuti
                        </h1>
                        <p className="text-sm text-on-surface-variant mt-0.5">
                            Kirim pengajuan ketidakhadiran mandiri, unggah surat keterangan dokter/dinas, dan pantau persetujuan Kepala Sekolah.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl shadow-sm transition self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Pengajuan Baru</span>
                    </button>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center shadow-sm">
                        <CheckCircle2 className="w-4 h-4 me-2 text-emerald-600 flex-shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-center shadow-sm">
                        <AlertCircle className="w-4 h-4 me-2 text-rose-600 flex-shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* Daftar Riwayat Pengajuan Cuti */}
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/40 overflow-hidden">
                    <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40">
                        <h3 className="font-headline font-bold text-sm text-on-surface">
                            Riwayat Permohonan Anda
                        </h3>
                        <span className="text-xs text-on-surface-variant font-medium tabular-nums">
                            Total: {totalLeaves} Pengajuan
                        </span>
                    </div>

                    <div className="divide-y divide-outline-variant/20">
                        {leaveList.length === 0 ? (
                            <div className="p-12 text-center text-on-surface-variant text-xs">
                                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-outline/50" />
                                Anda belum memiliki riwayat permohonan izin atau sakit.
                            </div>
                        ) : (
                            leaveList.map((leave) => {
                                const attachment = leave.attachment_path || leave.document_path;
                                return (
                                    <div key={leave.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/40 transition">
                                        <div className="space-y-1.5 max-w-xl">
                                            <div className="flex items-center gap-2">
                                                {getTypeBadge(leave.type)}
                                                <span className="font-bold text-on-surface text-xs tabular-nums">
                                                    {leave.start_date} s/d {leave.end_date}
                                                </span>
                                            </div>
                                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                                {leave.reason}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-outline pt-1">
                                                <span className="tabular-nums">Diajukan: {leave.created_at ? leave.created_at.substring(0, 10) : '-'}</span>
                                                {attachment ? (
                                                    <a
                                                        href={`/storage/${attachment}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        Lihat Dokumen
                                                    </a>
                                                ) : (
                                                    <button
                                                        onClick={() => setUploadModalLeave(leave)}
                                                        className="inline-flex items-center gap-1 text-amber-700 hover:underline font-bold"
                                                    >
                                                        <Upload className="w-3.5 h-3.5" />
                                                        Unggah Surat Susulan
                                                    </button>
                                                )}
                                                {leave.approver && (
                                                    <span className="text-on-surface-variant">
                                                        Diproses oleh: <strong>{leave.approver.name}</strong>
                                                    </span>
                                                )}
                                            </div>
                                            {leave.rejection_note && (
                                                <div className="text-[11px] text-rose-600 font-medium italic pt-1">
                                                    Catatan penolakan: {leave.rejection_note}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                            {getStatusBadge(leave.status)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {leaves?.links && leaves.links.length > 3 && (
                        <div className="px-5 py-3.5 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30">
                            <div className="text-xs text-on-surface-variant font-medium tabular-nums">
                                Menampilkan {leaves.from || 0} - {leaves.to || 0} dari {leaves.total} data
                            </div>
                            <div className="flex gap-1">
                                {leaves.links.map((link, idx) => (
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

            {/* MODAL FORM PENGAJUAN BARU */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-outline-variant/30">
                        <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                            <h3 className="font-headline font-bold text-sm text-on-surface">Buat Permohonan Izin / Sakit</h3>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="p-1 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitLeave} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-on-surface mb-1.5">Jenis Permohonan</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface"
                                >
                                    <option value="sakit">Sakit (Lampirkan Surat Keterangan Dokter)</option>
                                    <option value="izin">Izin Kepentingan Pribadi / Mendesak</option>
                                    <option value="dinas_luar">Dinas Luar / Penugasan Pelatihan</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-on-surface mb-1.5">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface tabular-nums"
                                    />
                                    {errors.start_date && <p className="text-rose-600 mt-1 font-semibold">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-on-surface mb-1.5">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface tabular-nums"
                                    />
                                    {errors.end_date && <p className="text-rose-600 mt-1 font-semibold">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface mb-1.5">Alasan Permohonan</label>
                                <textarea
                                    rows="3"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Jelaskan alasan izin atau sakit secara singkat dan jelas..."
                                    className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface"
                                    required
                                />
                                {errors.reason && <p className="text-rose-600 mt-1 font-semibold">{errors.reason}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface mb-1.5">
                                    Dokumen Pendukung <span className="text-outline font-normal">(PDF / JPG / PNG max 5MB)</span>
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setData('attachment', e.target.files[0])}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full text-xs text-on-surface-variant file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border border-outline-variant/60 rounded-xl cursor-pointer"
                                />
                                {errors.attachment && <p className="text-rose-600 mt-1 font-semibold">{errors.attachment}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 font-bold text-white bg-primary hover:bg-primary-container rounded-xl shadow-sm transition disabled:opacity-50"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Permohonan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL UPLOAD SUSULAN */}
            {uploadModalLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-outline-variant/30">
                        <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                            <h3 className="font-headline font-bold text-sm text-on-surface">Unggah Dokumen Susulan</h3>
                            <button
                                onClick={() => setUploadModalLeave(null)}
                                className="p-1 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitFollowupUpload} className="p-6 space-y-4 text-xs">
                            <p className="text-on-surface-variant">
                                Unggah surat keterangan dokter atau berkas dinas resmi untuk permohonan tanggal <strong className="tabular-nums text-on-surface">{uploadModalLeave.start_date}</strong>:
                            </p>

                            <input
                                type="file"
                                onChange={(e) => setUploadData('attachment', e.target.files[0])}
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                                className="w-full text-xs text-on-surface-variant file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border border-outline-variant/60 rounded-xl cursor-pointer"
                            />
                            {uploadErrors.attachment && <p className="text-rose-600 mt-1 font-semibold">{uploadErrors.attachment}</p>}

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                                <button
                                    type="button"
                                    onClick={() => setUploadModalLeave(null)}
                                    className="px-4 py-2 font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-5 py-2 font-bold text-white bg-primary hover:bg-primary-container rounded-xl shadow-sm transition disabled:opacity-50"
                                >
                                    {uploading ? 'Mengunggah...' : 'Simpan Dokumen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
