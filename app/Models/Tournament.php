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
    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

