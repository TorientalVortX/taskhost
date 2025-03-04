import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define the Task interface to match App.tsx
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  order: number;
  createdAt: Date;
}

// Update SortableItemProps to include id and use Task type
export interface SortableItemProps {
  id: string; // Add id explicitly for SortableContext
  task: Task; // Replace any with Task for stricter typing
  toggleTask: (id: string, completed: boolean) => Promise<void>; // Match App.tsx return type
  deleteTask: (id: string) => Promise<void>; // Match App.tsx return type
  openModal: (task: Task) => void; // Use Task instead of any
}

function SortableItem({ id, task, toggleTask, deleteTask, openModal }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="task-item">
      <span
        onClick={() => toggleTask(task.id, task.completed)}
        className={`flex-1 cursor-pointer ${task.completed ? "line-through text-[var(--color-muted)]" : ""}`}
      >
        {task.title}
      </span>
      <div className="flex space-x-2">
        <button
          onClick={() => {
            console.log('Edit button clicked for task:', task);
            openModal(task);
          }}
          className="bg-[var(--color-primary)] text-[var(--color-text)] px-2 py-1 rounded-xl hover:bg-[var(--color-secondary)] transition-all duration-200"
        >
          Edit
        </button>
        <button
          onClick={() => {
            console.log('Delete button clicked for task:', task);
            deleteTask(task.id);
          }}
          className="bg-red-500 text-[var(--color-text)] px-2 py-1 rounded-xl hover:bg-red-700 transition-all duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default SortableItem;
