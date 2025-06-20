<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KanbanController;
use Inertia\Inertia;

/*
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
*/
Route::get('/', [KanbanController::class, 'index'])->name('kanban.index');
Route::post('/kanban', [KanbanController::class, 'store'])->name('kanban.store');
Route::delete('/kanban/{task}', [KanbanController::class, 'destroy'])->name('kanban.destroy');
Route::patch('/kanban/{task}', [KanbanController::class, 'update'])->name('kanban.update');
Route::post('/kanban/reorder', [KanbanController::class, 'reorder'])->name('kanban.reorder');


Route::get('/test', function () {
    return Inertia::render('test');
})->name('test');

/*
Route::get('/kanban', function () {
    return Inertia::render('kanbanapp');
})->name('kboard');
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
