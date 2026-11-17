<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\SchoolSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
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
            'password' => bcrypt('Guru123!'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        // Buat presensi contoh
        Attendance::create([
            'user_id' => $this->guru->id,
            'date' => '2026-11-16',
            'checkin_time' => '07:05:00',
            'status' => 'tepat_waktu',
        ]);
    }

    public function test_admin_tu_can_view_monthly_report(): void
    {
        $response = $this->actingAs($this->adminTu)->get('/admin/reports?month=11&year=2026');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Reports/Index')
            ->has('report')
            ->has('report.teachers_matrix')
            ->has('report.dates_info')
            ->where('report.teachers_matrix.0.days.16', 'H')
        );
    }

    public function test_kepala_sekolah_can_view_monthly_report(): void
    {
        $response = $this->actingAs($this->kepsek)->get('/admin/reports?month=11&year=2026');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Reports/Index')
            ->has('report')
        );
    }

    public function test_guru_cannot_access_monthly_report(): void
    {
        $response = $this->actingAs($this->guru)->get('/admin/reports');

        $response->assertStatus(403);
    }

    public function test_admin_tu_can_download_monthly_report_pdf(): void
    {
        $response = $this->actingAs($this->adminTu)->get('/admin/reports/pdf?month=11&year=2026');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_admin_tu_can_download_monthly_report_excel(): void
    {
        $response = $this->actingAs($this->adminTu)->get('/admin/reports/excel?month=11&year=2026');

        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $response->headers->get('content-type'));
    }
}
