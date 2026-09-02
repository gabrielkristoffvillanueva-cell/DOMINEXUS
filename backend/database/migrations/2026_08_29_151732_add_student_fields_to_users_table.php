<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->string('student_id')
                ->unique()
                ->after('id');

            $table->string('section')
                ->after('student_id');

            $table->string('club_role')
                ->after('section');

            $table->longText('digital_signature')
                ->nullable()
                ->after('club_role');

            $table->string('unique_id')
                ->unique()
                ->after('digital_signature');

            $table->string('status')
                ->default('Active')
                ->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropUnique(['student_id']);
            $table->dropUnique(['unique_id']);

            $table->dropColumn([
                'student_id',
                'section',
                'club_role',
                'digital_signature',
                'unique_id',
                'status',
            ]);
        });
    }
};