<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class UpdateTournamentUserIdsSeeder extends Seeder
{
    public function run()
    {
        // Get all tournaments
        $tournaments = DB::table('tournaments')->get();

        foreach ($tournaments as $tournament) {
            // You may need to establish a manual mapping if the `user` column is absent
            $user = DB::table('users')->first(); // Example: Assign the first user for now

            if ($user) {
                DB::table('tournaments')
                    ->where('id', $tournament->id)
                    ->update(['user_id' => $user->id]);
            }
        }
    }
}
