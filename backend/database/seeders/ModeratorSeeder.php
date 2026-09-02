<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ModeratorSeeder extends Seeder
{
    public function run(): void
    {
        $moderatorId = 'MOD-T4Y';

        $password = 'T4Y@2026';

        $organizationId = 2;

        User::updateOrCreate(
            [
                'student_id' => $moderatorId,
            ],
            [
                'name' => 'T4Y Moderator',

                'student_id' => $moderatorId,

                'section' => 'Moderator',

                'club_role' => 'Moderator',

                'password' => Hash::make($password),

                'organization_id' => $organizationId,

                'unique_id' => 'MOD-T4Y',

                'role' => 'moderator',

                'status' => 'Active',

                'email' => null,

                'digital_signature' => null,
            ]
        );
    }
}