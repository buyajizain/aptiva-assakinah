# Product Requirements Document (PRD) - MVP (Complete & Developer-Ready)
**Nama Produk:** Aptiva Attend (Sistem Absensi Guru & Staf Sekolah)  
**Pengembang:** Aptiva Digital  
**Versi Dokumen:** 1.2 (Developer-Ready)  
**Status:** Approved for Development  
**Terakhir Diperbarui:** 16 November 2026  

---

## 1. Ringkasan Eksekutif (Executive Summary)
**Aptiva Attend** adalah sistem absensi berbasis *Progressive Web App* (PWA) yang dirancang khusus untuk memenuhi kebutuhan operasional dan administrasi di lingkungan sekolah. Sistem ini menggantikan absensi kertas manual dan mesin *fingerprint* konvensional dengan validasi berbasis lokasi (*geofencing*), kamera interaktif langsung (*in-app live stream*), serta rekapitulasi data kehadiran otomatis bagi Tata Usaha (TU) dan Kepala Sekolah.

### Model Penerapan & Lisensi
* **Arsitektur Penerapan:** **Single-Tenant** (Aplikasi dideploy secara khusus dan terisolasi untuk satu instansi sekolah pada server/hosting/VPS tersendiri).
* **Fokus Nilai:** Stabilitas tinggi, kedaulatan data penuh milik sekolah, proses absensi cepat tanpa unduh aplikasi Play Store/App Store, dan efisiensi pelaporan bulanan TU hingga 80%.

---

## 2. Arsitektur Teknis & Spesifikasi Teknologi (Tech Stack)

| Komponen | Teknologi Terpilih | Catatan & Spesifikasi |
| :--- | :--- | :--- |
| **Backend Framework** | **Laravel 11.x (PHP 8.3+ / 8.4)** | Wajib PHP $\ge$ 8.3.8+ (bebas CVE-2024-4577 & leak keamanan terkini) dengan PHP-FPM aman, ekosistem auth, validasi, dan scheduling cron bawaan. |
| **Frontend / PWA** | **Inertia.js + React / Tailwind CSS** | Pengalaman SPA responsif, interaksi PWA cepat, integrasi native kamera canvas. |
| **PWA Engine** | **Web App Manifest + Service Worker** | Dukungan *Add to Home Screen*, caching aset antarmuka, dan offline retry queue. |
| **Basis Data** | **MySQL 8.0+** | Relasional, performa query tinggi dengan indexing teroptimasi untuk query harian. |
| **Penyimpanan Berkas** | **Local Disk Storage Server** | Folder `storage/app/public/` (symlink ke `public/storage/`). |
| **Retensi Data Berkas** | **Laravel Scheduled Task (Cron)** | Command `attendance:prune-photos` otomatis menghapus foto $> 90$ hari. |

---

## 3. Target Pengguna & Hak Akses (User Personas & RBAC)

| Peran (Role) | Tanggung Jawab Utama | Akses Sistem |
| :--- | :--- | :--- |
| **Guru & Staf (End User)** | Melakukan absen masuk/pulang harian, mengajukan izin/sakit/dinas luar, melihat riwayat pribadi. | PWA Mobile View (Presensi, Izin, Riwayat Pribadi, Profil). |
| **Sekretaris / Tata Usaha (Admin)** | Mengelola data guru (termasuk import massal), validasi izin, koreksi manual data absen darurat, konfigurasi radius & jam kerja, unduh rekap bulanan. | Web Dashboard Admin (Full Operational & Config). |
| **Kepala Sekolah (Executive / Viewer)** | Memantau kedisiplinan guru harian secara agregat, meninjau persentase kehadiran bulanan, verifikasi dan unduh laporan akhir bertanda tangan. | Web Dashboard (Read-Only & Download Laporan). |

---

## 4. Ruang Lingkup Fitur MVP (Scope of Features)

