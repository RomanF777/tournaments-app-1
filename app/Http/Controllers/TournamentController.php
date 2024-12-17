<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tournament;

class TournamentController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:novus,chess,cards',
            'description' => 'nullable|string',
            'novus_type' => 'nullable|string|in:hybrid-tournament,with-bye-round',
        ]);

        $tournament = Tournament::create($validatedData);

        return response()->json([
            'message' => 'Tournament created successfully',
            'tournament' => $tournament,
        ], 201);
    }
}

