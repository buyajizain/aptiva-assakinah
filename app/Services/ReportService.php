<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\SchoolHoliday;
use App\Models\SchoolSetting;
use App\Models\TeacherSchedule;
use App\Models\User;
use Carbon\Carbon;

class ReportService
{
    /**
     * Bangun data matriks presensi bulanan lengkap dengan rekapitulasi agregat.
     *
     * @return array{
     *     month: int,
     *     year: int,
     *     month_name: string,
     *     days_in_month: int,
     *     dates_info: array<int, array{day: int, date: string, is_weekend: bool, is_holiday: bool, holiday_name: string|null}>,
     *     teachers_matrix: array<int, mixed>,
     *     totals: array<string, int>,
     *     school_setting: SchoolSetting
     * }
     */
    public function getMonthlyReportData(int $month, int $year): array
    {
        $setting = SchoolSetting::first() ?? new SchoolSetting();
        $tz = $setting->timezone ?: 'Asia/Jakarta';
        $carbonMonth = Carbon::createFromDate($year, $month, 1, $tz);
        $daysInMonth = $carbonMonth->daysInMonth;
        $monthName = $carbonMonth->locale('id')->isoFormat('MMMM Y');

        // 1. Ambil Kalender Libur pada Bulan Ini
        $startDate = $carbonMonth->copy()->startOfMonth()->format('Y-m-d');
        $endDate = $carbonMonth->copy()->endOfMonth()->format('Y-m-d');

        $holidays = SchoolHoliday::whereBetween('holiday_date', [$startDate, $endDate])
            ->pluck('description', 'holiday_date')
            ->toArray();

        // 2. Petakan Metadata Setiap Tanggal (1..N)
        $datesInfo = [];
        $workDaysOption = (int) ($setting->work_days ?: 6); // 5 atau 6 hari

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $currentDate = Carbon::createFromDate($year, $month, $day, $tz);
            $dateStr = $currentDate->format('Y-m-d');
            $dayOfWeek = $currentDate->dayOfWeekIso; // 1=Senin..7=Minggu

            // Weekend check (jika 5 hari kerja: Sabtu & Minggu libur; jika 6 hari: Minggu libur)
            $isWeekend = $workDaysOption === 5
                ? ($dayOfWeek >= 6)
                : ($dayOfWeek === 7);

            $isHoliday = isset($holidays[$dateStr]);
            $holidayName = $holidays[$dateStr] ?? null;

            $datesInfo[$day] = [
                'day' => $day,
                'date' => $dateStr,
                'day_name' => $currentDate->locale('id')->isoFormat('dd'),
                'is_weekend' => $isWeekend,
                'is_holiday' => $isHoliday,
                'holiday_name' => $holidayName,
            ];
        }

        // 3. Ambil Guru Aktif Beserta Data Presensinya
        $teachers = User::where('role', 'guru')
            ->where('is_active', true)
            ->with(['teacherSchedules'])
            ->orderBy('name')
            ->get();

        $allAttendances = Attendance::whereBetween('date', [$startDate, $endDate])
            ->get()
            ->groupBy('user_id');

        // 4. Bangun Matriks Kehadiran Per Guru
        $teachersMatrix = [];
        $grandTotals = [
            'tepat_waktu' => 0,
            'terlambat' => 0,
            'sakit' => 0,
            'izin' => 0,
            'dinas_luar' => 0,
            'htap' => 0,
            'alpa' => 0,
        ];

        $todayStr = Carbon::now($tz)->format('Y-m-d');

        foreach ($teachers as $teacher) {
            $teacherAttendances = ($allAttendances->get($teacher->id) ?? collect())->keyBy(function ($att) {
                return $att->date instanceof \Carbon\CarbonInterface
                    ? $att->date->format('Y-m-d')
                    : substr((string) $att->date, 0, 10);
            });
            $partTimeDays = $teacher->schedule_type === 'part_time'
                ? $teacher->teacherSchedules->pluck('day_of_week')->toArray()
                : [];

            $daysMatrix = [];
            $counts = [
                'tepat_waktu' => 0,
                'terlambat' => 0,
                'sakit' => 0,
                'izin' => 0,
                'dinas_luar' => 0,
                'htap' => 0,
                'alpa' => 0,
            ];

            $effectiveDays = 0;

            for ($day = 1; $day <= $daysInMonth; $day++) {
                $dateMeta = $datesInfo[$day];
                $dateStr = $dateMeta['date'];
                $carbonCurrent = Carbon::parse($dateStr, $tz);
                $isFutureDate = $dateStr > $todayStr;

                if ($dateMeta['is_weekend'] || $dateMeta['is_holiday']) {
                    $code = '-'; // Libur
                } elseif ($teacher->schedule_type === 'part_time' && ! in_array($carbonCurrent->dayOfWeekIso, $partTimeDays)) {
                    $code = '-'; // Tidak ada jadwal mengajar
                } elseif ($isFutureDate) {
                    $code = ''; // Tanggal mendatang belum berlangsung
                } else {
                    $effectiveDays++;
                    $att = $teacherAttendances->get($dateStr);

                    if (! $att) {
                        $code = 'A'; // Alpa
                        $counts['alpa']++;
                        $grandTotals['alpa']++;
                    } else {
                        switch ($att->status) {
                            case 'tepat_waktu':
                                $code = 'H';
                                $counts['tepat_waktu']++;
                                $grandTotals['tepat_waktu']++;
                                break;
                            case 'terlambat':
                                $code = 'T';
                                $counts['terlambat']++;
                                $grandTotals['terlambat']++;
                                break;
                            case 'sakit':
                                $code = 'S';
                                $counts['sakit']++;
                                $grandTotals['sakit']++;
                                break;
                            case 'izin':
                                $code = 'I';
                                $counts['izin']++;
                                $grandTotals['izin']++;
                                break;
                            case 'dinas_luar':
                                $code = 'D';
                                $counts['dinas_luar']++;
                                $grandTotals['dinas_luar']++;
                                break;
                            case 'htap':
                                $code = 'HT';
                                $counts['htap']++;
                                $grandTotals['htap']++;
                                break;
                            default:
                                $code = 'A';
                                $counts['alpa']++;
                                $grandTotals['alpa']++;
                                break;
                        }
                    }
                }

                $daysMatrix[$day] = $code;
            }

            $totalPresent = $counts['tepat_waktu'] + $counts['terlambat'] + $counts['htap'];
            $totalAttendedAndExcused = $totalPresent + $counts['sakit'] + $counts['izin'] + $counts['dinas_luar'];
            $attendanceRate = $effectiveDays > 0 ? round(($totalAttendedAndExcused / $effectiveDays) * 100, 1) : 100;

            $teachersMatrix[] = [
                'user_id' => $teacher->id,
                'name' => $teacher->name,
                'nip' => $teacher->nip ?: '-',
                'schedule_type' => $teacher->schedule_type,
                'days' => $daysMatrix,
                'counts' => $counts,
                'total_present' => $totalPresent,
                'effective_days' => $effectiveDays,
                'attendance_rate' => $attendanceRate,
            ];
        }

        return [
            'month' => $month,
            'year' => $year,
            'month_name' => $monthName,
            'days_in_month' => $daysInMonth,
            'dates_info' => $datesInfo,
            'teachers_matrix' => $teachersMatrix,
            'totals' => $grandTotals,
            'school_setting' => $setting,
        ];
    }
}
