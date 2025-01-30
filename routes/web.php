<?php

use App\Models\Tournament;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\RecruitingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/create', function () {
        return Inertia::render('Create');
    })->name('create');

    Route::get('/tournaments', function () {
        return Inertia::render('Tournaments');
    })->name('tournaments');

    Route::get('/recent', function () {
        return Inertia::render('Recent');
    })->name('recent');

    Route::get('/quizzes', function () {
        return Inertia::render('Quizzes');
    })->name('quizzes');

    Route::get('/tournaments', [TournamentController::class, 'index'])->name('tournaments.index');
    Route::post('/tournament', [TournamentController::class, 'store']);



    Route::get('/tournament/{id}/recruiting-status', [RecruitingController::class, 'getRecruitingStatus']);
    Route::post('/tournament/{id}/stop-recruiting', [RecruitingController::class, 'stopRecruiting']);
    Route::post('/tournament/{id}/start-recruiting', [RecruitingController::class, 'startRecruiting']);


});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Route::get('/tournament/{id}', [TournamentController::class, 'show'])->name('tournament.show');

// Tournament start the game routes
Route::post('/start-game', [GameController::class, 'startGame'])->name('game.start');
Route::get('/game/{id}', [GameController::class, 'showGame'])->name('game.show');
// Route::post('/tournament/{id}/update-bracket', [GameController::class, 'updateBracket'])
//     ->name('tournament.updateBracket');
Route::post('/game/{tournament}/update-bracket', [GameController::class, 'updateBracket']);
Route::post('/game/{tournament}/save-changes', [TournamentController::class, 'saveChanges']);
Route::get('/game/{id}/bracket', [TournamentController::class, 'showGameBracket']);




Route::get('/tournament/{id}/follow-status', [ParticipantController::class, 'getFollowStatus']);
Route::post('/tournament/{id}/follow', [ParticipantController::class, 'follow']);
Route::delete('/tournament/{id}', [TournamentController::class, 'destroy']);


require __DIR__.'/auth.php';

