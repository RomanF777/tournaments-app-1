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
    ];

    /**
     * Define the relationship to the User model.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**Rename 'tournament_user' */
    public function participants()
    {
    return $this->belongsToMany(User::class, 'tournament_user');
    }
}