### Modul 1: Autentikasi, Onboarding & Keamanan Perangkat
1. **Onboarding Massal Data Guru (Bulk Import Excel/CSV):**
   * Admin TU dapat mengunduh file template resmi (`.xlsx` / `.csv`).
   * Mengunggah data puluhan/ratusan guru sekaligus (Kolom: *NIP/NUPTK, Nama Lengkap, Email, No. WhatsApp, Tipe Guru*).
   * Sistem otomatis membuat akun dengan kata sandi default (misal format: `Guru` + 4 digit terakhir NIP).
   * **Flag `must_change_password`:** Saat pertama kali login, guru wajib mengganti kata sandi sebelum dapat melakukan absensi.
2. **Device Binding (Cegah Joki Absen):**
   * Setiap akun guru terikat pada 1 perangkat aktif (*Single Active Session* / *Device Fingerprint* tersimpan di kolom `device_id`).
   * Jika akun diakses dari HP lain, sistem akan menolak proses absensi dengan pesan: *"Akun Anda terdaftar di perangkat lain. Hubungi TU untuk reset perangkat."*
   * Tombol **Reset Device Binding** tersedia di dashboard Admin TU jika guru berganti HP atau HP hilang/rusak.
3. **Persistent Session:** Sesi tersimpan aman menggunakan Laravel Sanctum / secure session cookie agar guru tidak perlu login ulang setiap pagi.

### Modul 2: Absensi Geofencing & Kamera Langsung (Core Engine)
1. **Validasi Geofencing & Anti-Fake GPS:**
   * Membaca GPS via `navigator.geolocation` dengan opsi `enableHighAccuracy: true`.
   * **Filter Akurasi GPS:** Sistem menolak proses absensi jika akurasi posisi (`coords.accuracy`) $> 50$ meter untuk mencegah GPS meloncat atau Fake GPS dasar.
   * **Formula Haversine:** Menghitung jarak pengguna terhadap titik koordinat sekolah.
   * Tombol absen hanya aktif jika jarak guru $\le$ radius toleransi (default: 50–100 meter). Mendukung opsi multi-titik koordinat sekolah (misal Gedung Utama & Lapangan).
2. **Live In-App Camera Stream (`getUserMedia`):**
   * Mengaktifkan stream kamera depan langsung di dalam kanvas HTML5 (bukan input file standar) untuk **menutup celah pemilihan foto dari galeri HP**.
   * Foto dikompresi di sisi klien (*client-side canvas*) menjadi resolusi maksimal $800 \times 800\text{ px}$ (format WebP/JPEG, target ukuran berkas $\le 150\text{ KB}$) sebelum diunggah ke server.
   * **Cap Air Otomatis (Canvas Watermark):** Foto secara permanen ditempeli metadata: *Nama Guru, NIP, Waktu Server (WIB/WITA/WIT), Koordinat GPS, dan Status*.
3. **Logika Masuk, Pulang & Lupa Absen:**
   * **Absen Masuk:**
     * Jam Masuk $\le$ Batas Jam Toleransi (misal 07:15) $\rightarrow$ *Tepat Waktu*.
     * Jam Masuk $>$ Batas Jam Toleransi $\rightarrow$ *Terlambat* (durasi keterlambatan tercatat otomatis dalam menit).
   * **Absen Pulang:**
     * Tombol "Absen Pulang" baru terbuka setelah jam pulang minimal (misal $\ge$ 13:00) agar tidak bisa disalahgunakan saat pagi.
   * **Status HTAP (Hadir Tanpa Absen Pulang):** Jika guru sudah absen masuk namun sampai pukul 23:59 tidak melakukan absen pulang, status hari tersebut otomatis menjadi **HTAP**, bukan alpa.
4. **Ketahanan Koneksi & Proteksi Lonjakan (Burst Load Protection):**
   * Debounce & token unik pada tombol submit untuk mencegah pengiriman ganda (*duplicate transaction*) saat guru menekan tombol berulang kali saat sinyal lambat.
   * Service worker PWA menahan payload data jika koneksi putus tiba-tiba dan mengirimkannya otomatis saat sinyal kembali stabil.

### Modul 3: Pengajuan Izin, Sakit & Dinas Luar
1. **Formulir Pengajuan (Guru):**
   * Jenis: *Sakit*, *Izin Keperluan Pribadi*, atau *Dinas Luar*.
   * Rentang tanggal dan keterangan alasan.
   * Unggah dokumen bukti (Surat Dokter / Surat Tugas) langsung tersimpan di direktori lokal server `storage/app/public/leaves/`.
   * **Sakit Mendadak:** Guru dapat mengajukan izin sakit di pagi hari tanpa surat dokter, dengan toleransi unggah berkas susulan maksimal $1 \times 24$ jam.
