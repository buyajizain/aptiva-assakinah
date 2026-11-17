<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $teacher['name'] }} - {{ $month_name }}</title>
    <style>
        @page {
            size: A5 landscape;
            margin: 8mm 10mm 10mm 10mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 9px;
            color: #1a202c;
            line-height: 1.3;
        }
        .header {
            border-bottom: 2px solid #2b6cb0;
            padding-bottom: 6px;
            margin-bottom: 8px;
            text-align: center;
        }
        .school-name {
            font-size: 13px;
            font-weight: bold;
            color: #2b6cb0;
            text-transform: uppercase;
        }
        .slip-title {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-top: 2px;
        }
        .period {
            font-size: 9px;
            color: #4a5568;
        }
        .info-table {
            width: 100%;
            margin-bottom: 8px;
            font-size: 9px;
        }
        .info-table td {
            padding: 1.5px 0;
        }
        .breakdown-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }
        .breakdown-table th, .breakdown-table td {
            border: 1px solid #cbd5e0;
            padding: 5px 8px;
        }
        .breakdown-table th {
            background-color: #edf2f7;
            font-weight: bold;
            font-size: 9px;
            text-align: left;
        }
        .text-right {
            text-align: right !important;
        }
        .total-box {
            background-color: #ebf8ff;
            border: 1.5px solid #3182ce;
            padding: 8px 12px;
            margin-top: 8px;
            border-radius: 4px;
        }
        .net-amount {
            font-size: 14px;
            font-weight: bold;
            color: #2b6cb0;
        }
        .footer-table {
            width: 100%;
            margin-top: 15px;
            border: none;
        }
        .footer-table td {
            border: none;
            width: 50%;
            text-align: center;
            font-size: 8.5px;
        }
        .sig-space {
            height: 35px;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="school-name">{{ $school_setting->school_name }}</div>
        <div class="slip-title">SLIP GAJI & HONORARIUM GURU</div>
        <div class="period">Periode Pembayaran: {{ $month_name }}</div>
    </div>

    <!-- IDENTITAS GURU -->
    <table class="info-table">
        <tr>
            <td style="width: 15%;">Nama Lengkap</td>
            <td style="width: 35%;">: <strong>{{ $teacher['name'] }}</strong></td>
            <td style="width: 15%;">Tipe Penugasan</td>
            <td style="width: 35%;">: {{ $teacher['schedule_type'] === 'part_time' ? 'Guru Honorer' : 'Guru Tetap' }}</td>
        </tr>
        <tr>
            <td>NIP / ID Guru</td>
            <td>: {{ $teacher['nip'] }}</td>
            <td>Rekap Kehadiran</td>
            <td>: Hadir: {{ $teacher['present_days'] }} hari | Telat: {{ $teacher['late_count'] }}x | Alpa: {{ $teacher['alpa_count'] }} hari</td>
        </tr>
    </table>

    <!-- RINCIAN GAJI & POTONGAN -->
    <table class="breakdown-table">
        <thead>
            <tr>
                <th style="width: 50%;">A. PENDAPATAN (EARNINGS)</th>
                <th style="width: 50%;">B. POTONGAN (DEDUCTIONS)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="vertical-align: top;">
                    <table style="width: 100%; border: none;">
                        <tr>
                            <td style="border: none; padding: 2px 0;">Gaji Pokok / Honor Dasar</td>
                            <td style="border: none; padding: 2px 0;" class="text-right">Rp {{ number_format($teacher['base_salary'], 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 2px 0;">
                                Uang Kehadiran ({{ $teacher['present_days'] }} hari &times; Rp {{ number_format($teacher['daily_rate'], 0, ',', '.') }})
                            </td>
                            <td style="border: none; padding: 2px 0;" class="text-right">Rp {{ number_format($teacher['total_allowance'], 0, ',', '.') }}</td>
                        </tr>
                        <tr style="border-top: 1px dashed #cbd5e0;">
                            <td style="border: none; padding: 4px 0; font-weight: bold;">Total Pendapatan Kotor</td>
                            <td style="border: none; padding: 4px 0; font-weight: bold;" class="text-right">Rp {{ number_format($teacher['gross_salary'], 0, ',', '.') }}</td>
                        </tr>
                    </table>
                </td>
                <td style="vertical-align: top;">
                    <table style="width: 100%; border: none;">
                        <tr>
                            <td style="border: none; padding: 2px 0; color: #c53030;">
                                Denda Keterlambatan ({{ $teacher['late_count'] }}x)
                            </td>
                            <td style="border: none; padding: 2px 0; color: #c53030;" class="text-right">
                                {{ $teacher['total_late_cut'] > 0 ? 'Rp ' . number_format($teacher['total_late_cut'], 0, ',', '.') : 'Rp 0' }}
                            </td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 2px 0; color: #c53030;">
                                Potongan Alpa / Mangkir ({{ $teacher['alpa_count'] }} hr)
                            </td>
                            <td style="border: none; padding: 2px 0; color: #c53030;" class="text-right">
                                {{ $teacher['total_alpa_cut'] > 0 ? 'Rp ' . number_format($teacher['total_alpa_cut'], 0, ',', '.') : 'Rp 0' }}
                            </td>
                        </tr>
                        <tr style="border-top: 1px dashed #cbd5e0;">
                            <td style="border: none; padding: 4px 0; font-weight: bold; color: #c53030;">Total Potongan</td>
                            <td style="border: none; padding: 4px 0; font-weight: bold; color: #c53030;" class="text-right">
                                Rp {{ number_format($teacher['total_deductions'], 0, ',', '.') }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- TOTAL DITERIMA -->
    <div class="total-box">
        <table style="width: 100%; border: none;">
            <tr>
                <td style="border: none;">
                    <span style="font-size: 10px; font-weight: bold; color: #2d3748; text-transform: uppercase;">
                        GAJI BERSIH DITERIMA (TAKE HOME PAY)
                    </span><br>
                    <span style="font-size: 8px; color: #718096; font-style: italic;">
                        * Ditransfer ke rekening penerima atau diserahterimakan tunai.
                    </span>
                </td>
                <td style="border: none; text-align: right;">
                    <span class="net-amount">Rp {{ number_format($teacher['net_salary'], 0, ',', '.') }}</span>
                </td>
            </tr>
        </table>
    </div>

    <!-- TANDA TANGAN -->
    <table class="footer-table">
        <tr>
            <td>
                Penerima,<br><br>
                <div class="sig-space"></div>
                <u><strong>{{ $teacher['name'] }}</strong></u>
            </td>
            <td>
                Bendahara Sekolah,<br><br>
                <div class="sig-space"></div>
                <u><strong>Budi Santoso, S.Kom</strong></u>
            </td>
        </tr>
    </table>

    <div style="margin-top: 15px; border-top: 0.5px solid #cbd5e0; padding-top: 4px; font-size: 7px; color: #a0aec0; text-align: right;">
        Dokumen resmi dicetak otomatis melalui Sistem Presensi Guru &bull; Powered by Aptiva Digital
    </div>

</body>
</html>
