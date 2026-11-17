<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class ReportController extends Controller
{
    /**
     * Tampilkan antarmuka laporan bulanan dan rekapitulasi kehadiran.
     */
    public function index(Request $request, ReportService $reportService): Response
    {
        $now = Carbon::now('Asia/Jakarta');
        $month = (int) $request->input('month', $now->month);
        $year = (int) $request->input('year', $now->year);

        $reportData = $reportService->getMonthlyReportData($month, $year);

        return Inertia::render('Admin/Reports/Index', [
            'report' => $reportData,
            'current_month' => $month,
            'current_year' => $year,
        ]);
    }

    /**
     * Ekspor laporan bulanan ke format PDF siap cetak resmi.
     */
    public function exportPdf(Request $request, ReportService $reportService): HttpResponse
    {
        $now = Carbon::now('Asia/Jakarta');
        $month = (int) $request->input('month', $now->month);
        $year = (int) $request->input('year', $now->year);

        $reportData = $reportService->getMonthlyReportData($month, $year);

        $pdf = Pdf::loadView('reports.monthly_pdf', [
            'report' => $reportData,
        ])
        ->setPaper('a4', 'landscape')
        ->setOptions([
            'defaultFont' => 'sans-serif',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);

        $safeMonthName = str_replace(' ', '_', $reportData['month_name']);
        $filename = "Laporan_Absensi_Guru_{$safeMonthName}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Ekspor laporan bulanan ke format Excel (.xlsx) native dengan tabel matriks harian.
     */
    public function exportExcel(Request $request, ReportService $reportService): BinaryFileResponse
    {
        $now = Carbon::now('Asia/Jakarta');
        $month = (int) $request->input('month', $now->month);
        $year = (int) $request->input('year', $now->year);

        $reportData = $reportService->getMonthlyReportData($month, $year);

        $tempPath = tempnam(sys_get_temp_dir(), 'report_xlsx_');
        $writer = new Writer();
        $writer->openToFile($tempPath);

        // 1. Judul Laporan
        $writer->addRow(Row::fromValues([$reportData['school_setting']->school_name]));
        $writer->addRow(Row::fromValues(['REKAPITULASI DAFTAR HADIR GURU & TENAGA PENDIDIK']));
        $writer->addRow(Row::fromValues(["Periode: {$reportData['month_name']}"]));
        $writer->addRow(Row::fromValues([])); // Baris kosong

        // 2. Header Kolom
        $headers = ['No', 'Nama Guru', 'NIP', 'Tipe Kerja'];
        for ($d = 1; $d <= $reportData['days_in_month']; $d++) {
            $headers[] = (string) $d;
        }
        $headers = array_merge($headers, [
            'Tepat Waktu (H)',
            'Terlambat (T)',
            'Sakit (S)',
            'Izin (I)',
            'Dinas Luar (D)',
            'HTAP (HT)',
            'Alpa (A)',
            'Total Hadir',
            'Persentase (%)',
        ]);

        $writer->addRow(Row::fromValues($headers));

        // 3. Baris Data Setiap Guru
        foreach ($reportData['teachers_matrix'] as $index => $teacher) {
            $rowValues = [
                $index + 1,
                $teacher['name'],
                $teacher['nip'],
                $teacher['schedule_type'] === 'part_time' ? 'Honorer' : 'Penuh Waktu',
            ];

            // Tambahkan nilai kode setiap tanggal (1..N)
            for ($d = 1; $d <= $reportData['days_in_month']; $d++) {
                $rowValues[] = $teacher['days'][$d] ?: '';
            }

            // Tambahkan total agregat
            $rowValues[] = $teacher['counts']['tepat_waktu'];
            $rowValues[] = $teacher['counts']['terlambat'];
            $rowValues[] = $teacher['counts']['sakit'];
            $rowValues[] = $teacher['counts']['izin'];
            $rowValues[] = $teacher['counts']['dinas_luar'];
            $rowValues[] = $teacher['counts']['htap'];
            $rowValues[] = $teacher['counts']['alpa'];
            $rowValues[] = $teacher['total_present'];
            $rowValues[] = $teacher['attendance_rate'] . '%';

            $writer->addRow(Row::fromValues($rowValues));
        }

        // 4. Baris Keterangan / Legenda
        $writer->addRow(Row::fromValues([]));
        $writer->addRow(Row::fromValues(['Keterangan Kode:']));
        $writer->addRow(Row::fromValues(['H: Hadir Tepat Waktu | T: Terlambat | S: Sakit | I: Izin | D: Dinas Luar | HT: Hadir Tanpa Absen Pulang | A: Alpa/Mangkir | -: Libur / Tidak Terjadwal']));

        $writer->close();

        $safeMonthName = str_replace(' ', '_', $reportData['month_name']);
        $downloadFilename = "Laporan_Absensi_Guru_{$safeMonthName}.xlsx";

        return response()->download($tempPath, $downloadFilename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
}