2. **Workflow Persetujuan (Admin TU):**
   * Menu verifikasi pengajuan dengan opsi: **Setujui** atau **Tolak** (wajib isi alasan jika ditolak).
   * Status yang disetujui otomatis mengupdate rekapitulasi kehadiran guru tersebut.

### Modul 4: Pengaturan Sekolah & Fleksibilitas Jadwal (Admin)
1. **Master Lokasi:** Mengatur titik koordinat lintang/bujur (Google Maps / Leaflet Picker) dan radius toleransi dalam meter.
2. **Jadwal & Tipe Kerja Guru:**
   * Jam masuk, batas toleransi keterlambatan, dan jam buka absen pulang.
   * Pilihan sistem kerja sekolah: 5 hari (Senin–Jumat) atau 6 hari (Senin–Sabtu).
   * **Pengelompokan Kerja:**
     * *Guru Penuh Waktu:* Wajib hadir setiap hari kerja.
     * *Guru Honorer / Jadwal Khusus:* Memilih hari mengajar aktif guru tersebut di sistem, sehingga hari di luar jadwal mengajarnya tidak dihitung alpa.
3. **Kalender Hari Libur:** Menandai libur nasional, libur semester, atau cuti bersama sekolah agar mesin absensi tidak mencatat hari tersebut sebagai alpa.

### Modul 5: Dashboard, Rekapitulasi & Audit Trail (Admin & Kepsek)
1. **Dashboard Harian & Photo Audit Grid:**
   * Metrik kehadiran real-time: Total Hadir, Terlambat, Izin/Sakit, HTAP, dan Belum Absen.
   * **Photo Audit Grid:** Tampilan thumbnail seluruh foto selfie hari ini dalam satu halaman agar TU/Kepsek dapat memverifikasi visual keaslian kehadiran dalam $< 2$ menit tanpa membuka profil satu per satu.
2. **Koreksi Presensi Manual & Audit Trail Log:**
   * Fitur bagi Admin TU untuk mengoreksi data presensi darurat (misal: HP guru rusak/kehabisan baterai namun terkonfirmasi hadir mengajar).
   * **Audit Trail Mandatori:** Setiap pengubahan data wajib mencatat log permanen di tabel audit: *User ID Admin, Waktu, Data Sebelum, Data Sesudah, dan Alasan Koreksi*.
3. **Ekspor Laporan (1-Click Export):**
   * **Excel (`.xlsx`):** Tabel matriks harian per guru (tanggal 1 s/d 31) beserta kolom total agregat (Hadir, Telat, Sakit, Izin, Dinas Luar, HTAP, Alpa).
   * **PDF Siap Cetak:** Format resmi dilengkapi Kop Sekolah, statistik kehadiran, serta kolom tanda tangan Kepala Sekolah dan Petugas Tata Usaha.

---

## 5. Perancangan Skema Basis Data (Database Schema Minimum)

