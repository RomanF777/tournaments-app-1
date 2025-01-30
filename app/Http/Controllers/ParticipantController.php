<?php

// Подключаем пространство имен
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth; // Фасад для работы с авторизацией
use Illuminate\Http\Request; // Класс для обработки HTTP-запросов
use App\Models\Tournament; // Модель турниров
use Inertia\Inertia; // Для работы с интерфейсом через Inertia.js
use App\Models\TournamentMatch; // Модель матчей турнира

class ParticipantController extends Controller
{
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


            // Метод для проверки, подписан ли пользователь на турнир
    public function getFollowStatus($id)
    {
        $tournament = Tournament::findOrFail($id); // Находим турнир
        $isFollowing = $tournament->participants()->where('user_id', auth()->id())->exists(); // Проверяем подписку

        return response()->json(['isFollowing' => $isFollowing]);
    }



}