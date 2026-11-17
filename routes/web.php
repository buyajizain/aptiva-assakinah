<?php

use App\Http\Controllers\Admin\AttendanceCorrectionController;
use App\Http\Controllers\Admin\LeaveApprovalController;
use App\Http\Controllers\Admin\SchoolSettingController;
use App\Http\Controllers\Admin\TeacherManagementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Presensi & Izin Guru
Route::middleware(['auth'])->group(function () {
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.check-out');

    Route::get('/leaves', [LeaveRequestController::class, 'index'])->name('leaves.index');
    Route::post('/leaves', [LeaveRequestController::class, 'store'])->name('leaves.store');
    Route::post('/leaves/{leaveRequest}/upload', [LeaveRequestController::class, 'uploadAttachment'])->name('leaves.upload-attachment');
});

// Admin TU Routes
Route::middleware(['auth', 'role:admin_tu'])->prefix('admin')->name('admin.')->group(function () {
    // Manajemen Guru
    Route::get('/teachers', [TeacherManagementController::class, 'index'])->name('teachers.index');
    Route::get('/teachers/template', [TeacherManagementController::class, 'downloadTemplate'])->name('teachers.template');
    Route::post('/teachers/import', [TeacherManagementController::class, 'import'])->name('teachers.import');
    Route::post('/teachers/{user}/reset-device', [TeacherManagementController::class, 'resetDevice'])->name('teachers.reset-device');
    Route::post('/teachers/{user}/toggle-active', [TeacherManagementController::class, 'toggleActive'])->name('teachers.toggle-active');

    // Persetujuan Izin
    Route::get('/leaves', [LeaveApprovalController::class, 'index'])->name('leaves.index');
    Route::post('/leaves/{leaveRequest}/approve', [LeaveApprovalController::class, 'approve'])->name('leaves.approve');
    Route::post('/leaves/{leaveRequest}/reject', [LeaveApprovalController::class, 'reject'])->name('leaves.reject');

    // Koreksi Presensi & Audit Logs
    Route::post('/attendance/correct', [AttendanceCorrectionController::class, 'correct'])->name('attendance.correct');
    Route::get('/attendance/audit-logs', [AttendanceCorrectionController::class, 'auditLogs'])->name('attendance.audit-logs');

    // Pengaturan Sekolah & Jadwal
    Route::get('/settings', [SchoolSettingController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SchoolSettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/holidays', [SchoolSettingController::class, 'storeHoliday'])->name('settings.holiday.store');
    Route::delete('/settings/holidays/{holiday}', [SchoolSettingController::class, 'destroyHoliday'])->name('settings.holiday.destroy');
    Route::post('/settings/schedules/{user}', [SchoolSettingController::class, 'updateSchedule'])->name('settings.schedule.update');
});

// Laporan Bulanan & Ekspor PDF / Excel (Admin TU & Kepala Sekolah)
Route::middleware(['auth', 'role:admin_tu,kepsek'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/pdf', [\App\Http\Controllers\Admin\ReportController::class, 'exportPdf'])->name('reports.pdf');
    Route::get('/reports/excel', [\App\Http\Controllers\Admin\ReportController::class, 'exportExcel'])->name('reports.excel');

    // Rekapitulasi Gaji & Honorarium Berbasis Kehadiran
    Route::get('/payroll', [\App\Http\Controllers\Admin\PayrollController::class, 'index'])->name('payroll.index');
    Route::get('/payroll/pdf', [\App\Http\Controllers\Admin\PayrollController::class, 'exportPdf'])->name('payroll.pdf');
    Route::get('/payroll/excel', [\App\Http\Controllers\Admin\PayrollController::class, 'exportExcel'])->name('payroll.excel');
    Route::get('/payroll/slip/{teacher}', [\App\Http\Controllers\Admin\PayrollController::class, 'slipPdf'])->name('payroll.slip');
    Route::post('/payroll/teacher/{teacher}', [\App\Http\Controllers\Admin\PayrollController::class, 'updateTeacherRate'])->name('payroll.update-teacher');
});

require __DIR__.'/auth.php';
