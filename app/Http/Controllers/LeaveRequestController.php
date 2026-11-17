<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestController extends Controller
{
    /**
     * Tampilkan riwayat dan form pengajuan izin/sakit guru.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $leaves = LeaveRequest::where('user_id', $user->id)
            ->with('approver:id,name')
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Leave/Index', [
            'leaves' => $leaves,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Simpan pengajuan izin/sakit baru dari guru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:sakit,izin,dinas_luar'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:1000'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'], // Max 5MB
        ], [
            'type.required' => 'Pilih jenis ketidakhadiran.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'reason.required' => 'Keterangan/alasan pengajuan wajib diisi.',
            'attachment.mimes' => 'Format berkas bukti harus berupa JPG, PNG, atau PDF.',
            'attachment.max' => 'Ukuran berkas maksimal 5MB.',
        ]);

        $user = $request->user();
        $attachmentPath = null;

        if ($request->hasFile('attachment')) {
            $now = Carbon::now();
            $month = str_pad((string) $now->month, 2, '0', STR_PAD_LEFT);
            $extension = $request->file('attachment')->getClientOriginalExtension();
            $filename = "leave_{$user->id}_{$now->timestamp}.{$extension}";
            $directory = "leaves/{$now->year}/{$month}";

            $attachmentPath = $request->file('attachment')->storeAs($directory, $filename, 'public');
        }

        LeaveRequest::create([
            'user_id' => $user->id,
            'type' => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
        ]);

        $typeLabel = match ($validated['type']) {
            'sakit' => 'Sakit',
            'dinas_luar' => 'Dinas Luar',
            default => 'Izin',
        };

        return back()->with('success', "Pengajuan {$typeLabel} berhasil dikirim dan menunggu persetujuan Tata Usaha.");
    }

    /**
     * Unggah lampiran surat dokter/tugas susulan (misal sakit mendadak).
     */
    public function uploadAttachment(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        if ($leaveRequest->user_id !== $request->user()->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $request->validate([
            'attachment' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ], [
            'attachment.required' => 'Pilih berkas bukti untuk diunggah.',
            'attachment.mimes' => 'Format berkas bukti harus berupa JPG, PNG, atau PDF.',
        ]);

        $now = Carbon::now();
        $month = str_pad((string) $now->month, 2, '0', STR_PAD_LEFT);
        $extension = $request->file('attachment')->getClientOriginalExtension();
        $filename = "leave_{$leaveRequest->user_id}_{$now->timestamp}.{$extension}";
        $directory = "leaves/{$now->year}/{$month}";

        $path = $request->file('attachment')->storeAs($directory, $filename, 'public');

        $leaveRequest->update([
            'attachment_path' => $path,
        ]);

        return back()->with('success', 'Bukti lampiran susulan berhasil diunggah.');
    }
}
