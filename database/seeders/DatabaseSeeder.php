<?php

namespace Database\Seeders;

use App\Models\SchoolSetting;
use App\Models\TeacherSchedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Inisialisasi Pengaturan Sekolah
        SchoolSetting::updateOrCreate(
            ['id' => 1],
            [
                'school_name' => 'Yayasan As-Sakinah',
                'latitude' => -6.17539240, // Titik acuan sekolah
                'longitude' => 106.82715300,
                'radius_meters' => 100,
                'secondary_locations' => [
                    [
                        'name' => 'Gedung Workshop / Lab Praktik',
                        'latitude' => -6.17580000,
                        'longitude' => 106.82750000,
                        'radius_meters' => 50,
                    ]
                ],
                'work_days' => 6, // 6 hari (Senin - Sabtu)
                'checkin_start' => '06:00:00',
                'checkin_limit' => '07:15:00',
                'checkout_start' => '13:00:00',
                'timezone' => 'Asia/Jakarta',
            ]
        );

        // 2. Akun Admin Tata Usaha (Sekretaris)
        User::updateOrCreate(
            ['nip' => '198501012010011001'],
            [
                'name' => 'Budi Santoso, S.Kom (Admin TU)',
                'email' => 'admin@sekolah.sch.id',
                'phone' => '081234567890',
                'password' => Hash::make('Admin123!'),
                'role' => 'admin_tu',
                'schedule_type' => 'full_time',
                'must_change_password' => false,
                'is_active' => true,
            ]
        );

        // 3. Akun Kepala Sekolah (Executive Viewer)
        User::updateOrCreate(
            ['nip' => '197005151995031002'],
            [
                'name' => 'Drs. H. Ahmad Dahlan, M.Pd (Kepala Sekolah)',
                'email' => 'kepsek@sekolah.sch.id',
                'phone' => '081234567891',
                'password' => Hash::make('Kepsek123!'),
                'role' => 'kepsek',
                'schedule_type' => 'full_time',
                'must_change_password' => false,
                'is_active' => true,
            ]
        );

        // 4. Akun Guru Tetap (Penuh Waktu)
        User::updateOrCreate(
            ['nip' => '199008202015022003'],
            [
                'name' => 'Siti Rahmawati, S.Pd (Guru Matematika)',
                'email' => 'guru1@sekolah.sch.id',
                'phone' => '081234567892',
                'password' => Hash::make('Guru123!'),
                'role' => 'guru',
                'schedule_type' => 'full_time',
                'must_change_password' => false,
                'is_active' => true,
            ]
        );

        // 5. Akun Guru Honorer / Part-Time (Jadwal Khusus)
        $partTimeTeacher = User::updateOrCreate(
            ['nip' => '199503122020121004'],
            [
                'name' => 'Rian Pratama, S.Pd (Guru Seni Budaya)',
                'email' => 'guru2@sekolah.sch.id',
                'phone' => '081234567893',
                'password' => Hash::make('Guru123!'),
                'role' => 'guru',
                'schedule_type' => 'part_time',
                'must_change_password' => true, // Mengharuskan ganti password saat login pertama
                'is_active' => true,
            ]
        );

        // Jadwal mengajar guru honorer: Senin (1), Rabu (3), Jumat (5)
        foreach ([1, 3, 5] as $day) {
            TeacherSchedule::updateOrCreate(
                [
                    'user_id' => $partTimeTeacher->id,
                    'day_of_week' => $day,
                ],
                [
                    'is_active' => true,
                ]
            );
        }
    }
}
