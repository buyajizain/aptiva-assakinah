<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolHoliday;
use App\Models\SchoolSetting;
use App\Models\TeacherSchedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolSettingController extends Controller
{
    /**
     * Tampilkan halaman pengaturan master sekolah.
     */
    public function index(): Response
    {
        $setting = SchoolSetting::first() ?? SchoolSetting::create([
            'school_name' => 'Yayasan As-Sakinah',
            'latitude' => -6.17539240,
            'longitude' => 106.82715300,
            'radius_meters' => 100,
            'work_days' => 6,
            'checkin_start' => '06:00:00',
            'checkin_limit' => '07:15:00',
            'checkout_start' => '13:00:00',
            'timezone' => 'Asia/Jakarta',
        ]);

        $holidays = SchoolHoliday::orderByDesc('holiday_date')->get();

        $partTimeTeachers = User::where('role', 'guru')
            ->where('schedule_type', 'part_time')
            ->with('teacherSchedules')
            ->get();

        return Inertia::render('Admin/Settings/Index', [
            'setting' => $setting,
            'holidays' => $holidays,
            'part_time_teachers' => $partTimeTeachers,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Simpan pembaruan pengaturan sekolah (lokasi, radius, jam kerja).
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'school_name' => ['required', 'string', 'max:150'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius_meters' => ['required', 'integer', 'min:10', 'max:5000'],
            'max_gps_accuracy' => ['required', 'integer', 'min:20', 'max:2000'],
            'work_days' => ['required', 'integer', 'in:5,6'],
            'checkin_start' => ['required', 'string'],
            'checkin_limit' => ['required', 'string'],
            'checkout_start' => ['required', 'string'],
            'timezone' => ['required', 'string', 'in:Asia/Jakarta,Asia/Makassar,Asia/Jayapura'],
            'daily_allowance' => ['nullable', 'integer', 'min:0'],
            'late_cut_amount' => ['nullable', 'integer', 'min:0'],
            'alpa_cut_amount' => ['nullable', 'integer', 'min:0'],
        ]);

        $setting = SchoolSetting::firstOrFail();
        $setting->update($validated);

        return back()->with('success', 'Pengaturan operasional sekolah berhasil diperbarui.');
    }

    /**
     * Tambah hari libur sekolah baru.
     */
    public function storeHoliday(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'holiday_date' => ['required', 'date', 'unique:school_holidays,holiday_date'],
            'description' => ['required', 'string', 'max:200'],
        ], [
            'holiday_date.unique' => 'Tanggal libur ini sudah terdaftar.',
            'description.required' => 'Keterangan hari libur wajib diisi.',
        ]);

        SchoolHoliday::create($validated);

        return back()->with('success', 'Hari libur sekolah berhasil ditambahkan.');
    }

    /**
     * Hapus hari libur sekolah.
     */
    public function destroyHoliday(SchoolHoliday $holiday): RedirectResponse
    {
        $holiday->delete();

        return back()->with('success', 'Hari libur berhasil dihapus.');
    }

    /**
     * Simpan jadwal hari aktif mengajar guru honorer/part-time.
     */
    public function updateSchedule(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'days' => ['array'],
            'days.*' => ['integer', 'between:1,6'], // 1=Senin..6=Sabtu
        ]);

        // Hapus jadwal lama lalu insert jadwal terpilih baru
        TeacherSchedule::where('user_id', $user->id)->delete();

        foreach ($validated['days'] ?? [] as $day) {
            TeacherSchedule::create([
                'user_id' => $user->id,
                'day_of_week' => $day,
                'is_active' => true,
            ]);
        }

        return back()->with('success', "Jadwal mengajar untuk {$user->name} berhasil diperbarui.");
    }
}
