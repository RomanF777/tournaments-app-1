<?php

// Подключаем пространство имен
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth; // Фасад для работы с авторизацией
use Illuminate\Http\Request; // Класс для обработки HTTP-запросов
use App\Models\Tournament; // Модель турниров
use Inertia\Inertia; // Для работы с интерфейсом через Inertia.js
use App\Models\TournamentMatch; // Модель матчей турнира

class RecruitingController extends Controller
{
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
}