```sql
-- 1. Tabel Pengguna (Users)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nip VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin_tu', 'kepsek', 'guru') DEFAULT 'guru',
    schedule_type ENUM('full_time', 'part_time') DEFAULT 'full_time',
    device_id VARCHAR(255) NULL,
    must_change_password BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- 2. Tabel Jadwal Guru Honorer/Part-Time
CREATE TABLE teacher_schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '1=Senin, ..., 6=Sabtu',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabel Konfigurasi Sekolah
CREATE TABLE school_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(150) NOT NULL,
    logo_path VARCHAR(255) NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INT UNSIGNED DEFAULT 100,
    work_days TINYINT DEFAULT 6 COMMENT '5 atau 6 hari',
    checkin_start TIME DEFAULT '06:00:00',
    checkin_limit TIME DEFAULT '07:15:00',
    checkout_start TIME DEFAULT '13:00:00',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    updated_at TIMESTAMP NULL
);

-- 4. Tabel Transaksi Kehadiran (Attendances)
CREATE TABLE attendances (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    checkin_time TIME NULL,
    checkin_lat DECIMAL(10, 8) NULL,
    checkin_lng DECIMAL(11, 8) NULL,
    checkin_accuracy FLOAT NULL,
    checkin_photo_path VARCHAR(255) NULL,
    checkout_time TIME NULL,
    checkout_lat DECIMAL(10, 8) NULL,
    checkout_lng DECIMAL(11, 8) NULL,
    checkout_accuracy FLOAT NULL,
    checkout_photo_path VARCHAR(255) NULL,
    status ENUM('tepat_waktu', 'terlambat', 'htap', 'izin', 'sakit', 'dinas_luar', 'alpa') DEFAULT 'alpa',
    late_duration_minutes INT DEFAULT 0,
    is_manual_correction BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY unique_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tabel Pengajuan Izin / Sakit / Dinas Luar
CREATE TABLE leave_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('sakit', 'izin', 'dinas_luar') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    attachment_path VARCHAR(255) NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    rejection_note TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Tabel Audit Trail (Log Perubahan Manual)
CREATE TABLE attendance_audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attendance_id BIGINT UNSIGNED NOT NULL,
    modified_by BIGINT UNSIGNED NOT NULL,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE,
    FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- 7. Tabel Hari Libur Sekolah
CREATE TABLE school_holidays (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    description VARCHAR(200) NOT NULL
);
```

---

## 6. Spesifikasi Non-Fungsional & Kepatuhan Server Lokal

1. **Penyimpanan Lokal & Retensi Foto (*Storage Lifecycle*):**
   * Foto disimpan di path: `storage/app/public/attendances/{YYYY}/{MM}/{user_id}_{timestamp}.webp`.
   * Akses publik di-symlink via perintah bawaan: `php artisan storage:link`.
   * **Otomasi Pembersihan (Cron Job):** Command artisan `attendance:prune-photos` dijadwalkan berjalan setiap tanggal 1 dini hari untuk menghapus berkas foto fisik yang berumur $> 90$ hari, menghemat ruang hard disk VPS/server sekolah. Metadata teks dan rekap absensi di database tetap disimpan selamanya.
2. **Kinerja Pagi Hari (*Morning Traffic Spike*):**
   * Indexing pada kolom `(user_id, date)` di tabel `attendances` memastikan pencatatan status absensi berlangsung dalam hitungan milidetik.
   * Kompresi foto dilakukan di browser guru sebelum dikirim, menjaga beban upload jaringan WiFi/seluler sekolah tetap ringan ($\le 150\text{ KB}$ per absensi).
3. **Keamanan Waktu Server (*Server-Side Time Authority*):**
   * Semua penentuan status tepat waktu/terlambat dihitung murni menggunakan waktu server (PHP/MySQL time), kebal terhadap manipulasi setelan jam di smartphone guru.

---

## 7. Fitur di Luar Ruang Lingkup MVP (Fase 2)
* Pengenalan wajah biometrik otomatis berbasis AI (*Face Recognition / Liveness Detection*).
* Integrasi notifikasi WhatsApp Gateway ke wali guru / Kepala Sekolah.
* Perhitungan otomatis tunjangan kinerja atau pemotongan gaji berbasis kehadiran.
* Sinkronisasi data otomatis dengan database Dapodik Kemendikbudristek.

---

## 8. Indikator Keberhasilan (Success Metrics MVP)
* **Keberhasilan Onboarding:** Admin TU mampu mengimpor 100% data akun guru melalui berkas Excel dalam waktu $< 10$ menit.
* **Kelancaran Hari Pertama:** $\ge 95\%$ guru berhasil melakukan absensi masuk mandiri tanpa kendala teknis pada hari pertama peluncuran.
* **Waktu Transaksi Absensi:** Durasi dari membuka icon PWA di HP hingga muncul centang berhasil rata-rata $\le 15$ detik.
* **Kecepatan Pelaporan Akhir Bulan:** Laporan rekapitulasi absensi bulanan siap cetak dalam format PDF/Excel dapat diunduh oleh TU dalam waktu $< 3$ menit.
