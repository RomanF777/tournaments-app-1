<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'novus_type',
        'description',
        'unique_path',
    ];

    /**
     * Define the relationship to the User model.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Define the relationship to the participants.
     */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'tournament_user');
    }

    protected static function boot()
    {
    parent::boot();

    static::creating(function ($tournament) {
        do {
            $uniquePath = 'tournament_' . uniqid();
        } while (Tournament::where('unique_path', $uniquePath)->exists());

        $tournament->unique_path = $uniquePath;
    });
    }

}


