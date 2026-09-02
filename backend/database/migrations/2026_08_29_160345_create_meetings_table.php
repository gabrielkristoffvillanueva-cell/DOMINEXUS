<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();

            $table->string('title');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();

            $table->enum('status', [
                'upcoming',
                'ongoing',
                'completed',
                'cancelled'
            ])->default('upcoming');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};