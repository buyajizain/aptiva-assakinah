<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\SchoolHoliday;
use App\Models\SchoolSetting;
use App\Models\TeacherSchedule;
use App\Services\GeofenceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Tampilkan halaman utama presensi mobile PWA bagi guru.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $setting = SchoolSetting::first() ?? new SchoolSetting();
        $tz = $setting->timezone ?: 'Asia/Jakarta';
        $now = Carbon::now($tz);
        $todayDate = $now->format('Y-m-d');
        $currentTime = $now->format('H:i:s');

        // Cek Kehadiran Hari Ini
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $todayDate)
            ->first();

        // Cek Hari Libur
        $holiday = SchoolHoliday::where('holiday_date', $todayDate)->first();

        // Cek Jadwal Mengajar Guru Honorer (1=Senin s/d 7=Minggu)
        $isScheduledToday = true;
        if ($user->schedule_type === 'part_time') {
            $dayOfWeek = $now->dayOfWeekIso; // 1 (Senin) .. 7 (Minggu)
            $isScheduledToday = TeacherSchedule::where('user_id', $user->id)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_active', true)
                ->exists();
        }

        // Tentukan kelayakan tombol Absen Masuk & Pulang
        $canCheckIn = is_null($attendance) || is_null($attendance->checkin_time);
        $canCheckOut = ! is_null($attendance) &&
                       ! is_null($attendance->checkin_time) &&
                       is_null($attendance->checkout_time) &&
                       ($currentTime >= ($setting->checkout_start ?: '13:00:00'));

        return Inertia::render('Attendance/Index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nip' => $user->nip,
                'role' => $user->role,
                'schedule_type' => $user->schedule_type,
            ],
            'attendance' => $attendance,
            'school_setting' => [
                'school_name' => $setting->school_name,
                'latitude' => (float) $setting->latitude,
                'longitude' => (float) $setting->longitude,
                'radius_meters' => (int) $setting->radius_meters,
                'max_gps_accuracy' => (int) ($setting->max_gps_accuracy ?? 300),
                'secondary_locations' => $setting->secondary_locations ?? [],
                'checkin_start' => $setting->checkin_start,
                'checkin_limit' => $setting->checkin_limit,
                'checkout_start' => $setting->checkout_start,
                'timezone' => $tz,
            ],
            'server_state' => [
                'date' => $todayDate,
                'formatted_date' => $now->locale('id')->isoFormat('dddd, D MMMM Y'),
                'time' => $currentTime,
                'is_holiday' => ! is_null($holiday),
                'holiday_name' => $holiday?->description,
                'is_scheduled_today' => $isScheduledToday,
                'can_checkin' => $canCheckIn,
                'can_checkout' => $canCheckOut,
                'checkout_opens_at' => substr($setting->checkout_start ?: '13:00:00', 0, 5),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Proses transaksi Absen Masuk.
     */
    public function checkIn(Request $request, GeofenceService $geofenceService): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['required', 'numeric', 'min:0'],
            'photo' => ['required', 'string'], // base64 data URL
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $setting = SchoolSetting::firstOrFail();
        $tz = $setting->timezone ?: 'Asia/Jakarta';
        $now = Carbon::now($tz);
        $todayDate = $now->format('Y-m-d');
        $checkinTime = $now->format('H:i:s');

        // 1. Cek Apakah Sudah Absen Masuk Hari Ini
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $todayDate)
            ->first();

        if ($attendance && $attendance->checkin_time) {
            return $this->responseError('Anda sudah melakukan absen masuk hari ini pada pukul ' . substr($attendance->checkin_time, 0, 5) . ' WIB.');
        }

        // 2. Proteksi Anti-Fake GPS via Threshold Akurasi
        $accuracy = (float) $validated['accuracy'];
        $maxAccuracy = (int) ($setting->max_gps_accuracy ?: 300);
        if ($accuracy > $maxAccuracy) {
            return $this->responseError("Akurasi sinyal GPS perangkat Anda ({$accuracy}m) melebihi batas toleransi sistem (maksimal {$maxAccuracy}m). Jika Anda menggunakan laptop atau berada di dalam gedung tebal, pastikan mode lokasi berakurasi tinggi aktif atau atur batas toleransi di Pengaturan Sekolah.");
        }

        // 3. Validasi Geofencing (Radius Sekolah)
        $geofence = $geofenceService->checkGeofence(
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            $setting
        );

        if (! $geofence['within']) {
            return $this->responseError("Anda berada di luar area {$geofence['location_name']}. Jarak Anda: {$geofence['distance']} meter (Batas toleransi: {$geofence['allowed_radius']} meter).");
        }

        // 4. Hitung Status Keterlambatan Waktu Server
        $checkinLimit = $setting->checkin_limit ?: '07:15:00';
        $isLate = $checkinTime > $checkinLimit;
        $lateDuration = 0;

        if ($isLate) {
            $limitTime = Carbon::createFromTimeString($checkinLimit, $tz);
            $lateDuration = max(0, $limitTime->diffInMinutes($now));
            $status = 'terlambat';
        } else {
            $status = 'tepat_waktu';
        }

        // 5. Simpan Berkas Foto Selfie Terkompresi
        $photoPath = $this->storeBase64Photo(
            $validated['photo'],
            "in_{$user->id}_{$now->timestamp}.webp",
            $now->year,
            $now->month
        );

        // 6. Simpan atau Update Record Presensi
        Attendance::updateOrCreate(
            ['user_id' => $user->id, 'date' => $todayDate],
            [
                'checkin_time' => $checkinTime,
                'checkin_lat' => $validated['latitude'],
                'checkin_lng' => $validated['longitude'],
                'checkin_accuracy' => $accuracy,
                'checkin_photo_path' => $photoPath,
                'status' => $status,
                'late_duration_minutes' => $lateDuration,
            ]
        );

        $msg = $isLate
            ? "Absen Masuk berhasil tercatat pada {$checkinTime} WIB (Terlambat {$lateDuration} menit)."
            : "Absen Masuk berhasil tercatat tepat waktu pada {$checkinTime} WIB. Selamat mengajar!";

        return $this->responseSuccess($msg);
    }

    /**
     * Proses transaksi Absen Pulang.
     */
    public function checkOut(Request $request, GeofenceService $geofenceService): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['required', 'numeric', 'min:0'],
            'photo' => ['required', 'string'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $setting = SchoolSetting::firstOrFail();
        $tz = $setting->timezone ?: 'Asia/Jakarta';
        $now = Carbon::now($tz);
        $todayDate = $now->format('Y-m-d');
        $checkoutTime = $now->format('H:i:s');

        // 1. Verifikasi Apakah Sudah Absen Masuk
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $todayDate)
            ->first();

        if (! $attendance || ! $attendance->checkin_time) {
            return $this->responseError('Anda belum melakukan absen masuk hari ini.');
        }

        if ($attendance->checkout_time) {
            return $this->responseError('Anda sudah melakukan absen pulang hari ini pada pukul ' . substr($attendance->checkout_time, 0, 5) . ' WIB.');
        }

        // 2. Verifikasi Jam Buka Absen Pulang
        $checkoutStart = $setting->checkout_start ?: '13:00:00';
        if ($checkoutTime < $checkoutStart) {
            $formattedOpen = substr($checkoutStart, 0, 5);
            return $this->responseError("Presensi pulang belum dibuka. Tombol absen pulang baru dapat digunakan mulai pukul {$formattedOpen} WIB.");
        }

        // 3. Validasi Akurasi GPS
        $accuracy = (float) $validated['accuracy'];
        $maxAccuracy = (int) ($setting->max_gps_accuracy ?: 300);
        if ($accuracy > $maxAccuracy) {
            return $this->responseError("Akurasi sinyal GPS ({$accuracy}m) melebihi batas toleransi sistem (maksimal {$maxAccuracy}m). Harap coba beberapa saat lagi di area terbuka.");
        }

        // 4. Validasi Radius Sekolah
        $geofence = $geofenceService->checkGeofence(
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            $setting
        );

        if (! $geofence['within']) {
            return $this->responseError("Anda berada di luar radius sekolah saat ingin absen pulang (Jarak: {$geofence['distance']} meter).");
        }

        // 5. Simpan Foto Selfie Pulang
        $photoPath = $this->storeBase64Photo(
            $validated['photo'],
            "out_{$user->id}_{$now->timestamp}.webp",
            $now->year,
            $now->month
        );

        // 6. Update Transaksi Pulang
        $attendance->update([
            'checkout_time' => $checkoutTime,
            'checkout_lat' => $validated['latitude'],
            'checkout_lng' => $validated['longitude'],
            'checkout_accuracy' => $accuracy,
            'checkout_photo_path' => $photoPath,
        ]);

        return $this->responseSuccess("Absen Pulang berhasil tercatat pada {$checkoutTime} WIB. Terima kasih atas dedikasi Anda hari ini!");
    }

    /**
     * Decode dan simpan string base64 foto selfie ke storage lokal.
     */
    protected function storeBase64Photo(string $base64Data, string $filename, int $year, int $month): string
    {
        // Format bulan 2 digit: 01..12
        $monthStr = str_pad((string) $month, 2, '0', STR_PAD_LEFT);
        $directory = "attendances/{$year}/{$monthStr}";

        // Bersihkan header Data URL (misal: "data:image/webp;base64,....")
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
        }

        $decoded = base64_decode($base64Data);
        $relativePath = "{$directory}/{$filename}";

        Storage::disk('public')->put($relativePath, $decoded);

        return $relativePath;
    }

    protected function responseError(string $message): JsonResponse|RedirectResponse
    {
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json(['success' => false, 'message' => $message], 422);
        }
        return back()->with('error', $message);
    }

    protected function responseSuccess(string $message): JsonResponse|RedirectResponse
    {
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json(['success' => true, 'message' => $message]);
        }
        return back()->with('success', $message);
    }
}
