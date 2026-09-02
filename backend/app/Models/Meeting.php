<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'title',
        'date',
        'start_time',
        'end_time',
        'location',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}