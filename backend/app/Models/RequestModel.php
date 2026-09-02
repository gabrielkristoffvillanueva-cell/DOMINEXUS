<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RequestModel extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'user_id',
        'meeting_id',
        'request_type',
        'meeting_date',
        'reason',
        'supporting_document',
        'status',
        'officer_remarks',
    ];

    protected $casts = [
        'meeting_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function meeting()
    {
        return $this->belongsTo(Meeting::class);
    }
}