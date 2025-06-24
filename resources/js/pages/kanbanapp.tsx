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

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

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
      const newCols = [...cols];

      const sourceColIndex = newCols.findIndex((col) => col.id === fromColumnId);
      const targetColIndex = newCols.findIndex((col) => col.id === toColumnId);
      if (sourceColIndex === -1 || targetColIndex === -1) return cols;

      const taskToMove = newCols[sourceColIndex].tasks.find((t) => t.id === task.id);
      if (!taskToMove) return cols;

      // Remove from source
      newCols[sourceColIndex].tasks = newCols[sourceColIndex].tasks.filter(
        (t) => t.id !== task.id
      );

      // Adjust target index if moving within same column and downward
      let insertIndex = toTaskIndex;
      if (fromColumnId === toColumnId) {
        const originalIndex = cols[sourceColIndex].tasks.findIndex((t) => t.id === task.id);
        if (originalIndex < toTaskIndex) {
          insertIndex -= 1;
        }
      }

      // Insert into target
      newCols[targetColIndex].tasks.splice(insertIndex, 0, {
        ...taskToMove,
        column_id: toColumnId,
      });

      // Recalculate positions
      const updates = newCols[targetColIndex].tasks.map((t, i) => ({
        id: t.id,
        column_id: toColumnId,
        position: i,
      }));

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
        reset();
        router.reload({ only: ['columns'] });
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

  const handleUpdateTaskContent = (taskId: number) => {
    const trimmed = editedContent.trim();
    if (!trimmed) return;

    router.patch(`/kanban/${taskId}/content`, { content: trimmed }, {
      preserveScroll: true,
      onSuccess: () => {
        setEditingTaskId(null);
        router.reload({ only: ['columns'] });
      },
      onError: (err) => console.error('Update failed', err),
    });
  };

  return (
    <div className="KanbanBoard">
      <h1 className="TitleHeader">Kanban Board</h1>
      <div className="underline"></div>
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
            <option key={col.id} value={col.id}>{col.name}</option>
          ))}
        </select>
        <button onClick={handleAddTask} className="AddButton">Add</button>
      </div>

      <div className="FlexContainer">
        {columns.map((column) => {
          let key: 'toDo' | 'inProgress' | 'done';
          const lowerName = column.name.toLowerCase();

          if (lowerName.includes('done')) {
            key = 'done';
          } else if (lowerName.includes('in progress')) {
            key = 'inProgress';
          } else {
            key = 'toDo';
          }

          const styles = columnStyles[key];

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
                {column.tasks.length === 0 && (
                  <div className="EmptyColumnText">Drop Tasks Here</div>
                )}
                {column.tasks.map((task, idx) => (
                  <React.Fragment key={task.id}>
                    <div
                      className="DropZone"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDragOverTask(e, column.id, idx+1);
                      }}
                      onDrop={handleDrop}
                    />
                    <div className="TaskItem" draggable onDragStart={() => handleDragStart(column.id, task)}>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        {editingTaskId === task.id ? (
                          <input
                            type="text"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateTaskContent(task.id);
                              if (e.key === 'Escape') setEditingTaskId(null);
                            }}
                            style={{ width: '100%' }}
                            autoFocus
                          />
                        ) : (
                          <span>{task.content}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditedContent(task.content);
                          }}
                          className="EditButton"
                        >
                          ✎
                        </button>
                        <button onClick={() => handleRemoveTask(column.id, task.id)} className="DeleteButton">
                          X
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
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