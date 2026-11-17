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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('base_salary')->default(0)->after('schedule_type')->comment('Gaji pokok bulanan atau honor tetap');
            $table->unsignedInteger('custom_daily_allowance')->nullable()->after('base_salary')->comment('Override uang hadir khusus guru ini (null = pakai default sekolah)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['base_salary', 'custom_daily_allowance']);
        });
    }
};
