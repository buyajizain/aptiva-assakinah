<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'checkin_time',
        'checkin_lat',
        'checkin_lng',
        'checkin_accuracy',
        'checkin_photo_path',
        'checkout_time',
        'checkout_lat',
        'checkout_lng',
        'checkout_accuracy',
        'checkout_photo_path',
        'status',
        'late_duration_minutes',
        'is_manual_correction',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'checkin_lat' => 'float',
            'checkin_lng' => 'float',
            'checkin_accuracy' => 'float',
            'checkout_lat' => 'float',
            'checkout_lng' => 'float',
            'checkout_accuracy' => 'float',
            'late_duration_minutes' => 'integer',
            'is_manual_correction' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AttendanceAuditLog::class);
    }
}
