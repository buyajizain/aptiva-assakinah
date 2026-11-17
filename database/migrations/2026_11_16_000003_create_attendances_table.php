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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            
            // Absen Masuk
            $table->time('checkin_time')->nullable();
            $table->decimal('checkin_lat', 10, 8)->nullable();
            $table->decimal('checkin_lng', 11, 8)->nullable();
            $table->float('checkin_accuracy')->nullable();
            $table->string('checkin_photo_path')->nullable();

            // Absen Pulang
            $table->time('checkout_time')->nullable();
            $table->decimal('checkout_lat', 10, 8)->nullable();
            $table->decimal('checkout_lng', 11, 8)->nullable();
            $table->float('checkout_accuracy')->nullable();
            $table->string('checkout_photo_path')->nullable();

            // Status & Keterlambatan
            $table->enum('status', ['tepat_waktu', 'terlambat', 'htap', 'izin', 'sakit', 'dinas_luar', 'alpa'])->default('alpa');
            $table->integer('late_duration_minutes')->default(0);
            $table->boolean('is_manual_correction')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
