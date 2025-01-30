<?php

// Подключаем пространство имен
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth; // Фасад для работы с авторизацией
use Illuminate\Http\Request; // Класс для обработки HTTP-запросов
use App\Models\Tournament; // Модель турниров
use Inertia\Inertia; // Для работы с интерфейсом через Inertia.js
use App\Models\TournamentMatch; // Модель матчей турнира

class GameController extends Controller
{
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
}