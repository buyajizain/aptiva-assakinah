<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekapitulasi Gaji Guru - {{ $payroll['month_name'] }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 12mm 10mm 15mm 10mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 8.5px;
            color: #1a202c;
            line-height: 1.2;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #1a202c;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .school-title {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            letter-spacing: 0.5px;
        }
        .report-title {
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            margin-top: 3px;
        }
        .report-period {
            font-size: 9px;
            text-align: center;
            color: #4a5568;
            margin-top: 2px;
        }
        .matrix-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .matrix-table th, .matrix-table td {
            border: 0.5px solid #718096;
            padding: 4px 3px;
            text-align: center;
        }
        .matrix-table th {
            background-color: #edf2f7;
            font-weight: bold;
            font-size: 8px;
        }
        .teacher-name {
            text-align: left !important;
            padding-left: 6px !important;
            font-weight: bold;
        }
        .text-right {
            text-align: right !important;
            padding-right: 6px !important;
        }
        .font-bold {
            font-weight: bold;
        }
        .bg-total {
            background-color: #e2e8f0;
            font-weight: bold;
        }
        .signatures-table {
            width: 100%;
            margin-top: 25px;
            border: none;
        }
        .signatures-table td {
            border: none;
            width: 50%;
            text-align: center;
            font-size: 9.5px;
        }
        .sig-space {
            height: 45px;
        }
    </style>
</head>
<body>

    <!-- KOP & HEADER SURAT RESMI -->
    <table class="header-table">
        <tr>
            <td style="text-align: center;">
                <div class="school-title">{{ $payroll['school_setting']->school_name }}</div>
                <div class="report-title">DAFTAR REKAPITULASI PEMBAYARAN GAJI & HONORARIUM GURU</div>
                <div class="report-period">
                    Periode: {{ $payroll['month_name'] }} • Tarif Hadir: Rp {{ number_format($payroll['rates']['daily_allowance'], 0, ',', '.') }}/hari
                </div>
            </td>
        </tr>
    </table>

    <!-- TABEL REKAPITULASI GAJI -->
    <table class="matrix-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 25px;">No</th>
                <th rowspan="2" style="width: 150px;">Nama Guru & NIP</th>
                <th rowspan="2" style="width: 60px;">Status</th>
                <th rowspan="2" style="width: 75px;">Gaji Pokok</th>
                <th colspan="3">Kehadiran</th>
                <th colspan="3">Potongan Kehadiran</th>
                <th rowspan="2" style="width: 80px;">Total Potongan</th>
                <th rowspan="2" style="width: 90px; background-color: #e6fffa;">Gaji Bersih (Diterima)</th>
                <th rowspan="2" style="width: 65px;">Tanda Tangan</th>
            </tr>
            <tr>
                <th style="width: 35px;">Hadir</th>
                <th style="width: 55px;">Tarif/Hari</th>
                <th style="width: 75px;">Uang Hadir</th>
                <th style="width: 35px;">Telat</th>
                <th style="width: 35px;">Alpa</th>
                <th style="width: 65px;">Denda</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payroll['teachers'] as $idx => $t)
                <tr>
                    <td>{{ $idx + 1 }}</td>
                    <td class="teacher-name">
                        {{ $t['name'] }}<br>
                        <span style="font-size: 7.5px; color: #718096; font-weight: normal;">NIP: {{ $t['nip'] }}</span>
                    </td>
                    <td>{{ $t['schedule_type'] === 'part_time' ? 'Honorer' : 'Guru Tetap' }}</td>
                    <td class="text-right">Rp {{ number_format($t['base_salary'], 0, ',', '.') }}</td>
                    <td>{{ $t['present_days'] }} hr</td>
                    <td class="text-right">Rp {{ number_format($t['daily_rate'], 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($t['total_allowance'], 0, ',', '.') }}</td>
                    <td>{{ $t['late_count'] > 0 ? $t['late_count'] . 'x' : '-' }}</td>
                    <td>{{ $t['alpa_count'] > 0 ? $t['alpa_count'] . ' hr' : '-' }}</td>
                    <td class="text-right" style="color: #c53030;">
                        {{ $t['total_deductions'] > 0 ? '- Rp ' . number_format($t['total_deductions'], 0, ',', '.') : '-' }}
                    </td>
                    <td class="text-right" style="color: #c53030;">
                        Rp {{ number_format($t['total_deductions'], 0, ',', '.') }}
                    </td>
                    <td class="text-right font-bold" style="background-color: #f0fff4; color: #22543d;">
                        Rp {{ number_format($t['net_salary'], 0, ',', '.') }}
                    </td>
                    <td style="font-size: 7.5px; color: #a0aec0; text-align: left; padding-left: 5px;">
                        {{ $idx + 1 }}. ............
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="13" style="padding: 15px; color: #718096;">Tidak ada data guru yang terdaftar.</td>
                </tr>
            @endforelse

            <!-- BARIS TOTAL KESELURUHAN -->
            <tr class="bg-total">
                <td colspan="3" style="text-align: center; font-weight: bold;">TOTAL KESELURUHAN</td>
                <td class="text-right">Rp {{ number_format($payroll['totals']['total_base_salary'], 0, ',', '.') }}</td>
                <td colspan="2">-</td>
                <td class="text-right">Rp {{ number_format($payroll['totals']['total_allowance'], 0, ',', '.') }}</td>
                <td colspan="2">-</td>
                <td class="text-right" style="color: #c53030;">Rp {{ number_format($payroll['totals']['total_deductions'], 0, ',', '.') }}</td>
                <td class="text-right" style="color: #c53030;">Rp {{ number_format($payroll['totals']['total_deductions'], 0, ',', '.') }}</td>
                <td class="text-right font-bold" style="color: #22543d; font-size: 9.5px;">
                    Rp {{ number_format($payroll['totals']['total_net_salary'], 0, ',', '.') }}
                </td>
                <td>-</td>
            </tr>
        </tbody>
    </table>

    <!-- LEMBAR PENGESAHAN RESMI -->
    <table class="signatures-table">
        <tr>
            <td>
                Mengetahui,<br>
                <strong>Kepala Sekolah</strong>
                <div class="sig-space"></div>
                <u><strong>Drs. H. Ahmad Dahlan, M.Pd</strong></u><br>
                NIP. 197005151995031002
            </td>
            <td>
                Diverifikasi Oleh,<br>
                <strong>Bendahara / Kepala Tata Usaha</strong>
                <div class="sig-space"></div>
                <u><strong>Budi Santoso, S.Kom</strong></u><br>
                NIP. 198501012010011001
            </td>
        </tr>
    </table>

    <div style="margin-top: 15px; border-top: 0.5px solid #cbd5e0; padding-top: 4px; font-size: 7px; color: #a0aec0; text-align: right;">
        Dokumen resmi dicetak otomatis melalui Sistem Presensi Guru &bull; Powered by Aptiva Digital
    </div>

</body>
</html>
