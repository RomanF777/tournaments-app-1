<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'round',
        'participant1_id',
        'participant2_id',
        'winner_id',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function participant1()
    {
        return $this->belongsTo(User::class, 'participant1_id');
    }

    public function participant2()
    {
        return $this->belongsTo(User::class, 'participant2_id');
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_id');
    }
}
