<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveApprovalController extends Controller
{
    /**
     * Tampilkan daftar pengajuan izin guru untuk Admin TU.
     */
    public function index(Request $request): Response
    {
        $statusFilter = $request->input('status', 'pending');
        $typeFilter = $request->input('type');
        $search = $request->input('search');

        $query = LeaveRequest::with(['user:id,name,nip', 'approver:id,name'])
            ->when($statusFilter, function ($q, $status) {
                if ($status !== 'all') {
                    $q->where('status', $status);
                }
            })
            ->when($typeFilter, function ($q, $type) {
                $q->where('type', $type);
            })
            ->when($search, function ($q, $search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%")
                      ->orWhere('nip', 'like', "%{$search}%");
                });
            })
            ->orderByRaw("CASE WHEN status = 'pending' THEN 1 ELSE 2 END")
            ->orderByDesc('created_at');

        $leaves = $query->paginate(15)->withQueryString();

        $pendingCount = LeaveRequest::where('status', 'pending')->count();

        return Inertia::render('Admin/Leaves/Index', [
            'leaves' => $leaves,
            'filters' => [
                'status' => $statusFilter,
                'type' => $typeFilter,
                'search' => $search,
            ],
            'pending_count' => $pendingCount,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Setujui pengajuan izin guru dan otomatis sinkronkan ke presensi harian.
     */
    public function approve(LeaveRequest $leaveRequest): RedirectResponse
    {
        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => Carbon::now(),
            'rejection_note' => null,
        ]);

        // Otomatis update status di tabel attendances untuk setiap hari dalam rentang izin
        $start = Carbon::parse($leaveRequest->start_date);
        $end = Carbon::parse($leaveRequest->end_date);

        while ($start->lte($end)) {
            $dateStr = $start->format('Y-m-d');

            Attendance::updateOrCreate(
                [
                    'user_id' => $leaveRequest->user_id,
                    'date' => $dateStr,
                ],
                [
                    'status' => $leaveRequest->type,
                    'is_manual_correction' => false,
                ]
            );

            $start->addDay();
        }

        $typeLabel = match ($leaveRequest->type) {
            'sakit' => 'Sakit',
            'dinas_luar' => 'Dinas Luar',
            default => 'Izin',
        };

        return back()->with('success', "Pengajuan {$typeLabel} untuk {$leaveRequest->user->name} berhasil disetujui dan disinkronkan ke rekap presensi.");
    }

    /**
     * Tolak pengajuan izin guru disertai alasan penolakan.
     */
    public function reject(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_note' => ['required', 'string', 'max:500'],
        ], [
            'rejection_note.required' => 'Wajib mencantumkan alasan penolakan permohonan izin.',
        ]);

        $leaveRequest->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => Carbon::now(),
            'rejection_note' => $validated['rejection_note'],
        ]);

        return back()->with('success', "Pengajuan izin untuk {$leaveRequest->user->name} berhasil ditolak.");
    }
}
