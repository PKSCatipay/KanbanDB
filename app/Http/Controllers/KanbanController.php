<?php

namespace App\Http\Controllers;

use App\Models\Column;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index()
    {
        $columns = Column::with(['tasks' => function ($q) {
            $q->orderBy('position');
        }])->get();

        return Inertia::render('kanbanapp', [
            'columns' => $columns,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:255',
            'column_id' => 'required|exists:columns,id',
        ]);

        $task = Task::create($validated);

        // Return only the new task
        return Inertia::location(route('kanban.index'));
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return Inertia::location(route('kanban.index'));
    }

    public function updateColumn(Request $request, Task $task)
    {
        $validated = $request->validate([
            'column_id' => 'required|exists:columns,id',
        ]);

        $task->update($validated);

        return Inertia::location(route('kanban.index'));
    }

    public function updateContent(Request $request, Task $task)
    {
        $validated = $request->validate([
            'content' => 'sometimes|string|max:255',
        ]);

        $task->update($validated);

        return Inertia::location(route('kanban.index'));
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|integer|exists:tasks,id',
            'updates.*.column_id' => 'required|integer|exists:columns,id',
            'updates.*.position' => 'required|integer',
        ]);

        foreach ($validated['updates'] as $update) {
            Task::where('id', $update['id'])->update([
                'column_id' => $update['column_id'],
                'position' => $update['position'],
            ]);
        }
        return redirect()->route('kanban.index');
    }
}