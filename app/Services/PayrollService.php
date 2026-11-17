<?php

namespace App\Services;

use App\Models\SchoolSetting;
use App\Models\User;
use Carbon\Carbon;

class PayrollService
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Hitung rekapitulasi penggajian & honorarium guru bulanan berbasis data presensi.
     *
     * @return array{
     *     month: int,
     *     year: int,
     *     month_name: string,
     *     school_setting: SchoolSetting,
     *     rates: array{daily_allowance: int, late_cut_amount: int, alpa_cut_amount: int},
     *     teachers: array<int, array{
     *         user_id: int,
     *         name: string,
     *         nip: string,
     *         role: string,
     *         schedule_type: string,
     *         base_salary: int,
     *         daily_rate: int,
     *         present_days: int,
     *         tepat_waktu_count: int,
     *         late_count: int,
     *         alpa_count: int,
     *         leave_count: int,
     *         total_allowance: int,
     *         total_late_cut: int,
     *         total_alpa_cut: int,
     *         total_deductions: int,
     *         gross_salary: int,
     *         net_salary: int
     *     }>,
     *     totals: array{
     *         total_base_salary: int,
     *         total_allowance: int,
     *         total_late_cut: int,
     *         total_alpa_cut: int,
     *         total_deductions: int,
     *         total_gross_salary: int,
     *         total_net_salary: int
     *     }
     * }
     */
    public function getMonthlyPayrollData(int $month, int $year): array
    {
        $setting = SchoolSetting::first() ?? new SchoolSetting();
        $tz = $setting->timezone ?: 'Asia/Jakarta';
        $carbonMonth = Carbon::createFromDate($year, $month, 1, $tz);
        $monthName = $carbonMonth->locale('id')->isoFormat('MMMM Y');

        $defaultDailyRate = (int) ($setting->daily_allowance ?? 50000);
        $defaultLateCut = (int) ($setting->late_cut_amount ?? 10000);
        $defaultAlpaCut = (int) ($setting->alpa_cut_amount ?? 50000);

        // Ambil data matriks presensi bulanan yang sudah terverifikasi
        $reportData = $this->reportService->getMonthlyReportData($month, $year);

        // Petakan matriks per user_id untuk akses cepat
        $matrixByUser = collect($reportData['teachers_matrix'])->keyBy('user_id');

        $teachers = User::where('role', 'guru')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $payrollTeachers = [];
        $grandTotals = [
            'total_base_salary' => 0,
            'total_allowance' => 0,
            'total_late_cut' => 0,
            'total_alpa_cut' => 0,
            'total_deductions' => 0,
            'total_gross_salary' => 0,
            'total_net_salary' => 0,
        ];

        foreach ($teachers as $teacher) {
            $userMatrix = $matrixByUser->get($teacher->id);
            $counts = $userMatrix['counts'] ?? [
                'tepat_waktu' => 0,
                'terlambat' => 0,
                'sakit' => 0,
                'izin' => 0,
                'dinas_luar' => 0,
                'htap' => 0,
                'alpa' => 0,
            ];

            $presentDays = (int) ($counts['tepat_waktu'] + $counts['terlambat'] + $counts['htap']);
            $lateCount = (int) $counts['terlambat'];
            $alpaCount = (int) $counts['alpa'];
            $leaveCount = (int) ($counts['sakit'] + $counts['izin'] + $counts['dinas_luar']);

            // Gaji Pokok & Tarif Harian
            $baseSalary = (int) ($teacher->base_salary ?? 0);
            $dailyRate = $teacher->custom_daily_allowance !== null && $teacher->custom_daily_allowance > 0
                ? (int) $teacher->custom_daily_allowance
                : $defaultDailyRate;

            // Kalkulasi Pendapatan
            $totalAllowance = $presentDays * $dailyRate;
            $grossSalary = $baseSalary + $totalAllowance;

            // Kalkulasi Potongan
            $totalLateCut = $lateCount * $defaultLateCut;
            $totalAlpaCut = $alpaCount * $defaultAlpaCut;
            $totalDeductions = $totalLateCut + $totalAlpaCut;

            // Gaji Bersih (Take Home Pay)
            $netSalary = max(0, $grossSalary - $totalDeductions);

            $payrollTeachers[] = [
                'user_id' => $teacher->id,
                'name' => $teacher->name,
                'nip' => $teacher->nip ?: '-',
                'role' => $teacher->role,
                'schedule_type' => $teacher->schedule_type,
                'base_salary' => $baseSalary,
                'daily_rate' => $dailyRate,
                'present_days' => $presentDays,
                'tepat_waktu_count' => (int) $counts['tepat_waktu'],
                'late_count' => $lateCount,
                'alpa_count' => $alpaCount,
                'leave_count' => $leaveCount,
                'total_allowance' => $totalAllowance,
                'total_late_cut' => $totalLateCut,
                'total_alpa_cut' => $totalAlpaCut,
                'total_deductions' => $totalDeductions,
                'gross_salary' => $grossSalary,
                'net_salary' => $netSalary,
            ];

            // Akumulasi grand total
            $grandTotals['total_base_salary'] += $baseSalary;
            $grandTotals['total_allowance'] += $totalAllowance;
            $grandTotals['total_late_cut'] += $totalLateCut;
            $grandTotals['total_alpa_cut'] += $totalAlpaCut;
            $grandTotals['total_deductions'] += $totalDeductions;
            $grandTotals['total_gross_salary'] += $grossSalary;
            $grandTotals['total_net_salary'] += $netSalary;
        }

        return [
            'month' => $month,
            'year' => $year,
            'month_name' => $monthName,
            'school_setting' => $setting,
            'rates' => [
                'daily_allowance' => $defaultDailyRate,
                'late_cut_amount' => $defaultLateCut,
                'alpa_cut_amount' => $defaultAlpaCut,
            ],
            'teachers' => $payrollTeachers,
            'totals' => $grandTotals,
        ];
    }
}
