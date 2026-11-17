<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Absensi Guru - {{ $report['month_name'] }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 12mm 10mm 15mm 10mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 8px;
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
            margin-top: 6px;
        }
        .matrix-table th, .matrix-table td {
            border: 0.5px solid #718096;
            padding: 3px 1px;
            text-align: center;
        }
        .matrix-table th {
            background-color: #edf2f7;
            font-weight: bold;
            font-size: 7.5px;
        }
        .teacher-name {
            text-align: left !important;
            padding-left: 4px !important;
            white-space: nowrap;
            font-weight: 500;
        }
        .weekend-col {
            background-color: #feb2b2;
            color: #742a2a;
        }
        .holiday-col {
            background-color: #fed7d7;
            color: #9b2c2c;
        }
        .code-H { font-weight: bold; color: #22543d; }
        .code-T { font-weight: bold; color: #b7791f; }
        .code-S { font-weight: bold; color: #c53030; }
        .code-I { font-weight: bold; color: #2b6cb0; }
        .code-D { font-weight: bold; color: #6b46c1; }
        .code-A { font-weight: bold; color: #e53e3e; background-color: #fff5f5; }
        .legend-box {
            margin-top: 10px;
            font-size: 7.5px;
            color: #4a5568;
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
            font-size: 9px;
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
                <div class="school-title">{{ $report['school_setting']->school_name }}</div>
                <div class="report-title">REKAPITULASI DAFTAR HADIR GURU & TENAGA PENDIDIK</div>
                <div class="report-period">Periode: {{ $report['month_name'] }}</div>
            </td>
        </tr>
    </table>

    <!-- TABEL MATRIKS BULANAN (1 s/d N) -->
    <table class="matrix-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 18px;">No</th>
                <th rowspan="2" style="width: 130px;">Nama Guru & NIP</th>
                <th colspan="{{ $report['days_in_month'] }}">Tanggal Presensi</th>
                <th colspan="7">Total Kehadiran</th>
                <th rowspan="2" style="width: 28px;">%</th>
            </tr>
            <tr>
                @for ($d = 1; $d <= $report['days_in_month']; $d++)
                    @php $meta = $report['dates_info'][$d]; @endphp
                    <th class="{{ $meta['is_weekend'] || $meta['is_holiday'] ? 'weekend-col' : '' }}" style="width: 14px;">
                        {{ $d }}<br>
                        <span style="font-size: 6px; font-weight: normal;">{{ $meta['day_name'] }}</span>
                    </th>
                @endfor
                <th style="width: 16px;">H</th>
                <th style="width: 16px;">T</th>
                <th style="width: 16px;">S</th>
                <th style="width: 16px;">I</th>
                <th style="width: 16px;">D</th>
                <th style="width: 18px;">HT</th>
                <th style="width: 16px;">A</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($report['teachers_matrix'] as $index => $row)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td class="teacher-name">
                        {{ $row['name'] }}<br>
                        <span style="font-size: 6.5px; color: #718096;">NIP: {{ $row['nip'] }}</span>
                    </td>
                    @for ($d = 1; $d <= $report['days_in_month']; $d++)
                        @php 
                            $meta = $report['dates_info'][$d];
                            $code = $row['days'][$d];
                        @endphp
                        <td class="{{ ($meta['is_weekend'] || $meta['is_holiday']) && $code === '-' ? 'weekend-col' : '' }} code-{{ $code }}">
                            {{ $code }}
                        </td>
                    @endfor
                    <td style="font-weight: bold;">{{ $row['counts']['tepat_waktu'] }}</td>
                    <td>{{ $row['counts']['terlambat'] }}</td>
                    <td>{{ $row['counts']['sakit'] }}</td>
                    <td>{{ $row['counts']['izin'] }}</td>
                    <td>{{ $row['counts']['dinas_luar'] }}</td>
                    <td>{{ $row['counts']['htap'] }}</td>
                    <td style="{{ $row['counts']['alpa'] > 0 ? 'color: red; font-weight: bold;' : '' }}">
                        {{ $row['counts']['alpa'] }}
                    </td>
                    <td style="font-weight: bold;">{{ $row['attendance_rate'] }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- KETERANGAN KODE (LEGEND) -->
    <div class="legend-box">
        <strong>Keterangan:</strong> 
        <b>H:</b> Hadir Tepat Waktu | 
        <b>T:</b> Terlambat | 
        <b>S:</b> Sakit | 
        <b>I:</b> Izin | 
        <b>D:</b> Dinas Luar | 
        <b>HT:</b> Hadir Tanpa Absen Pulang | 
        <b>A:</b> Alpa/Mangkir | 
        <b>-:</b> Libur / Tidak Terjadwal
    </div>

    <!-- KOLOM TANDA TANGAN RESMI -->
    <table class="signatures-table">
        <tr>
            <td>
                Mengetahui,<br>
                Petugas Tata Usaha
                <div class="sig-space"></div>
                <b>(......................................................)</b><br>
                NIP. ....................................................
            </td>
            <td>
                Ditetapkan di: Jakarta<br>
                Kepala Sekolah {{ $report['school_setting']->school_name }}
                <div class="sig-space"></div>
                <b>(......................................................)</b><br>
                NIP. ....................................................
            </td>
        </tr>
    </table>

    <div style="margin-top: 15px; border-top: 0.5px solid #cbd5e0; padding-top: 4px; font-size: 7px; color: #a0aec0; text-align: right;">
        Dokumen resmi dicetak otomatis melalui Sistem Presensi Guru &bull; Powered by Aptiva Digital
    </div>

</body>
</html>
