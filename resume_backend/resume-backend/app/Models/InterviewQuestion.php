<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InterviewQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'category',
        'difficulty',
        'job_role',
        'ideal_answer',
        'explanation',
    ];

    public function answers()
    {
        return $this->hasMany(InterviewAnswer::class, 'question_id');
    }
}