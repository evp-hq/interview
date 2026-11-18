<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Both users log in with the password "password".
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Candidate',
            'email' => 'candidate@example.com',
        ]);

        User::factory()->create([
            'name' => 'Other User',
            'email' => 'other@example.com',
        ]);
    }
}
