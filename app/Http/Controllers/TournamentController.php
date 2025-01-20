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
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:novus,chess,cards',
            'novus_type' => 'nullable|string|in:hybrid-tournament,with-bye-round',
            'description' => 'nullable|string',
        ]);

        $tournament = Tournament::create([
            'name' => $validatedData['name'],
            'type' => $validatedData['type'],
            'novus_type' => $validatedData['novus_type'],
            'description' => $validatedData['description'],
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Tournament created successfully',
            'tournament' => $tournament,
        ], 201);
    }

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

    public function show($id)
    {
        $user = Auth::user();
        $tournament = Tournament::findOrFail($id);
        $isAdmin = ($user->id === $tournament->user_id);

        return Inertia::render('TournamentDetails', [
            'tournament' => $tournament,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function destroy($id)
    {
        $tournament = Tournament::findOrFail($id);

        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tournament->delete();

        return response()->json(['message' => 'Tournament deleted successfully']);
    }

    public function follow(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $userId = auth()->id();

        $isParticipant = $tournament->participants()->where('user_id', $userId)->exists();

        if ($isParticipant) {
            $tournament->participants()->detach($userId);

            return response()->json([
                'message' => 'Successfully left the tournament',
                'participants' => $tournament->participants->map(function ($participant) {
                    return ['id' => $participant->id, 'name' => $participant->name];
                }),
                'participant_count' => $tournament->participants()->count(),
            ]);
        } else {
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

    public function startGame(Request $request)
    {
        $tournament = Tournament::findOrFail($request->input('id'));

        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($tournament->participants()->count() < 2) {
            return response()->json(['message' => 'The game cannot start with less than 2 participants.'], 400);
        }

        return redirect()->route('game.show', ['id' => $tournament->id]);
    }

    public function showGame($id)
    {
        $tournament = Tournament::with('participants')->findOrFail($id);

        return Inertia::render('GamePage', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'participants' => $tournament->participants->map(function ($participant) {
                    return [
                        'id' => $participant->id,
                        'name' => $participant->name,
                        
                    ];
                }),
            ],
        ]);
    }

    public function getRecruitingStatus($id)
    {
        $tournament = Tournament::findOrFail($id);
        return response()->json(['isRecruiting' => $tournament->is_recruiting]);
    }

    public function stopRecruiting($id)
    {
        $tournament = Tournament::findOrFail($id);

        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tournament->is_recruiting = false;
        $tournament->save();

        return response()->json(['message' => 'Recruiting stopped successfully']);
    }

    public function startRecruiting($id)
    {
        $tournament = Tournament::findOrFail($id);

        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tournament->is_recruiting = true;
        $tournament->save();

        return response()->json(['message' => 'Recruiting started successfully']);
    }

    public function getFollowStatus($id)
    {
        $tournament = Tournament::findOrFail($id);
        $isFollowing = $tournament->participants()->where('user_id', auth()->id())->exists();

        return response()->json(['isFollowing' => $isFollowing]);
    }

    public function updateBracket(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);

        // Check if the current user is the admin of the tournament
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'bracketData' => 'required|json',
        ]);

        $tournament->update([
            'bracket_data' => $validated['bracketData'],
        ]);

        return response()->json(['message' => 'Bracket updated successfully']);
    }
}
