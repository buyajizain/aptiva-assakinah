import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LocationPickerMap from '@/Components/LocationPickerMap';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Settings, 
    MapPin, 
    Clock, 
    Calendar, 
    Users, 
    CheckCircle2, 
    Trash2, 
    Plus,
    Save,
    Banknote,
    SlidersHorizontal,
    Info,
    CalendarDays
} from 'lucide-react';

export default function SchoolSettingsIndex({ setting, holidays, part_time_teachers, flash }) {
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'holidays' | 'schedules'

    // Form Pengaturan Sekolah
    const { data: settingData, setData: setSettingData, put: putSetting, processing: savingSetting, errors: settingErrors } = useForm({
        school_name: setting.school_name || '',
        latitude: setting.latitude || -6.2,
        longitude: setting.longitude || 106.8,
        radius_meters: setting.radius_meters || 100,
        max_gps_accuracy: setting.max_gps_accuracy || 300,
        work_days: setting.work_days || 6,
        checkin_start: setting.checkin_start || '06:00:00',
        checkin_limit: setting.checkin_limit || '07:15:00',
        checkout_start: setting.checkout_start || '13:00:00',
        timezone: setting.timezone || 'Asia/Jakarta',
        daily_allowance: setting.daily_allowance ?? 50000,
        late_cut_amount: setting.late_cut_amount ?? 10000,
        alpa_cut_amount: setting.alpa_cut_amount ?? 50000,
    });

    // Form Tambah Libur
    const { data: holidayData, setData: setHolidayData, post: postHoliday, processing: savingHoliday, errors: holidayErrors, reset: resetHoliday } = useForm({
        holiday_date: '',
        description: '',
    });

    const submitSetting = (e) => {
        e.preventDefault();
        putSetting(route('admin.settings.update'));
    };

    const submitHoliday = (e) => {
        e.preventDefault();
        postHoliday(route('admin.settings.holiday.store'), {
            onSuccess: () => resetHoliday(),
        });
    };

    const deleteHoliday = (id) => {
        if (confirm('Yakin ingin menghapus hari libur ini?')) {
            router.delete(route('admin.settings.holiday.destroy', id));
        }
    };

    const updateTeacherDay = (teacher, day, isChecked) => {
        const currentDays = teacher.teacher_schedules
            ? teacher.teacher_schedules.map(s => s.day_of_week)
            : [];
        let newDays = isChecked
            ? [...currentDays, day]
            : currentDays.filter(d => d !== day);

        router.post(route('admin.settings.schedule.update', teacher.id), {
            days: newDays,
        }, { preserveScroll: true });
    };

    const dayLabels = [
        { id: 1, name: 'Senin' },
        { id: 2, name: 'Selasa' },
        { id: 3, name: 'Rabu' },
        { id: 4, name: 'Kamis' },
        { id: 5, name: 'Jumat' },
        { id: 6, name: 'Sabtu' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Sekolah & Operasional Presensi" />

            {/* Breadcrumb Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-outline mb-1 font-body">
                        <span>Aplikasi Presensi Guru</span>
                        <span>/</span>
                        <span className="text-primary font-bold">Konfigurasi Sistem</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
                        Pengaturan Sekolah & Kehadiran
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                        Konfigurasi koordinat geofence, toleransi radius GPS, jam operasional, hari libur, dan tarif penggajian.
                    </p>
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

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-3">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                            activeTab === 'general'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/50'
                        }`}
                    >
                        <Settings className="w-3.5 h-3.5" />
                        Geofence & Jam Kerja
                    </button>
                    <button
                        onClick={() => setActiveTab('holidays')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                            activeTab === 'holidays'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/50'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        Kalender Hari Libur
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 tabular-nums">
                            {holidays.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                            activeTab === 'schedules'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/50'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        Jadwal Guru Honorer
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 tabular-nums">
                            {part_time_teachers.length}
                        </span>
                    </button>
                </div>

                {/* TAB 1: Lokasi & Jam Kerja */}
                {activeTab === 'general' && (
                    <form onSubmit={submitSetting} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-6 text-xs">
                        <div>
                            <label className="block font-bold text-on-surface mb-1.5 text-xs">
                                Nama Resmi Institusi / Sekolah
                            </label>
                            <input
                                type="text"
                                value={settingData.school_name}
                                onChange={(e) => setSettingData('school_name', e.target.value)}
                                className="w-full text-xs border border-outline-variant/60 rounded-xl px-3.5 py-2.5 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            {settingErrors.school_name && <p className="text-rose-600 mt-1 font-semibold">{settingErrors.school_name}</p>}
                        </div>

                        <div className="border-t border-outline-variant/30 pt-5 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <h4 className="font-headline font-bold text-on-surface text-sm flex items-center">
                                    <MapPin className="w-4 h-4 me-1.5 text-primary" />
                                    Peta Lokasi & Titik Koordinat Geofencing
                                </h4>
                                <span className="text-[11px] text-on-surface-variant font-medium">
                                    Klik atau geser pin marker di peta untuk menetapkan koordinat gerbang utama
                                </span>
                            </div>

                            {/* Peta Interaktif Leaflet */}
                            <LocationPickerMap
                                latitude={settingData.latitude}
                                longitude={settingData.longitude}
                                radiusMeters={settingData.radius_meters}
                                onLocationChange={(lat, lng) => {
                                    setSettingData((prev) => ({
                                        ...prev,
                                        latitude: parseFloat(lat.toFixed(7)),
                                        longitude: parseFloat(lng.toFixed(7)),
                                    }));
                                }}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={settingData.latitude}
                                        onChange={(e) => setSettingData('latitude', parseFloat(e.target.value) || e.target.value)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums font-mono"
                                    />
                                    {settingErrors.latitude && <p className="text-rose-600 mt-1 font-semibold">{settingErrors.latitude}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={settingData.longitude}
                                        onChange={(e) => setSettingData('longitude', parseFloat(e.target.value) || e.target.value)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums font-mono"
                                    />
                                    {settingErrors.longitude && <p className="text-rose-600 mt-1 font-semibold">{settingErrors.longitude}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">Radius Geofence (Meter)</label>
                                    <input
                                        type="number"
                                        value={settingData.radius_meters}
                                        onChange={(e) => setSettingData('radius_meters', parseInt(e.target.value, 10) || e.target.value)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums"
                                    />
                                    {settingErrors.radius_meters && <p className="text-rose-600 mt-1 font-semibold">{settingErrors.radius_meters}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">Batas Akurasi GPS (Meter)</label>
                                    <input
                                        type="number"
                                        value={settingData.max_gps_accuracy}
                                        onChange={(e) => setSettingData('max_gps_accuracy', parseInt(e.target.value, 10) || e.target.value)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums"
                                    />
                                    <p className="text-[10px] text-on-surface-variant/70 mt-1">Disarankan 250-500m jika guru presensi di dalam gedung.</p>
                                    {settingErrors.max_gps_accuracy && <p className="text-rose-600 mt-1 font-semibold">{settingErrors.max_gps_accuracy}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-outline-variant/30 pt-5">
                            <h4 className="font-headline font-bold text-on-surface text-sm mb-3 flex items-center">
                                <Clock className="w-4 h-4 me-1.5 text-primary" />
                                Batasan Jam Masuk & Jam Pulang
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">Batas Jam Masuk (Tepat Waktu)</label>
                                    <input
                                        type="time"
                                        value={settingData.checkin_limit.substring(0, 5)}
                                        onChange={(e) => setSettingData('checkin_limit', e.target.value + ':00')}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums"
                                    />
                                    <p className="text-[10px] text-on-surface-variant/70 mt-1">Lewat dari waktu ini akan dicatat status 'Terlambat'.</p>
                                </div>
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">Jam Buka Absen Pulang</label>
                                    <input
                                        type="time"
                                        value={settingData.checkout_start.substring(0, 5)}
                                        onChange={(e) => setSettingData('checkout_start', e.target.value + ':00')}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums"
                                    />
                                    <p className="text-[10px] text-on-surface-variant/70 mt-1">Guru baru dapat merekam checkout setelah jam ini.</p>
                                </div>
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">Hari Kerja Operasional</label>
                                    <select
                                        value={settingData.work_days}
                                        onChange={(e) => setSettingData('work_days', e.target.value)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest"
                                    >
                                        <option value="6">6 Hari Kerja (Senin s/d Sabtu)</option>
                                        <option value="5">5 Hari Kerja (Senin s/d Jumat)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-outline-variant/30 pt-5">
                            <h4 className="font-headline font-bold text-on-surface text-sm mb-3 flex items-center">
                                <Banknote className="w-4 h-4 me-1.5 text-primary" />
                                Tarif Standar Penggajian & Honorarium Kehadiran
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">
                                        Uang Hadir / Transport Harian (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settingData.daily_allowance}
                                        onChange={(e) => setSettingData('daily_allowance', parseInt(e.target.value, 10) || 0)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums"
                                    />
                                    <p className="text-[10px] text-on-surface-variant/70 mt-1">Dikalikan dengan total hari hadir valid guru.</p>
                                    {settingErrors.daily_allowance && <p className="text-rose-600 mt-1 font-semibold">{settingErrors.daily_allowance}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">
                                        Denda Keterlambatan (Rp/Kejadian)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settingData.late_cut_amount}
                                        onChange={(e) => setSettingData('late_cut_amount', parseInt(e.target.value, 10) || 0)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums"
                                    />
                                    <p className="text-[10px] text-on-surface-variant/70 mt-1">Dipotong setiap kali guru absen masuk terlambat.</p>
                                    {settingErrors.late_cut_amount && <p className="text-rose-600 mt-1 font-semibold">{settingErrors.late_cut_amount}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-on-surface-variant mb-1">
                                        Potongan Alpa / Mangkir (Rp/Hari)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settingData.alpa_cut_amount}
                                        onChange={(e) => setSettingData('alpa_cut_amount', parseInt(e.target.value, 10) || 0)}
                                        className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums"
                                    />
                                    <p className="text-[10px] text-on-surface-variant/70 mt-1">Dipotong per hari tidak hadir tanpa surat izin.</p>
                                    {settingErrors.alpa_cut_amount && <p className="text-rose-600 mt-1 font-semibold">{settingErrors.alpa_cut_amount}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-outline-variant/30">
                            <button
                                type="submit"
                                disabled={savingSetting}
                                className="px-5 py-2.5 font-bold text-white bg-primary hover:bg-primary-container rounded-xl shadow-sm transition flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {savingSetting ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB 2: Kalender Hari Libur */}
                {activeTab === 'holidays' && (
                    <div className="space-y-4">
                        <form onSubmit={submitHoliday} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col sm:flex-row gap-3 items-end text-xs">
                            <div className="w-full sm:w-1/3">
                                <label className="block font-bold text-on-surface mb-1.5">Tanggal Libur</label>
                                <input
                                    type="date"
                                    value={holidayData.holiday_date}
                                    onChange={(e) => setHolidayData('holiday_date', e.target.value)}
                                    className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest tabular-nums"
                                    required
                                />
                            </div>
                            <div className="w-full sm:w-1/2">
                                <label className="block font-bold text-on-surface mb-1.5">Keterangan Libur Nasional / Khusus</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Hari Kemerdekaan RI / Libur Awal Ramadhan"
                                    value={holidayData.description}
                                    onChange={(e) => setHolidayData('description', e.target.value)}
                                    className="w-full text-xs border border-outline-variant/60 rounded-xl px-3 py-2 bg-surface-container-lowest"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={savingHoliday}
                                className="w-full sm:w-auto px-5 py-2.5 font-bold text-white bg-primary hover:bg-primary-container rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Hari Libur
                            </button>
                        </form>

                        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/40">
                                        <th className="px-5 py-3.5">Tanggal Libur</th>
                                        <th className="px-5 py-3.5">Deskripsi / Keterangan</th>
                                        <th className="px-5 py-3.5 text-right">Opsi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20 font-body">
                                    {holidays.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-10 text-center text-on-surface-variant">
                                                <CalendarDays className="w-7 h-7 mx-auto mb-2 text-outline/50" />
                                                Belum ada hari libur khusus yang ditambahkan ke kalender.
                                            </td>
                                        </tr>
                                    ) : (
                                        holidays.map((h) => (
                                            <tr key={h.id} className="hover:bg-surface-container-low/50 transition">
                                                <td className="px-5 py-3.5 font-bold text-on-surface tabular-nums">{h.holiday_date}</td>
                                                <td className="px-5 py-3.5 text-on-surface">{h.description}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <button
                                                        onClick={() => deleteHoliday(h.id)}
                                                        className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition"
                                                        title="Hapus hari libur"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: Jadwal Guru Honorer */}
                {activeTab === 'schedules' && (
                    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4 text-xs">
                        <div className="border-b border-outline-variant/30 pb-3">
                            <h4 className="font-headline font-bold text-on-surface text-sm">
                                Jadwal Kehadiran Guru Honorer / Paruh Waktu
                            </h4>
                            <p className="text-on-surface-variant text-xs mt-0.5">
                                Tentukan hari mengajar guru honorer. Pada hari yang tidak dicentang, guru tidak akan dihitung sebagai Alpa/Mangkir.
                            </p>
                        </div>

                        {part_time_teachers.length === 0 ? (
                            <div className="py-10 text-center text-on-surface-variant">
                                <Users className="w-7 h-7 mx-auto mb-2 text-outline/50" />
                                Tidak ada akun guru dengan tipe penugasan 'Honorer / Jam Khusus'.
                            </div>
                        ) : (
                            <div className="divide-y divide-outline-variant/20">
                                {part_time_teachers.map((teacher) => {
                                    const activeDays = teacher.teacher_schedules
                                        ? teacher.teacher_schedules.map(s => s.day_of_week)
                                        : [];

                                    return (
                                        <div key={teacher.id} className="py-4 space-y-2">
                                            <div className="font-bold text-on-surface text-sm">{teacher.name}</div>
                                            <div className="text-on-surface-variant text-[11px] mb-2 tabular-nums">NIP: {teacher.nip || '-'}</div>

                                            <div className="flex flex-wrap gap-2.5">
                                                {dayLabels.map((d) => {
                                                    const isChecked = activeDays.includes(d.id);
                                                    return (
                                                        <label
                                                            key={d.id}
                                                            className={`flex items-center px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                                                                isChecked
                                                                    ? 'bg-primary/10 border-primary text-primary'
                                                                    : 'bg-surface-container-low border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => updateTeacherDay(teacher, d.id, e.target.checked)}
                                                                className="me-2 rounded text-primary focus:ring-primary/30"
                                                            />
                                                            {d.name}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
