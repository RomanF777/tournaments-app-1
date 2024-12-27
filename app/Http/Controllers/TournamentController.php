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
        $tournaments = Tournament::with('participants')->get();
        $user = Auth::user();

        return Inertia::render('Tournaments', [
            'tournaments' => $tournaments->map(function ($tournament) use ($user) {
                return [
                    'id' => $tournament->id,
                    'name' => $tournament->name,
                    'type' => $tournament->type,
                    'novus_type' => $tournament->novus_type,
                    'description' => $tournament->description,
                    'user_name' => $tournament->user->name ?? null,
                    'participants' => $tournament->participants->map(function ($participant) {
                        return ['id' => $participant->id, 'name' => $participant->name];
                    }),
                    'isAdmin' => $user->id === $tournament->user_id,
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


    public function follow(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $userId = auth()->id();

        // Check if the user is already a participant
        $isParticipant = $tournament->participants()->where('user_id', $userId)->exists();

        if ($isParticipant) {
            // If the user is already a participant, remove them (leave the tournament)
            $tournament->participants()->detach($userId);

            return response()->json([
                'message' => 'Successfully left the tournament',
                'participants' => $tournament->participants->map(function ($participant) {
                    return ['id' => $participant->id, 'name' => $participant->name];
                }),
                'participant_count' => $tournament->participants()->count(),
            ]);
        } else {
            // Otherwise, add the user as a participant
            $tournament->participants()->syncWithoutDetaching($userId);

            return response()->json([
                'message' => 'Successfully followed the tournament',
                'participants' => $tournament->participants->map(function ($participant) {
                    return ['id' => $participant->id, 'name' => $participant->name];
                }),
                'participant_count' => $tournament->participants()->count(),
            ]);
        }
    }




}
