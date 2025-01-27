<?php

// Подключаем пространство имен
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth; // Фасад для работы с авторизацией
use Illuminate\Http\Request; // Класс для обработки HTTP-запросов
use App\Models\Tournament; // Модель турниров
use Inertia\Inertia; // Для работы с интерфейсом через Inertia.js
use App\Models\TournamentMatch; // Модель матчей турнира

class TournamentController extends Controller
{
    // Метод для создания нового турнира
    public function store(Request $request)
    {
        // Валидируем входные данные
        $validatedData = $request->validate([
            'name' => 'required|string|max:255', // Название турнира обязательно
            'type' => 'required|string|in:novus,chess,cards', // Тип турнира
            'novus_type' => 'nullable|string|in:hybrid-tournament,with-bye-round', // Дополнительный тип для novus
            'description' => 'nullable|string', // Описание турнира
        ]);

        // Создаем новый турнир с указанными данными
        $tournament = Tournament::create([
            'name' => $validatedData['name'],
            'type' => $validatedData['type'],
            'novus_type' => $validatedData['novus_type'],
            'description' => $validatedData['description'],
            'user_id' => auth()->id(), // ID текущего пользователя
        ]);

        // Возвращаем успешный ответ
        return response()->json([
            'message' => 'Tournament created successfully',
            'tournament' => $tournament,
        ], 201);
    }


    // Метод для отображения списка турниров
    public function index()
    {
        // Получаем все турниры с их участниками
        $tournaments = Tournament::with('participants')->get();
        $user = Auth::user(); // Текущий пользователь

        // Отображаем страницу через Inertia.js с преобразованными данными
        return Inertia::render('Tournaments', [
            'tournaments' => $tournaments->map(function ($tournament) use ($user) {
                return [
                    'id' => $tournament->id,
                    'name' => $tournament->name,
                    'type' => $tournament->type,
                    'novus_type' => $tournament->novus_type,
                    'description' => $tournament->description,
                    'user_name' => $tournament->user->name ?? null, // Имя создателя
                    'participants' => $tournament->participants->map(function ($participant) {
                        return ['id' => $participant->id, 'name' => $participant->name]; // Участники турнира
                    }),
                    'isAdmin' => $user->id === $tournament->user_id, // Проверка на права администратора
                ];
            }),
        ]);
    }


    // Метод для отображения конкретного турнира
    public function show($id)
    {
        $user = Auth::user(); // Текущий пользователь
        $tournament = Tournament::findOrFail($id); // Поиск турнира
        $isAdmin = ($user->id === $tournament->user_id); // Проверяем, является ли пользователь админом

        // Возвращаем страницу с подробностями о турнире
        return Inertia::render('TournamentDetails', [
            'tournament' => $tournament,
            'isAdmin' => $isAdmin,
        ]);
    }


