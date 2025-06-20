<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\Column;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find columns by name
        $toDo = Column::where('name', 'To Do')->first();
        $inProgress = Column::where('name', 'In Progress')->first();
        $done = Column::where('name', 'Done')->first();

        // Create tasks
        Task::create([
            'content' => 'Design login page UI',
            'column_id' => $toDo->id,
            'position' => 0,
        ]);

        Task::create([
            'content' => 'Implement user authentication',
            'column_id' => $toDo->id,
            'position' => 1,
        ]);

        Task::create([
            'content' => 'Set up database schema',
            'column_id' => $inProgress->id,
            'position' => 0,
        ]);

        Task::create([
            'content' => 'Deploy to production server',
            'column_id' => $done->id,
            'position' => 0,
        ]);
    }
}
