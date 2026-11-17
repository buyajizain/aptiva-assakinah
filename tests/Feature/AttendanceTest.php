<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\SchoolSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected User $guru;
    protected SchoolSetting $schoolSetting;
    protected string $dummyPhotoBase64;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->schoolSetting = SchoolSetting::create([
            'school_name' => 'SMK Negeri 1 Aptiva Digital',
            'latitude' => -6.17539240,
            'longitude' => 106.82715300,
            'radius_meters' => 100,
            'checkin_start' => '06:00:00',
            'checkin_limit' => '07:15:00',
            'checkout_start' => '13:00:00',
            'timezone' => 'Asia/Jakarta',
        ]);

        $this->guru = User::factory()->create([
            'nip' => '199008202015022003',
            'name' => 'Siti Rahmawati, S.Pd',
            'role' => 'guru',
            'password' => bcrypt('Guru123!'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        // Base64 dummy 1x1 png image
        $this->dummyPhotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    public function test_teacher_can_view_attendance_page(): void
    {
        $response = $this->actingAs($this->guru)->get('/attendance');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Attendance/Index')
            ->has('school_setting')
            ->has('server_state')
        );
    }

    public function test_teacher_can_check_in_successfully_within_geofence(): void
    {
        // Posisi dalam radius 100m dari Monas (-6.17539240, 106.82715300)
        $userLat = -6.17540000;
        $userLng = 106.82716000;

        $response = $this->actingAs($this->guru)->post('/attendance/check-in', [
            'latitude' => $userLat,
            'longitude' => $userLng,
            'accuracy' => 15.5,
            'photo' => $this->dummyPhotoBase64,
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('attendances', [
            'user_id' => $this->guru->id,
            'date' => Carbon::now('Asia/Jakarta')->format('Y-m-d'),
        ]);

        $attendance = Attendance::first();
        $this->assertNotNull($attendance->checkin_time);
        $this->assertNotNull($attendance->checkin_photo_path);
        Storage::disk('public')->assertExists($attendance->checkin_photo_path);
    }

    public function test_check_in_rejected_if_gps_accuracy_is_poor(): void
    {
        $response = $this->actingAs($this->guru)->post('/attendance/check-in', [
            'latitude' => -6.17539240,
            'longitude' => 106.82715300,
            'accuracy' => 450.0, // Akurasi 450m melebihi batas default 300m
            'photo' => $this->dummyPhotoBase64,
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_check_in_rejected_if_outside_geofence_radius(): void
    {
        // Posisi jauh di luar sekolah (jarak ~2 km)
        $outsideLat = -6.19500000;
        $outsideLng = 106.84000000;

        $response = $this->actingAs($this->guru)->post('/attendance/check-in', [
            'latitude' => $outsideLat,
            'longitude' => $outsideLng,
            'accuracy' => 10.0,
            'photo' => $this->dummyPhotoBase64,
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_teacher_can_check_out_after_checkout_hours(): void
    {
        // Buat absensi masuk terlebih dahulu
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');
        $attendance = Attendance::create([
            'user_id' => $this->guru->id,
            'date' => $today,
            'checkin_time' => '07:05:00',
            'checkin_lat' => -6.17539240,
            'checkin_lng' => 106.82715300,
            'status' => 'tepat_waktu',
        ]);

        // Simulasi waktu checkout (jam 14:00)
        Carbon::setTestNow(Carbon::parse($today . ' 14:00:00', 'Asia/Jakarta'));

        $response = $this->actingAs($this->guru)->post('/attendance/check-out', [
            'latitude' => -6.17539240,
            'longitude' => 106.82715300,
            'accuracy' => 12.0,
            'photo' => $this->dummyPhotoBase64,
        ]);

        $response->assertSessionHas('success');

        $attendance->refresh();
        $this->assertNotNull($attendance->checkout_time);
        $this->assertNotNull($attendance->checkout_photo_path);

        Carbon::setTestNow(); // Reset time
    }

    public function test_checkout_is_rejected_before_checkout_start_time(): void
    {
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');
        Attendance::create([
            'user_id' => $this->guru->id,
            'date' => $today,
            'checkin_time' => '07:05:00',
            'status' => 'tepat_waktu',
        ]);

        // Simulasi waktu sebelum jam 13:00 (misal jam 09:30 pagi)
        Carbon::setTestNow(Carbon::parse($today . ' 09:30:00', 'Asia/Jakarta'));

        $response = $this->actingAs($this->guru)->post('/attendance/check-out', [
            'latitude' => -6.17539240,
            'longitude' => 106.82715300,
            'accuracy' => 10.0,
            'photo' => $this->dummyPhotoBase64,
        ]);

        $response->assertSessionHas('error');
        $this->assertNull(Attendance::first()->checkout_time);

        Carbon::setTestNow();
    }
}
