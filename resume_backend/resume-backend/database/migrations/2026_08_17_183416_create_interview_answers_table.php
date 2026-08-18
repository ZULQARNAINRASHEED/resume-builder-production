<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_answers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('session_id')
                ->constrained('interview_sessions')
                ->cascadeOnDelete();

            $table->foreignId('question_id')
                ->constrained('interview_questions')
                ->cascadeOnDelete();

            $table->text('user_answer')->nullable();

            $table->text('ai_feedback')->nullable();

            $table->decimal('score', 5, 2)
                ->nullable();

            $table->text('strengths')->nullable();

            $table->text('improvements')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_answers');
    }
};