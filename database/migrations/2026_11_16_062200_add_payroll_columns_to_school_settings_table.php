<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->unsignedInteger('daily_allowance')->default(50000)->after('max_gps_accuracy')->comment('Uang kehadiran/transport harian per hari hadir');
            $table->unsignedInteger('late_cut_amount')->default(10000)->after('daily_allowance')->comment('Denda potongan per kejadian keterlambatan');
            $table->unsignedInteger('alpa_cut_amount')->default(50000)->after('late_cut_amount')->comment('Denda potongan per hari alpa/mangkir');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn(['daily_allowance', 'late_cut_amount', 'alpa_cut_amount']);
        });
    }
};
