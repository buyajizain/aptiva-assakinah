<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\SchoolSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminTu;
    protected User $kepsek;
    protected User $guru;

    protected function setUp(): void
    {
        parent::setUp();

        SchoolSetting::create([
            'school_name' => 'SMK Negeri 1 Aptiva Digital',
            'latitude' => -6.17539240,
            'longitude' => 106.82715300,
            'radius_meters' => 100,
            'max_gps_accuracy' => 300,
            'daily_allowance' => 50000,
            'late_cut_amount' => 10000,
            'alpa_cut_amount' => 50000,
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

        $this->kepsek = User::factory()->create([
            'nip' => '197005151995031002',
            'name' => 'Drs. H. Ahmad Dahlan, M.Pd',
            'role' => 'kepsek',
            'password' => bcrypt('Kepsek123!'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $this->guru = User::factory()->create([
            'nip' => '199008202015022003',
            'name' => 'Siti Rahmawati, S.Pd',
            'role' => 'guru',
            'schedule_type' => 'full_time',
            'base_salary' => 2000000, // Gaji pokok 2 juta
            'password' => bcrypt('Guru123!'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        // Catat presensi: Hari 1 hadir tepat waktu, Hari 2 hadir terlambat
        Attendance::create([
            'user_id' => $this->guru->id,
            'date' => '2026-11-02',
            'checkin_time' => '07:05:00',
            'status' => 'tepat_waktu',
        ]);

        Attendance::create([
            'user_id' => $this->guru->id,
            'date' => '2026-11-03',
            'checkin_time' => '07:25:00',
            'status' => 'terlambat',
            'late_duration_minutes' => 10,
        ]);
    }

    public function test_admin_tu_can_view_monthly_payroll(): void
    {
        $response = $this->actingAs($this->adminTu)->get('/admin/payroll?month=11&year=2026');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Payroll/Index')
            ->has('payroll')
            ->has('payroll.teachers')
            ->has('payroll.totals')
            ->where('payroll.rates.daily_allowance', 50000)
        );
    }

    public function test_kepala_sekolah_can_view_monthly_payroll(): void
    {
        $response = $this->actingAs($this->kepsek)->get('/admin/payroll?month=11&year=2026');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Payroll/Index')
            ->has('payroll')
        );
    }

    public function test_guru_cannot_access_monthly_payroll(): void
    {
        $response = $this->actingAs($this->guru)->get('/admin/payroll');

        $response->assertStatus(403);
    }

    public function test_admin_tu_can_update_teacher_payroll_rate(): void
    {
        $response = $this->actingAs($this->adminTu)->post("/admin/payroll/teacher/{$this->guru->id}", [
            'base_salary' => 3500000,
            'custom_daily_allowance' => 75000,
        ]);

        $response->assertSessionHas('success');

        $this->guru->refresh();
        $this->assertEquals(3500000, $this->guru->base_salary);
        $this->assertEquals(75000, $this->guru->custom_daily_allowance);
    }

    public function test_admin_tu_can_export_payroll_excel(): void
    {
        $response = $this->actingAs($this->adminTu)->get('/admin/payroll/excel?month=11&year=2026');

        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $response->headers->get('content-type'));
    }

    public function test_admin_tu_can_export_payroll_pdf(): void
    {
        $response = $this->actingAs($this->adminTu)->get('/admin/payroll/pdf?month=11&year=2026');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_admin_tu_can_download_teacher_slip_pdf(): void
    {
        $response = $this->actingAs($this->adminTu)->get("/admin/payroll/slip/{$this->guru->id}?month=11&year=2026");

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }
}
