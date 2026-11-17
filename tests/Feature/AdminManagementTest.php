<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\SchoolHoliday;
use App\Models\SchoolSetting;
use App\Models\TeacherSchedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminTu;
    protected User $guru;
    protected SchoolSetting $schoolSetting;

    protected function setUp(): void
    {
        parent::setUp();

        $this->schoolSetting = SchoolSetting::create([
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

        $this->adminTu = User::factory()->create([
            'nip' => '198501012010011001',
            'name' => 'Budi Santoso, S.Kom',
            'role' => 'admin_tu',
            'password' => bcrypt('Admin123!'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $this->guru = User::factory()->create([
            'nip' => '199008202015022003',
            'name' => 'Siti Rahmawati, S.Pd',
            'role' => 'guru',
            'schedule_type' => 'part_time',
            'password' => bcrypt('Guru123!'),
            'must_change_password' => false,
            'is_active' => true,
        ]);
    }

    public function test_admin_tu_can_view_dashboard_with_metrics(): void
    {
        $response = $this->actingAs($this->adminTu)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('metrics')
            ->has('photo_audits')
            ->has('attendances')
        );
    }

    public function test_guru_visiting_dashboard_is_redirected_to_attendance(): void
    {
        $response = $this->actingAs($this->guru)->get('/dashboard');

        $response->assertRedirect(route('attendance.index'));
    }

    public function test_admin_tu_can_manually_correct_attendance_and_record_audit_log(): void
    {
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');

        $response = $this->actingAs($this->adminTu)->post('/admin/attendance/correct', [
            'user_id' => $this->guru->id,
            'date' => $today,
            'status' => 'tepat_waktu',
            'checkin_time' => '07:05',
            'reason' => 'HP guru kehabisan baterai saat upacara, terbukti hadir di kelas piket.',
        ]);

        $response->assertSessionHas('success');

        // Verifikasi attendance terupdate
        $this->assertDatabaseHas('attendances', [
            'user_id' => $this->guru->id,
            'date' => $today,
            'status' => 'tepat_waktu',
            'is_manual_correction' => true,
        ]);

        // Verifikasi audit log tercatat mandatori
        $this->assertDatabaseHas('attendance_audit_logs', [
            'modified_by' => $this->adminTu->id,
            'new_status' => 'tepat_waktu',
            'reason' => 'HP guru kehabisan baterai saat upacara, terbukti hadir di kelas piket.',
        ]);
    }

    public function test_manual_correction_without_reason_is_rejected(): void
    {
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');

        $response = $this->actingAs($this->adminTu)->post('/admin/attendance/correct', [
            'user_id' => $this->guru->id,
            'date' => $today,
            'status' => 'tepat_waktu',
            'reason' => '', // Kosong -> Ditolak!
        ]);

        $response->assertSessionHasErrors('reason');
    }

    public function test_admin_tu_can_view_audit_trail_logs(): void
    {
        $response = $this->actingAs($this->adminTu)->get('/admin/attendance/audit-logs');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/AuditLogs/Index')
            ->has('logs')
        );
    }

    public function test_admin_tu_can_update_school_settings(): void
    {
        $response = $this->actingAs($this->adminTu)->put('/admin/settings', [
            'school_name' => 'SMK Negeri 1 Jakarta Pusat',
            'latitude' => -6.17540000,
            'longitude' => 106.82720000,
            'radius_meters' => 150,
            'max_gps_accuracy' => 350,
            'work_days' => 5,
            'checkin_start' => '06:00:00',
            'checkin_limit' => '07:20:00',
            'checkout_start' => '13:30:00',
            'timezone' => 'Asia/Jakarta',
        ]);

        $response->assertSessionHas('success');

        $this->schoolSetting->refresh();
        $this->assertEquals('SMK Negeri 1 Jakarta Pusat', $this->schoolSetting->school_name);
        $this->assertEquals(150, $this->schoolSetting->radius_meters);
        $this->assertEquals(350, $this->schoolSetting->max_gps_accuracy);
        $this->assertEquals(5, $this->schoolSetting->work_days);
    }

    public function test_admin_tu_can_add_and_delete_school_holiday(): void
    {
        $response = $this->actingAs($this->adminTu)->post('/admin/settings/holidays', [
            'holiday_date' => '2026-08-17',
            'description' => 'HUT Kemerdekaan RI ke-81',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('school_holidays', [
            'holiday_date' => '2026-08-17',
        ]);

        $holiday = SchoolHoliday::first();
        $deleteResponse = $this->actingAs($this->adminTu)->delete("/admin/settings/holidays/{$holiday->id}");
        $deleteResponse->assertSessionHas('success');
        $this->assertDatabaseMissing('school_holidays', [
            'holiday_date' => '2026-08-17',
        ]);
    }

    public function test_admin_tu_can_update_part_time_teacher_schedules(): void
    {
        $response = $this->actingAs($this->adminTu)->post("/admin/settings/schedules/{$this->guru->id}", [
            'days' => [1, 3, 5], // Senin, Rabu, Jumat
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals(3, TeacherSchedule::where('user_id', $this->guru->id)->count());
    }
}
