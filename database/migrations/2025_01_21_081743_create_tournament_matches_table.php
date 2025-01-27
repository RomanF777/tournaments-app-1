<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_matches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tournament_id');
            $table->unsignedBigInteger('round');
            $table->unsignedBigInteger('participant1_id')->nullable();
            $table->unsignedBigInteger('participant2_id')->nullable();
            $table->unsignedBigInteger('winner_id')->nullable();
            $table->timestamps();

            $table->foreign('tournament_id')->references('id')->on('tournaments')->onDelete('cascade');
            $table->foreign('participant1_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('participant2_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('winner_id')->references('id')->on('users')->onDelete('set null');
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_matches');
    }
};
