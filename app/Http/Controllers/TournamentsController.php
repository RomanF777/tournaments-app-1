<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class TournamentsController extends Controller
{
    public function index()
    {
        return Inertia::render('Tournaments');
    }
}
