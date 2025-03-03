import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  task: any;
  toggleTask: (id: string, completed: boolean) => void;
  deleteTask: (id: string) => void;
  openModal: (task: any) => void;
}

function SortableItem({ task, toggleTask, deleteTask, openModal }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
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