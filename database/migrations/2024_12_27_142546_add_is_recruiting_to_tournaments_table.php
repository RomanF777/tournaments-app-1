<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
    Schema::table('tournaments', function (Blueprint $table) {
        if (!Schema::hasColumn('tournaments', 'is_recruiting')) {
            $table->boolean('is_recruiting')->default(true);
        }
    });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn('is_recruiting');
        });
    }
};
