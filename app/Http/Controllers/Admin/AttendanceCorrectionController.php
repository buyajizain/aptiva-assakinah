<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceAuditLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceCorrectionController extends Controller
{
    /**
     * Lakukan koreksi presensi manual darurat dan catat ke Audit Trail.
     */
    public function correct(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:tepat_waktu,terlambat,htap,izin,sakit,dinas_luar,alpa'],
            'checkin_time' => ['nullable', 'date_format:H:i'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'reason.required' => 'Wajib mencantumkan alasan koreksi presensi manual demi transparansi audit.',
            'reason.min' => 'Alasan koreksi minimal 5 karakter.',
        ]);

        $targetUser = User::findOrFail($validated['user_id']);

        $attendance = Attendance::firstOrNew([
            'user_id' => $targetUser->id,
            'date' => $validated['date'],
        ]);

        $oldStatus = $attendance->exists ? $attendance->status : 'alpa';
        $newStatus = $validated['status'];

        $attendance->status = $newStatus;
        $attendance->is_manual_correction = true;
        if (! empty($validated['checkin_time'])) {
            $attendance->checkin_time = $validated['checkin_time'] . ':00';
        } elseif (! $attendance->checkin_time && in_array($newStatus, ['tepat_waktu', 'terlambat'])) {
            $attendance->checkin_time = '07:00:00';
        }
        $attendance->save();

        // Catat ke Audit Trail Mandatori
        AttendanceAuditLog::create([
            'attendance_id' => $attendance->id,
            'modified_by' => auth()->id(),
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'reason' => $validated['reason'],
            'created_at' => Carbon::now(),
        ]);

        return back()->with('success', "Status kehadiran {$targetUser->name} pada tanggal {$validated['date']} berhasil dikoreksi menjadi '{$newStatus}' dan dicatat ke Audit Trail.");
    }

    /**
     * Tampilkan riwayat jejak audit (Audit Trail Log).
     */
    public function auditLogs(Request $request): Response
    {
        $logs = AttendanceAuditLog::with([
            'attendance.user:id,name,nip',
            'modifier:id,name,nip'
        ])
        ->orderByDesc('created_at')
        ->paginate(20);

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
        ]);
    }
}
