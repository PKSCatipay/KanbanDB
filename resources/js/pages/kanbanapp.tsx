import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import '../../css/app.css';

type Task = {
  id: number;
  content: string;
  column_id: number;
};

type Column = {
  id: number;
  name: string;
  tasks: Task[];
};

type Props = {
  columns: Column[];
};

type DraggedItem = {
  fromColumnId: number;
  task: Task;
} | null;

type DropTarget = {
  toColumnId: number;
  toTaskIndex: number | null;
} | null;

const columnStyles = {
  toDo: { backgroundColor: '#f0f0f0', headerColor: '#2563eb' },
  inProgress: { backgroundColor: '#fff3cd', headerColor: '#ffd900' },
  done: { backgroundColor: '#d4edda', headerColor: '#16a34a' },
};

export default function KanbanApp({ columns: initialColumns }: Props) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedItem, setDraggedItem] = useState<DraggedItem>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  // for creating tasks
  const { data, setData, post, reset } = useForm({
    content: '',
    column_id: initialColumns[0]?.id ?? 0,
  });

  // for deleting tasks
  const { delete: destroy } = useForm({});


  const handleDragStart = (fromColumnId: number, task: Task) => {
    setDraggedItem({ fromColumnId, task });
  };

  const handleDragOverColumn = (e: React.DragEvent<HTMLDivElement>, toColumnId: number) => {
    e.preventDefault();
    const column = columns.find((col) => col.id === toColumnId);
    const toTaskIndex = column?.tasks.length ?? 0;
    setDropTarget({ toColumnId, toTaskIndex });
  };

  const handleDragOverTask = (
    e: React.DragEvent<HTMLDivElement>,
    toColumnId: number,
    toTaskIndex: number
  ) => {
    e.preventDefault();
    console.log('Dragging over task index:', toTaskIndex);
    setDropTarget({ toColumnId, toTaskIndex });
  };

  const handleDrop = () => {
    if (!draggedItem || !dropTarget) return;

    const { fromColumnId, task } = draggedItem;
    const { toColumnId, toTaskIndex } = dropTarget;

    if (
      !task.id ||
      typeof toColumnId !== 'number' ||
      typeof toTaskIndex !== 'number'
    ) {
      console.error('Invalid drop target or task', { task, toColumnId, toTaskIndex });
      return;
    }

    setColumns((cols) => {
      const updates: any[] = [];

      const newCols = cols.map((col) => {
        const isTargetCol = col.id === toColumnId;
        const isSourceCol = col.id === fromColumnId;

        // Get index before removing task
        const fromIdx = isSourceCol
          ? col.tasks.findIndex((t) => t.id === task.id)
          : -1;

        // Remove the task from this column
        let tasks = col.tasks.filter((t) => t.id !== task.id);

        // Insert into target column at correct position
        if (isTargetCol) {
          let insertAt = toTaskIndex;

          // Adjust index if moving within same column and downward
          if (isSourceCol && fromIdx < insertAt) {
            insertAt -= 1;
          }

          console.log("Inserting at:", insertAt);
          console.log("Drop target index:", toTaskIndex);
          console.log("From column:", fromColumnId, "→ To column:", toColumnId);

          tasks.splice(insertAt, 0, { ...task, column_id: toColumnId });

          tasks = tasks.map((t, i) => {
            updates.push({ id: t.id, column_id: toColumnId, position: i });
            return { ...t, position: i };
          });
        }

        return { ...col, tasks };
      });

      router.post('/kanban/reorder', { updates }, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => router.reload({ only: ['columns'] }),
      });

      return newCols;
    });

    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleAddTask = () => {
    if (!data.content.trim()) return;

    post('/kanban', {
      preserveScroll: true,
      onSuccess: () => {
        reset(); // clear form fields
        router.reload({ only: ['columns'] } as any);
      },
      onError: (errors) => {
        console.error('Task creation failed', errors);
      }
    });
  };

  const handleRemoveTask = (columnId: number, taskId: number) => {
    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
          : col
      )
    );

    // Backend sync
    destroy(`/kanban/${taskId}`, {
      preserveScroll: true,
      onError: (errors) => {
        console.error('Failed to delete task', errors);
      },
    });
  };

  return (
    <div className="KanbanBoard">
      <h1 className="TitleHeader">Kanban Board</h1>
      <div className="SearchBar">
        <input
          type="text"
          placeholder="Add new task..."
          value={data.content}
          onChange={(e) => setData('content', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          className="SearchText"
        />
        <select
          value={data.column_id}
          onChange={(e) => setData('column_id', Number(e.target.value))}
          className="DropDownButton"
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
        <button onClick={handleAddTask} className="AddButton">
          Add
        </button>
      </div>

      <div className="FlexContainer">
        {columns.map((column) => {
          const key = column.name.toLowerCase().includes('done')
            ? 'done'
            : column.name.toLowerCase().includes('in progress')
            ? 'inProgress'
            : 'toDo';
          const styles = columnStyles[key as keyof typeof columnStyles];

          return (
            <div
              key={column.id}
              className="Column"
              style={{ backgroundColor: styles.backgroundColor }}
              onDragOver={(e) => handleDragOverColumn(e, column.id)}
              onDrop={handleDrop}
            >
              <div className="ColumnHeader" style={{ backgroundColor: styles.headerColor }}>
                {column.name}
              </div>
              <div className="ColumnBody">
                {column.tasks.length === 0 ? (
                  <div
                    className="EmptyColumnText"
                    onDrop={handleDrop}
                  >
                    Drop Task Here
                  </div>
                ) : (
                  column.tasks.map((task, idx) => (
                    <React.Fragment key={task.id}>
                      <div
                        className="DropZone"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDragOverTask(e, column.id, idx);
                        }}
                        onDrop={handleDrop}
                      />
                      <div
                        className="TaskItem"
                        draggable
                        onDragStart={() => handleDragStart(column.id, task)}
                      >
                        <span style={{ margin: '2px' }}>{task.content}</span>
                        <button
                          onClick={() => handleRemoveTask(column.id, task.id)}
                          className="DeleteButton"
                        >
                          X
                        </button>
                      </div>
                    </React.Fragment>
                  ))
                )}
                <div
                  className="DropZone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDragOverTask(e, column.id, column.tasks.length);
                  }}
                  onDrop={handleDrop}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}