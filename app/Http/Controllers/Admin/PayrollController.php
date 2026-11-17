<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PayrollService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PayrollController extends Controller
{
    /**
     * Tampilkan halaman rekapitulasi penggajian & honorarium guru.
     */
    public function index(Request $request, PayrollService $payrollService): Response
    {
        $now = Carbon::now('Asia/Jakarta');
        $month = (int) $request->input('month', $now->month);
        $year = (int) $request->input('year', $now->year);

        $payrollData = $payrollService->getMonthlyPayrollData($month, $year);

        return Inertia::render('Admin/Payroll/Index', [
            'payroll' => $payrollData,
            'current_month' => $month,
            'current_year' => $year,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Perbarui pengaturan gaji pokok & tarif harian khusus seorang guru.
     */
    public function updateTeacherRate(Request $request, User $teacher): RedirectResponse
    {
        $validated = $request->validate([
            'base_salary' => ['required', 'integer', 'min:0'],
            'custom_daily_allowance' => ['nullable', 'integer', 'min:0'],
        ]);

        $teacher->update([
            'base_salary' => $validated['base_salary'],
            'custom_daily_allowance' => $validated['custom_daily_allowance'] ?: null,
        ]);

        return back()->with('success', "Tarif penggajian untuk {$teacher->name} berhasil diperbarui.");
    }

    /**
     * Ekspor rekapitulasi penggajian bulanan ke Excel (.xlsx).
     */
    public function exportExcel(Request $request, PayrollService $payrollService): BinaryFileResponse
    {
        $now = Carbon::now('Asia/Jakarta');
        $month = (int) $request->input('month', $now->month);
        $year = (int) $request->input('year', $now->year);

        $payrollData = $payrollService->getMonthlyPayrollData($month, $year);

        $tempPath = tempnam(sys_get_temp_dir(), 'payroll_xlsx_');
        $writer = new Writer();
        $writer->openToFile($tempPath);

        // Judul Laporan
        $writer->addRow(Row::fromValues([$payrollData['school_setting']->school_name]));
        $writer->addRow(Row::fromValues(['DAFTAR REKAPITULASI PEMBAYARAN GAJI & HONORARIUM GURU']));
        $writer->addRow(Row::fromValues(["Periode: {$payrollData['month_name']}"]));
        $writer->addRow(Row::fromValues([]));

        // Header
        $headers = [
            'No',
            'Nama Guru',
            'NIP',
            'Tipe Kerja',
            'Gaji Pokok (Rp)',
            'Tarif Hadir/Hari (Rp)',
            'Hari Hadir',
            'Tepat Waktu',
            'Terlambat (Kali)',
            'Alpa (Hari)',
            'Total Uang Hadir (Rp)',
            'Potongan Telat (Rp)',
            'Potongan Alpa (Rp)',
            'Total Potongan (Rp)',
            'Gaji Kotor (Rp)',
            'Gaji Bersih / Take Home Pay (Rp)',
        ];
        $writer->addRow(Row::fromValues($headers));

        // Data Rows
        foreach ($payrollData['teachers'] as $index => $t) {
            $writer->addRow(Row::fromValues([
                $index + 1,
                $t['name'],
                $t['nip'],
                $t['schedule_type'] === 'part_time' ? 'Honorer' : 'Guru Tetap',
                $t['base_salary'],
                $t['daily_rate'],
                $t['present_days'],
                $t['tepat_waktu_count'],
                $t['late_count'],
                $t['alpa_count'],
                $t['total_allowance'],
                $t['total_late_cut'],
                $t['total_alpa_cut'],
                $t['total_deductions'],
                $t['gross_salary'],
                $t['net_salary'],
            ]));
        }

        // Summary Total Row
        $writer->addRow(Row::fromValues([]));
        $writer->addRow(Row::fromValues([
            'TOTAL',
            '',
            '',
            '',
            $payrollData['totals']['total_base_salary'],
            '',
            '',
            '',
            '',
            '',
            $payrollData['totals']['total_allowance'],
            $payrollData['totals']['total_late_cut'],
            $payrollData['totals']['total_alpa_cut'],
            $payrollData['totals']['total_deductions'],
            $payrollData['totals']['total_gross_salary'],
            $payrollData['totals']['total_net_salary'],
        ]));

        $writer->close();

        $safeMonthName = str_replace(' ', '_', $payrollData['month_name']);
        $filename = "Rekap_Gaji_Guru_{$safeMonthName}.xlsx";

        return response()->download($tempPath, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Cetak Laporan Rekapitulasi Pembayaran Gaji Guru Resmi (PDF Landscape).
     */
    public function exportPdf(Request $request, PayrollService $payrollService): HttpResponse
    {
        $now = Carbon::now('Asia/Jakarta');
        $month = (int) $request->input('month', $now->month);
        $year = (int) $request->input('year', $now->year);

        $payrollData = $payrollService->getMonthlyPayrollData($month, $year);

        $pdf = Pdf::loadView('reports.payroll_pdf', [
            'payroll' => $payrollData,
        ])
        ->setPaper('a4', 'landscape')
        ->setOptions([
            'defaultFont' => 'sans-serif',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);

        $safeMonthName = str_replace(' ', '_', $payrollData['month_name']);
        $filename = "Rekap_Gaji_Guru_{$safeMonthName}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Cetak Slip Gaji Digital Resmi Perorangan Guru (PDF Portrait A5 / A4).
     */
    public function slipPdf(Request $request, User $teacher, PayrollService $payrollService): HttpResponse
    {
        $now = Carbon::now('Asia/Jakarta');
        $month = (int) $request->input('month', $now->month);
        $year = (int) $request->input('year', $now->year);

        $payrollData = $payrollService->getMonthlyPayrollData($month, $year);

        $teacherPayroll = collect($payrollData['teachers'])->firstWhere('user_id', $teacher->id);

        if (! $teacherPayroll) {
            abort(404, 'Data penggajian guru tidak ditemukan pada periode ini.');
        }

        $pdf = Pdf::loadView('reports.slip_pdf', [
            'payroll' => $payrollData,
            'teacher' => $teacherPayroll,
            'school_setting' => $payrollData['school_setting'],
            'month_name' => $payrollData['month_name'],
        ])
        ->setPaper('a5', 'landscape')
        ->setOptions([
            'defaultFont' => 'sans-serif',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);

        $safeName = str_replace(' ', '_', $teacher->name);
        $safeMonth = str_replace(' ', '_', $payrollData['month_name']);
        $filename = "Slip_Gaji_{$safeName}_{$safeMonth}.pdf";

        return $pdf->download($filename);
    }
}
