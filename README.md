Kanban Board (Laravel + Inertia.js + React)

Project Description
==========================
A simple Kanban board application where users can:
- Add tasks
- Delete tasks
- Drag and drop tasks within and between columns

Built with:
- Laravel (PHP)
- Inertia.js
- React (TypeScript)

Setup Instructions
==========================

1. Clone the repository:
----------------------------------
git clone https://github.com/your-username/kanban-board.git
cd kanban-board

2. Install backend and frontend dependencies:
----------------------------------
composer install
npm install

3. Create environment file and generate app key:
----------------------------------
cp .env.example .env
php artisan key:generate

4. Configure your database inside the `.env` file:
----------------------------------
DB_DATABASE=mysql
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

5. Run database migrations:
----------------------------------
php artisan migrate

6. Start development servers:
----------------------------------
php artisan serve        # For Laravel backend
npm run dev              # For Vite React frontend

How it works
==========================

- Tasks have `id`, `column_id`, and `position`.
- When dragging a task, its position and column are updated in the database.
- React updates local state, sends position data, and reloads on success.

Files of Importance
==========================

resources/js/Pages/kanbanapp.tsx
routes/web.php  
app/Http/Controllers/KanbanController.php
app/Models/Task.php, Column.php

Future Improvements
==========================

- Add user login
- Create/edit columns
- Drag animations
- Task deadlines or tags

Existing Bugs
==========================
- Rearranging Tasks in Column
  - Bug: Tasks always goes to the bottom (can be seen in Console logs)

If all is set, you can now open your browser at http://localhost:8000 and start using the Kanban board.
Happy Activities!
