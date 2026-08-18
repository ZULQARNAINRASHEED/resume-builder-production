<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InterviewSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_role',
        'difficulty',
        'total_questions',
        'completed_questions',
        'overall_score',
    ];

    protected $casts = [
        'overall_score' => 'decimal:2',
    ];

    public function answers()
    {
        return $this->hasMany(
            InterviewAnswer::class,
            'session_id'
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}