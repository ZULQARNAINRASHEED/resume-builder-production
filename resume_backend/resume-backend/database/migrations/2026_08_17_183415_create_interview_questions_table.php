<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_questions', function (Blueprint $table) {
            $table->id();

            $table->string('question');

            $table->string('category')->nullable();
            // technical, behavioral, hr, situational etc.

            $table->string('difficulty')->default('medium');
            // easy, medium, hard

            $table->string('job_role')->nullable();

            $table->text('ideal_answer')->nullable();

            $table->text('explanation')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_questions');
    }
};