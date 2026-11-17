<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nip',
        'name',
        'email',
        'phone',
        'password',
        'role',
        'schedule_type',
        'base_salary',
        'custom_daily_allowance',
        'device_id',
        'must_change_password',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'is_active' => 'boolean',
            'base_salary' => 'integer',
            'custom_daily_allowance' => 'integer',
        ];
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function teacherSchedules(): HasMany
    {
        return $this->hasMany(TeacherSchedule::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AttendanceAuditLog::class, 'modified_by');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin_tu';
    }

    public function isKepsek(): bool
    {
        return $this->role === 'kepsek';
    }

    public function isGuru(): bool
    {
        return $this->role === 'guru';
    }
}
