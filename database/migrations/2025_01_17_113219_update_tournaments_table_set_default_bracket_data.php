<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateTournamentsTableSetDefaultBracketData extends Migration
{
    public function up()
    {
        Schema::table('tournaments', function (Blueprint $table) {
            // Remove the default value from the JSON column
            $table->json('bracket_data')->nullable()->change(); // Make sure it's nullable
        });
    }

    public function down()
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->json('bracket_data')->nullable()->change(); // Revert to nullable
        });
    }
}


