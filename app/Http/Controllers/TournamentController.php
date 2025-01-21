<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Tournament;
use Inertia\Inertia;
use App\Models\TournamentMatch;
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

        $participants = $tournament->participants()->get();
        if ($participants->count() < 2) {
            return response()->json(['message' => 'The game cannot start with less than 2 participants.'], 400);
        }

        // Генерация первого раунда
        $matches = [];
        $shuffledParticipants = $participants->shuffle();
        for ($i = 0; $i < $shuffledParticipants->count(); $i += 2) {
            $matches[] = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round' => 1,
                'participant1_id' => $shuffledParticipants[$i]->id,
                'participant2_id' => $shuffledParticipants[$i + 1]->id ?? null, // Если нечетное число участников
            ]);
        }

        return response()->json(['message' => 'Game started successfully', 'matches' => $matches]);
    }


    public function showGame($id)
    {
        $tournament = Tournament::with('participants')->findOrFail($id);

        return Inertia::render('GamePage', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'bracketData' => $tournament->bracket_data, // Убедитесь, что это добавлено
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

    public function updateBracket(Request $request, Tournament $tournament)
    {
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'bracketData' => 'required|array', // Ensure it’s an array
        ]);

        // Log the incoming data for debugging
        \Log::info('Bracket Data Received:', $validated['bracketData']);

        // Update the tournament's bracket data
        $tournament->update([
            'bracket_data' => $validated['bracketData'], // Store the updated bracket data
        ]);

        return response()->json(['message' => 'Bracket updated successfully!'], 200);
    }


    public function updateWinner(Request $request, Tournament $tournament)
    {
        // Проверяем, что пользователь — админ турнира
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Валидация входных данных
        $validated = $request->validate([
            'matchId' => 'required|exists:tournament_matches,id',
            'winnerId' => 'required|exists:users,id',
        ]);

        // Обновление записи в таблице tournament_matches
        $match = \App\Models\TournamentMatch::findOrFail($validated['matchId']);
        $match->winner_id = $validated['winnerId'];
        $match->save();

        return response()->json(['message' => 'Winner updated successfully!'], 200);
    }


    public function advanceRound(Request $request, Tournament $tournament)
    {
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $currentRound = TournamentMatch::where('tournament_id', $tournament->id)->max('round');
        $matches = TournamentMatch::where('tournament_id', $tournament->id)
            ->where('round', $currentRound)
            ->get();

        // Проверяем, что все победители выбраны
        foreach ($matches as $match) {
            if (!$match->winner_id) {
                return response()->json(['message' => 'All matches must have a winner before advancing.'], 400);
            }
        }

        // Генерация следующего раунда
        $nextRound = $currentRound + 1;
        $winners = $matches->map(fn($match) => $match->winner_id);
        $newMatches = [];
        for ($i = 0; $i < $winners->count(); $i += 2) {
            $newMatches[] = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round' => $nextRound,
                'participant1_id' => $winners[$i],
                'participant2_id' => $winners[$i + 1] ?? null,
            ]);
        }

        return response()->json(['message' => 'Round advanced successfully', 'matches' => $newMatches]);
    }



}
