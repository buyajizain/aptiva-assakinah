<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CloseDayHtap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:close-day-htap {--date= : Tanggal presensi yang akan ditutup, format Y-m-d}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tandai guru yang absen masuk namun lupa/tidak melakukan absen pulang menjadi status HTAP (Hadir Tanpa Absen Pulang)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $date = $this->option('date') ?: Carbon::now('Asia/Jakarta')->format('Y-m-d');

        $this->info("Menjalankan penutupan hari untuk tanggal: {$date}...");

        $affected = Attendance::where('date', $date)
            ->whereNotNull('checkin_time')
            ->whereNull('checkout_time')
            ->whereIn('status', ['tepat_waktu', 'terlambat'])
            ->update([
                'status' => 'htap',
            ]);

        $this->info("Penutupan hari berhasil! {$affected} presensi guru ditandai sebagai 'HTAP' (Hadir Tanpa Absen Pulang).");

        return Command::SUCCESS;
    }
}
