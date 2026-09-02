<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('meeting_id')
                ->constrained('meetings')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('status', [
                'present',
                'late',
                'absent',
                'excused'
            ])->default('present');

            $table->timestamp('scanned_at')->nullable();

            $table->timestamps();

            // Prevent the same student from being recorded
            // twice for the same meeting.
            $table->unique([
                'meeting_id',
                'user_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};