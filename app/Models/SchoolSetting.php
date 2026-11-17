<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    protected $fillable = [
        'school_name',
        'logo_path',
        'latitude',
        'longitude',
        'radius_meters',
        'max_gps_accuracy',
        'daily_allowance',
        'late_cut_amount',
        'alpa_cut_amount',
        'secondary_locations',
        'work_days',
        'checkin_start',
        'checkin_limit',
        'checkout_start',
        'timezone',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'radius_meters' => 'integer',
            'max_gps_accuracy' => 'integer',
            'daily_allowance' => 'integer',
            'late_cut_amount' => 'integer',
            'alpa_cut_amount' => 'integer',
            'secondary_locations' => 'array',
            'work_days' => 'integer',
        ];
    }
}
