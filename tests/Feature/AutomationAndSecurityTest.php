<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\SchoolSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AutomationAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $guru;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        SchoolSetting::create([
            'school_name' => 'SMK Negeri 1 Aptiva Digital',
            'latitude' => -6.17539240,
            'longitude' => 106.82715300,
            'radius_meters' => 100,
            'work_days' => 6,
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
    }

    public function test_close_day_htap_command_marks_uncompleted_checkouts(): void
    {
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');

        // Guru absen masuk tapi tidak absen pulang
        $attendance = Attendance::create([
            'user_id' => $this->guru->id,
            'date' => $today,
            'checkin_time' => '07:05:00',
            'checkout_time' => null,
            'status' => 'tepat_waktu',
        ]);

        $exitCode = Artisan::call('attendance:close-day-htap', [
            '--date' => $today,
        ]);

        $this->assertEquals(0, $exitCode);

        $attendance->refresh();
        $this->assertEquals('htap', $attendance->status);
    }

    public function test_prune_photos_command_removes_old_physical_files(): void
    {
        $oldDate = Carbon::now('Asia/Jakarta')->subDays(95)->format('Y-m-d');

        // Simpan file dummy foto lama di storage
        $dummyPath = 'attendances/2026/08/old_photo.webp';
        Storage::disk('public')->put($dummyPath, 'fake-image-content');

        $attendance = Attendance::create([
            'user_id' => $this->guru->id,
            'date' => $oldDate,
            'checkin_time' => '07:00:00',
            'checkin_photo_path' => $dummyPath,
            'status' => 'tepat_waktu',
        ]);

        Storage::disk('public')->assertExists($dummyPath);

        // Jalankan perintah prune untuk foto > 90 hari
        $exitCode = Artisan::call('attendance:prune-photos', [
            '--days' => 90,
        ]);

        $this->assertEquals(0, $exitCode);

        // Berkas fisik terhapus dari disk untuk hemat storage
        Storage::disk('public')->assertMissing($dummyPath);

        // Rekap database tetap ada (hanya path foto di-null-kan)
        $attendance->refresh();
        $this->assertNull($attendance->checkin_photo_path);
        $this->assertEquals('tepat_waktu', $attendance->status);
    }

    public function test_security_headers_are_attached_to_responses(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()');
    }
}