    // Метод для удаления турнира
    public function destroy($id)
    {
        $tournament = Tournament::findOrFail($id); // Поиск турнира

        // Проверка прав текущего пользователя
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403); // Ошибка прав доступа
        }

        $tournament->delete(); // Удаляем турнир

        return response()->json(['message' => 'Tournament deleted successfully']); // Успешный ответ
    }


    // Метод для подписки/отписки от турнира
    public function follow(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id); // Находим турнир
        $userId = auth()->id(); // ID текущего пользователя

        // Проверяем, является ли пользователь уже участником
        $isParticipant = $tournament->participants()->where('user_id', $userId)->exists();

        if ($isParticipant) {
            // Если пользователь участник, удаляем его из участников
            $tournament->participants()->detach($userId);

            return response()->json([
                'message' => 'Successfully left the tournament', // Успешное сообщение
                'participants' => $tournament->participants->map(function ($participant) {
                    return ['id' => $participant->id, 'name' => $participant->name];
                }),
                'participant_count' => $tournament->participants()->count(), // Количество участников
            ]);
        } else {
            // Если пользователь не участник, добавляем его
            $tournament->participants()->syncWithoutDetaching($userId);

            return response()->json([
                'message' => 'Successfully followed the tournament', // Успешное сообщение
                'participants' => $tournament->participants->map(function ($participant) {
                    return ['id' => $participant->id, 'name' => $participant->name];
                }),
                'participant_count' => $tournament->participants()->count(), // Количество участников
            ]);
        }
    }


    // Метод для старта игры в турнире
    public function startGame(Request $request)
    {
        $tournament = Tournament::findOrFail($request->input('id')); // Находим турнир по ID

        // Проверяем права администратора
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403); // Ошибка прав доступа
        }

        $participants = $tournament->participants()->get(); // Получаем список участников
        if ($participants->count() < 2) {
            return response()->json(['message' => 'The game cannot start with less than 2 participants.'], 400); // Минимум 2 участника
        }

        // Генерация первого раунда
        $matches = [];
        $shuffledParticipants = $participants->shuffle(); // Перемешиваем участников
        for ($i = 0; $i < $shuffledParticipants->count(); $i += 2) {
            $matches[] = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round' => 1, // Первый раунд
                'participant1_id' => $shuffledParticipants[$i]->id,
                'participant2_id' => $shuffledParticipants[$i + 1]->id ?? null, // Проверка на нечетное число участников
            ]);
        }

        // Возвращаем успешный ответ
        return response()->json(['message' => 'Game started successfully', 'matches' => $matches]);
    }


    // Метод для отображения данных игры
    public function showGame($id)
    {
        $tournament = Tournament::with('participants')->findOrFail($id); // Находим турнир с участниками

        // Возвращаем страницу игры с данными турнира
        return Inertia::render('GamePage', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'bracketData' => $tournament->bracket_data, // Данные для сетки турнира
                'participants' => $tournament->participants->map(function ($participant) {
                    return [
                        'id' => $participant->id,
                        'name' => $participant->name,
                    ];
                }),
            ],
        ]);
    }


    // Метод для получения статуса набора участников
    public function getRecruitingStatus($id)
    {
        $tournament = Tournament::findOrFail($id); // Находим турнир
        return response()->json(['isRecruiting' => $tournament->is_recruiting]); // Возвращаем статус набора
    }


    // Метод для остановки набора участников
    public function stopRecruiting($id)
    {
        $tournament = Tournament::findOrFail($id); // Находим турнир

        // Проверяем права администратора
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403); // Ошибка прав доступа
        }

        $tournament->is_recruiting = false; // Останавливаем набор
        $tournament->save(); // Сохраняем изменения

        return response()->json(['message' => 'Recruiting stopped successfully']);
    }


    // Метод для старта набора участников
    public function startRecruiting($id)
    {
        $tournament = Tournament::findOrFail($id); // Находим турнир

        // Проверяем права администратора
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403); // Ошибка прав доступа
        }

        $tournament->is_recruiting = true; // Начинаем набор
        $tournament->save(); // Сохраняем изменения

        return response()->json(['message' => 'Recruiting started successfully']);
    }


    // Метод для проверки, подписан ли пользователь на турнир
    public function getFollowStatus($id)
    {
        $tournament = Tournament::findOrFail($id); // Находим турнир
        $isFollowing = $tournament->participants()->where('user_id', auth()->id())->exists(); // Проверяем подписку

        return response()->json(['isFollowing' => $isFollowing]);
    }

    // Этот метод обновляет данные сетки турнира (bracket data).
    public function updateBracket(Request $request, Tournament $tournament)
    {
        // Проверяем, является ли пользователь администратором турнира
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403); // Возвращаем ошибку, если прав недостаточно
        }

        // Валидация входящих данных
        $validated = $request->validate([
            'bracketData' => 'required|array', // Убедимся, что это массив
        ]);

        // Логируем входящие данные для отладки
        \Log::info('Bracket Data Received:', $validated['bracketData']);

        // Обновляем данные сетки турнира
        $tournament->update([
            'bracket_data' => $validated['bracketData'], // Сохраняем обновленные данные
        ]);

        return response()->json(['message' => 'Bracket updated successfully!'], 200); // Успешный ответ
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
        // Проверяем, является ли пользователь администратором турнира
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Определяем текущий раунд
        $currentRound = TournamentMatch::where('tournament_id', $tournament->id)->max('round');

        // Получаем все матчи текущего раунда
        $matches = TournamentMatch::where('tournament_id', $tournament->id)
            ->where('round', $currentRound)
            ->get();

        // Проверяем, что для всех матчей выбран победитель
        foreach ($matches as $match) {
            if (!$match->winner_id) {
                return response()->json(['message' => 'All matches must have a winner before advancing.'], 400);
            }
        }

        // Генерация следующего раунда
        $nextRound = $currentRound + 1;
        $winners = $matches->map(fn($match) => $match->winner_id); // Победители текущего раунда
        $newMatches = [];

        // Создаем новые матчи для следующего раунда
        for ($i = 0; $i < $winners->count(); $i += 2) {
            $newMatches[] = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round' => $nextRound,
                'participant1_id' => $winners[$i],
                'participant2_id' => $winners[$i + 1] ?? null, // Учитываем нечетное число участников
            ]);
        }

        return response()->json(['message' => 'Round advanced successfully', 'matches' => $newMatches]);
    }


    // Сохраняет изменения в сетке турнира.
    public function saveChanges(Request $request, Tournament $tournament)
    {
        // Проверяем, что пользователь администратор турнира
        if (auth()->id() !== $tournament->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Валидация входящих данных
        $validated = $request->validate([
            'bracketData' => 'required|array',
        ]);

        $bracketData = $validated['bracketData'];

        // Обновляем или создаем матчи для каждой пары
        foreach ($bracketData as $round) {
            foreach ($round['matches'] as $match) {
                TournamentMatch::updateOrCreate(
                    [
                        'tournament_id' => $tournament->id,
                        'round' => $round['round'],
                        'id' => $match['id'], // ID матча
                    ],
                    [
                        'participant1_id' => $match['participant1']['id'] ?? null,
                        'participant2_id' => $match['participant2']['id'] ?? null,
                        'winner_id' => $match['winner'] ?? null, // Обновляем победителя, если указан
                    ]
                );
            }
        }

        return response()->json(['message' => 'Changes saved successfully!'], 200);
    }


    // Этот метод отображает данные сетки турнира.
    public function showGameBracket($id)
    {
        // Получаем матчи турнира, отсортированные по раунду
        $matches = TournamentMatch::where('tournament_id', $id)
            ->orderBy('round')
            ->get();

        // Группируем матчи по раундам
        $bracketData = $matches->groupBy('round')->map(function ($roundMatches, $round) {
            return [
                'round' => $round,
                'matches' => $roundMatches->map(function ($match) {
                    return [
                        'id' => $match->id,
                        'participant1' => $match->participant1 ? ['id' => $match->participant1_id, 'name' => $match->participant1->name] : null,
                        'participant2' => $match->participant2 ? ['id' => $match->participant2_id, 'name' => $match->participant2->name] : null,
                        'winner' => $match->winner_id,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json(['bracketData' => $bracketData]);
    }



}
