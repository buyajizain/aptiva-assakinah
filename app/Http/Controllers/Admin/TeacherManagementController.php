<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherManagementController extends Controller
{
    /**
     * Tampilkan daftar guru dan staf.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $scheduleFilter = $request->input('schedule_type');

        $users = User::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nip', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($roleFilter, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($scheduleFilter, function ($query, $schedule) {
                $query->where('schedule_type', $schedule);
            })
            ->orderByRaw("CASE WHEN role = 'admin_tu' THEN 1 WHEN role = 'kepsek' THEN 2 ELSE 3 END")
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Teachers/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'schedule_type' => $scheduleFilter,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Reset ikatan perangkat (Device Binding) guru.
     */
    public function resetDevice(User $user): RedirectResponse
    {
        $user->update(['device_id' => null]);

        return back()->with('success', "Ikatan perangkat untuk {$user->name} berhasil di-reset. Guru dapat login di HP baru.");
    }

    /**
     * Aktifkan atau nonaktifkan akun guru.
     */
    public function toggleActive(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
        }

        $user->update(['is_active' => ! $user->is_active]);
        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Akun {$user->name} berhasil {$status}.");
    }

    /**
     * Unduh template file CSV untuk import data massal.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $filename = 'template_guru_aptiva_attend.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            // Menulis UTF-8 BOM agar terbaca rapi saat dibuka di Microsoft Excel
            fputs($handle, "\xEF\xBB\xBF");

            // Header kolom
            fputcsv($handle, ['NIP', 'Nama_Lengkap', 'Email', 'No_HP', 'Tipe_Jadwal']);

            // Baris contoh
            fputcsv($handle, ['198801012014031005', 'Hendra Gunawan, S.Pd', 'hendra@sekolah.sch.id', '081234567890', 'full_time']);
            fputcsv($handle, ['199205102021042008', 'Dewi Lestari, S.Pd', 'dewi@sekolah.sch.id', '089876543210', 'part_time']);

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Import massal data guru via CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV untuk diimpor.',
            'file.mimes' => 'Format berkas wajib berupa file .csv.',
        ]);

        $path = $request->file('file')->getRealPath();
        $handle = fopen($path, 'r');

        if (! $handle) {
            return back()->with('error', 'Gagal membaca berkas CSV.');
        }

        // Lewati BOM jika ada
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        // Baris pertama adalah header
        $header = fgetcsv($handle, 1000, ',');
        $importedCount = 0;
        $updatedCount = 0;

        while (($row = fgetcsv($handle, 1000, ',')) !== false) {
            if (empty($row) || count($row) < 2) {
                continue;
            }

            $nip = trim($row[0] ?? '');
            $name = trim($row[1] ?? '');
            $email = ! empty($row[2]) ? trim($row[2]) : null;
            $phone = ! empty($row[3]) ? trim($row[3]) : null;
            $scheduleType = in_array(trim($row[4] ?? ''), ['part_time', 'full_time']) ? trim($row[4]) : 'full_time';

            if (empty($nip) || empty($name)) {
                continue;
            }

            // Password default: Guru + 4 digit NIP terakhir, atau Guru123!
            $lastFourNip = strlen($nip) >= 4 ? substr($nip, -4) : '123!';
            $defaultPassword = 'Guru' . $lastFourNip;

            $existing = User::where('nip', $nip)->first();

            if ($existing) {
                $existing->update([
                    'name' => $name,
                    'email' => $email ?: $existing->email,
                    'phone' => $phone ?: $existing->phone,
                    'schedule_type' => $scheduleType,
                ]);
                $updatedCount++;
            } else {
                User::create([
                    'nip' => $nip,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'password' => Hash::make($defaultPassword),
                    'role' => 'guru',
                    'schedule_type' => $scheduleType,
                    'must_change_password' => true,
                    'is_active' => true,
                ]);
                $importedCount++;
            }
        }

        fclose($handle);

        return back()->with('success', "Proses impor selesai! {$importedCount} akun guru baru dibuat, {$updatedCount} akun diperbarui.");
    }
}
