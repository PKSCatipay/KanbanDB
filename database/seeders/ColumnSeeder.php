<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Column;

class ColumnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Column::create(['name' => 'To Do']);
        Column::create(['name' => 'In Progress']);
        Column::create(['name' => 'Done']);
    }
}
