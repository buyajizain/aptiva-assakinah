<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\SchoolSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan ringkasan harian, metrik kehadiran, dan Photo Audit Grid.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Jika peran Guru, alihkan langsung ke halaman presensi mandiri
        if ($user->isGuru()) {
            return redirect()->route('attendance.index');
        }

        $setting = SchoolSetting::first() ?? new SchoolSetting();
        $tz = $setting->timezone ?: 'Asia/Jakarta';
        $today = Carbon::now($tz)->format('Y-m-d');
        $selectedDate = $request->input('date', $today);

        // Ambil semua guru aktif
        $totalTeachers = User::where('role', 'guru')->where('is_active', true)->count();

        // Ambil data presensi pada tanggal yang dipilih
        $attendances = Attendance::with('user:id,name,nip,schedule_type')
            ->where('date', $selectedDate)
            ->whereHas('user', function ($q) {
                $q->where('role', 'guru')->where('is_active', true);
            })
            ->get();

        // Hitung metrik agregat
        $tepatWaktuCount = $attendances->where('status', 'tepat_waktu')->count();
        $terlambatCount = $attendances->where('status', 'terlambat')->count();
        $presentCount = $tepatWaktuCount + $terlambatCount + $attendances->where('status', 'htap')->count();
        $leaveCount = $attendances->whereIn('status', ['sakit', 'izin', 'dinas_luar'])->count();
        $htapCount = $attendances->where('status', 'htap')->count();

        $presentUserIds = $attendances->pluck('user_id')->toArray();

        // Guru yang belum absen hari ini
        $notPresentTeachers = User::where('role', 'guru')
            ->where('is_active', true)
            ->whereNotIn('id', $presentUserIds)
            ->select('id', 'name', 'nip', 'phone', 'schedule_type')
            ->get();

        $attendanceRate = $totalTeachers > 0
            ? round((($presentCount + $leaveCount) / $totalTeachers) * 100, 1)
            : 0;

        // Photo Audit List (Guru yang sudah selfie masuk hari ini)
        $photoAuditList = $attendances->filter(fn ($att) => ! empty($att->checkin_photo_path))
            ->map(fn ($att) => [
                'id' => $att->id,
                'user_name' => $att->user->name,
                'user_nip' => $att->user->nip,
                'checkin_time' => $att->checkin_time ? substr($att->checkin_time, 0, 5) : null,
                'checkout_time' => $att->checkout_time ? substr($att->checkout_time, 0, 5) : null,
                'status' => $att->status,
                'late_duration_minutes' => $att->late_duration_minutes,
                'accuracy' => $att->checkin_accuracy,
                'photo_url' => "/storage/{$att->checkin_photo_path}",
                'is_manual' => $att->is_manual_correction,
            ])
            ->values();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'total_teachers' => $totalTeachers,
                'present_count' => $presentCount,
                'tepat_waktu_count' => $tepatWaktuCount,
                'terlambat_count' => $terlambatCount,
                'leave_count' => $leaveCount,
                'htap_count' => $htapCount,
                'not_present_count' => $notPresentTeachers->count(),
                'attendance_rate' => $attendanceRate,
            ],
            'selected_date' => $selectedDate,
            'formatted_selected_date' => Carbon::parse($selectedDate)->locale('id')->isoFormat('dddd, D MMMM Y'),
            'photo_audits' => $photoAuditList,
            'attendances' => $attendances,
            'not_present_teachers' => $notPresentTeachers,
            'school_name' => $setting->school_name,
            'can_correct' => $user->isAdmin(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }
}
