<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Tournament;
use Inertia\Inertia;

class TournamentController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            // 'user' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:novus,chess,cards',
            'novus_type' => 'nullable|string|in:hybrid-tournament,with-bye-round',
            'description' => 'nullable|string',
        ]);

        // $tournament = Tournament::create($validatedData);
        // Associate the tournament with the authenticated user's ID.
        $tournament = Tournament::create([
            'name' => $validatedData['name'],
            'type' => $validatedData['type'],
            'novus_type' => $validatedData['novus_type'],
            'description' => $validatedData['description'],
            'user_id' => auth()->id(), // Ensure user_id is set correctly
        ]);

        return response()->json([
            'message' => 'Tournament created successfully',
            'tournament' => $tournament,
        ], 201);
    }

    // public function index()
    // {
    // $tournaments = Tournament::all();
    // $user = Auth::user();

    // return Inertia::render('Tournaments', [
    //     'tournaments' => $tournaments->map(function ($tournament) use ($user) {
    //         // Check if the user is the creator (admin)
    //         $tournament->isAdmin = $user->id === $tournament->user_id;
    //         return $tournament;
    //     }),
    // ]);
    // }

    public function index()
{
    // Retrieve all tournaments with the user information
    $tournaments = Tournament::with('user')->get();

    $user = Auth::user();

    return Inertia::render('Tournaments', [
        'tournaments' => $tournaments->map(function ($tournament) use ($user) {
            return [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'type' => $tournament->type,
                'novus_type' => $tournament->novus_type,
                'description' => $tournament->description,
                'user_name' => $tournament->user->name ?? null, // Get the user's name
                'isAdmin' => $user->id === $tournament->user_id, // Check admin status
            ];
        }),
    ]);
}


    // Show specific tournament
    public function show($id)
    {
        // Get the current logged-in user
        $user = Auth::user();

        // Find the tournament by ID
        $tournament = Tournament::findOrFail($id);

        // Check if the logged-in user is the creator (admin) of the tournament
        $isAdmin = ($user->id === $tournament->user_id);

        // Return the tournament data along with the isAdmin flag to the frontend (Inertia.js view)
        return Inertia::render('TournamentDetails', [
            'tournament' => $tournament,
            'isAdmin' => $isAdmin, // Pass the admin status to the view
        ]);
    }


    public function destroy($id)
    {
    $tournament = Tournament::findOrFail($id);

    // Check if the user is the creator of the tournament
    if (auth()->id() !== $tournament->user_id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Proceed with deletion
    $tournament->delete();

    return response()->json(['message' => 'Tournament deleted successfully']);
    }

}


// CREATE TABLE tournaments (
//     id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
//     user_id VARCHAR(255) NOT NULL,
//     name VARCHAR(255) NOT NULL,
//     type ENUM('novus', 'chess', 'cards') NOT NULL,
//     description TEXT NULL,
//     novus_type ENUM('hybrid-tournament', 'with-bye-round') NULL,
//     created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );

// ALTER TABLE tournaments MODIFY description VARCHAR(333) NULL;
