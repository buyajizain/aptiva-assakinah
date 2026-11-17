<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LeaveRequestTest extends TestCase
{
    use RefreshDatabase;

    protected User $guru;
    protected User $adminTu;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->guru = User::factory()->create([
            'nip' => '199008202015022003',
            'name' => 'Siti Rahmawati, S.Pd',
            'role' => 'guru',
            'password' => bcrypt('Guru123!'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $this->adminTu = User::factory()->create([
            'nip' => '198501012010011001',
            'name' => 'Budi Santoso, S.Kom',
            'role' => 'admin_tu',
            'password' => bcrypt('Admin123!'),
            'must_change_password' => false,
            'is_active' => true,
        ]);
    }

    public function test_guru_can_submit_sick_leave_without_initial_attachment(): void
    {
        $today = Carbon::now()->format('Y-m-d');
        $tomorrow = Carbon::now()->addDay()->format('Y-m-d');

        $response = $this->actingAs($this->guru)->post('/leaves', [
            'type' => 'sakit',
            'start_date' => $today,
            'end_date' => $tomorrow,
            'reason' => 'Demam tinggi dan flu berat',
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('leave_requests', [
            'user_id' => $this->guru->id,
            'type' => 'sakit',
            'status' => 'pending',
            'start_date' => $today,
            'end_date' => $tomorrow,
        ]);
    }

    public function test_guru_can_upload_followup_doctor_note(): void
    {
        $leave = LeaveRequest::create([
            'user_id' => $this->guru->id,
            'type' => 'sakit',
            'start_date' => Carbon::now()->format('Y-m-d'),
            'end_date' => Carbon::now()->format('Y-m-d'),
            'reason' => 'Demam mendadak pagi ini',
            'status' => 'pending',
        ]);

        $file = UploadedFile::fake()->create('surat_dokter.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->guru)->post("/leaves/{$leave->id}/upload", [
            'attachment' => $file,
        ]);

        $response->assertSessionHas('success');

        $leave->refresh();
        $this->assertNotNull($leave->attachment_path);
        Storage::disk('public')->assertExists($leave->attachment_path);
    }

    public function test_admin_tu_can_approve_leave_and_auto_sync_to_attendance(): void
    {
        $today = Carbon::now()->format('Y-m-d');
        $tomorrow = Carbon::now()->addDay()->format('Y-m-d');

        $leave = LeaveRequest::create([
            'user_id' => $this->guru->id,
            'type' => 'dinas_luar',
            'start_date' => $today,
            'end_date' => $tomorrow,
            'reason' => 'Mengikuti Pelatihan Kurikulum Merdeka di LPMP',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->adminTu)->post("/admin/leaves/{$leave->id}/approve");

        $response->assertSessionHas('success');

        $leave->refresh();
        $this->assertEquals('approved', $leave->status);
        $this->assertEquals($this->adminTu->id, $leave->approved_by);

        // Auto sync presensi untuk 2 hari tersebut
        $this->assertDatabaseHas('attendances', [
            'user_id' => $this->guru->id,
            'date' => $today,
            'status' => 'dinas_luar',
        ]);

        $this->assertDatabaseHas('attendances', [
            'user_id' => $this->guru->id,
            'date' => $tomorrow,
            'status' => 'dinas_luar',
        ]);
    }

    public function test_admin_tu_can_reject_leave_with_mandatory_reason(): void
    {
        $leave = LeaveRequest::create([
            'user_id' => $this->guru->id,
            'type' => 'izin',
            'start_date' => Carbon::now()->format('Y-m-d'),
            'end_date' => Carbon::now()->format('Y-m-d'),
            'reason' => 'Keperluan keluarga',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->adminTu)->post("/admin/leaves/{$leave->id}/reject", [
            'rejection_note' => 'Ada jadwal piket ujian sekolah yang tidak bisa ditinggalkan.',
        ]);

        $response->assertSessionHas('success');

        $leave->refresh();
        $this->assertEquals('rejected', $leave->status);
        $this->assertEquals('Ada jadwal piket ujian sekolah yang tidak bisa ditinggalkan.', $leave->rejection_note);
    }
}
