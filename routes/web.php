<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KanbanController;
use App\Http\Controllers\UserController;
use Inertia\Inertia;

Route::get('/', [KanbanController::class, 'index'])->name('kanban.index');
Route::post('/kanban', [KanbanController::class, 'store'])->name('kanban.store');
Route::delete('/kanban/{task}', [KanbanController::class, 'destroy'])->name('kanban.destroy');
Route::patch('/kanban/{task}/column', [KanbanController::class, 'updateColumn'])->name('kanban.updateColumn');
Route::patch('/kanban/{task}/content', [KanbanController::class, 'updateContent'])->name('kanban.updateContent');
Route::post('/kanban/reorder', [KanbanController::class, 'reorder'])->name('kanban.reorder');

Route::get('/home', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/register', [UserController::class, 'showRegister'])->name('show.register');
Route::get('/login', [UserController::class, 'showLogin'])->name('show.login');

Route::get('/test', function () {
    return Inertia::render('test');
})->name('test');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
