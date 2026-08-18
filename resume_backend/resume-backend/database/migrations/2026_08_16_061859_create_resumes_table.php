<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('title')->nullable();

            $table->text('content')->nullable();

            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();

            $table->string('status')->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resumes');
    }
};