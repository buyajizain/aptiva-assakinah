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
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('school_name', 150)->default('SMK / SMA Negeri Contoh');
            $table->string('logo_path')->nullable();
            $table->decimal('latitude', 10, 8)->default(-6.20000000);
            $table->decimal('longitude', 11, 8)->default(106.81666667);
            $table->unsignedInteger('radius_meters')->default(100);
            $table->json('secondary_locations')->nullable()->comment('Titik lokasi tambahan misal: Gedung B, Lapangan');
            $table->tinyInteger('work_days')->default(6)->comment('5=Senin-Jumat, 6=Senin-Sabtu');
            $table->time('checkin_start')->default('06:00:00');
            $table->time('checkin_limit')->default('07:15:00');
            $table->time('checkout_start')->default('13:00:00');
            $table->string('timezone', 50)->default('Asia/Jakarta');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
