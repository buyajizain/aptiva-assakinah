<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolHoliday extends Model
{
    protected $fillable = [
        'holiday_date',
        'description',
        'is_recurring',
    ];

    protected function casts(): array
    {
        return [
            'holiday_date' => 'date:Y-m-d',
            'is_recurring' => 'boolean',
        ];
    }
}
