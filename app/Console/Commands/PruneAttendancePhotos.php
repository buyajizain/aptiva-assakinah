<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PruneAttendancePhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:prune-photos {--days=90 : Umur foto presensi dalam hari yang akan dihapus}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Bersihkan berkas fisik foto selfie absensi yang berumur lebih dari 90 hari guna menghemat kapasitas penyimpanan server';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoffDate = Carbon::now('Asia/Jakarta')->subDays($days)->format('Y-m-d');

        $this->info("Memulai pembersihan foto presensi yang tercatat sebelum tanggal: {$cutoffDate} ({$days} hari lalu)...");

        $attendances = Attendance::where('date', '<', $cutoffDate)
            ->where(function ($q) {
                $q->whereNotNull('checkin_photo_path')
                  ->orWhereNotNull('checkout_photo_path');
            })
            ->get();

        $deletedCount = 0;

        foreach ($attendances as $att) {
            // Hapus foto masuk fisik
            if ($att->checkin_photo_path && Storage::disk('public')->exists($att->checkin_photo_path)) {
                Storage::disk('public')->delete($att->checkin_photo_path);
                $deletedCount++;
            }

            // Hapus foto pulang fisik
            if ($att->checkout_photo_path && Storage::disk('public')->exists($att->checkout_photo_path)) {
                Storage::disk('public')->delete($att->checkout_photo_path);
                $deletedCount++;
            }

            // Kosongkan path di database agar tidak broken link, namun data teks absensi tetap utuh permanen
            $att->update([
                'checkin_photo_path' => null,
                'checkout_photo_path' => null,
            ]);
        }

        $this->info("Pembersihan selesai! {$deletedCount} berkas foto selfie berhasil dihapus. Data rekap kehadiran tetap tersimpan aman di database.");

        return Command::SUCCESS;
    }
}
