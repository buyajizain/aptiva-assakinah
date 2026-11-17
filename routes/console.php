<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 1. Penutupan presensi harian pukul 23:59: Tandai guru yang lupa absen pulang menjadi status HTAP
Schedule::command('attendance:close-day-htap')->dailyAt('23:59');

// 2. Pembersihan file foto selfie presensi yang berusia > 90 hari setiap tanggal 1 pukul 01:00 dini hari
Schedule::command('attendance:prune-photos --days=90')->monthlyOn(1, '01:00');
