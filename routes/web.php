<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TournamentController;
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

});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Tournament routes
Route::post('/tournament', [TournamentController::class, 'store']);

require __DIR__.'/auth.php';

