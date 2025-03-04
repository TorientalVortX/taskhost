// App.tsx
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import SortableItem, { Task, SortableItemProps } from "./SortableItem"; // Import Task and SortableItemProps
import Modal from "react-modal";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

Modal.setAppElement("#root");

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [category, setCategory] = useState("To Do");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const categories = ["To Do", "In Progress", "Done"];

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksQuery = query(collection(db, "tasks"), orderBy("order", "asc"));
      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const taskData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(taskData);
      });
      return () => unsubscribe();
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await addDoc(collection(db, "tasks"), {
      title: newTask.trim(),
      completed: false,
      createdAt: new Date(),
      category,
      order: tasks.length,
    });
    setNewTask("");
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { completed: !completed });
  };

  const deleteTask = async (id: string) => {
    console.log('Deleting task with id:', id);
    const taskRef = doc(db, "tasks", id);
    await deleteDoc(taskRef);
    console.log('Task deleted');
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(newTasks);

    newTasks.forEach(async (task, index) => {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, { order: index });
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const openModal = (task: Task) => {
    console.log('Opening modal for task:', task);
    setSelectedTask(task);
  };
  const closeModal = () => {
    setSelectedTask(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  return (
    <div className="app">
      <button onClick={toggleTheme} className="theme-toggle">
        Toggle to {theme === "dark" ? "light" : "dark"} mode
      </button>
      <div className="section">
        <h2>Add a Task</h2>
        <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-2 md:gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border border-[var(--color-muted)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-200"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 p-2 border border-[var(--color-muted)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-200"
          />
          <button
            type="submit"
            className="bg-[var(--color-primary)] text-[var(--color-text)] px-4 py-2 rounded-lg hover:bg-[var(--color-secondary)] transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Add
          </button>
        </form>
      </div>
      <div className="section">
        <h2>Task List</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat} className="task-list">
                <h2 className="text-lg md:text-xl font-semibold text-[var(--color-primary)] mb-4">
                  {cat}
                </h2>
                <SortableContext
                  items={tasks.filter((task) => task.category === cat).map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tasks
                    .filter((task) => task.category === cat)
                    .map((task) => (
                      <SortableItem
                        key={task.id}
                        id={task.id}
                        task={task}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                        openModal={openModal}
                      />
                    ))}
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
        <Modal
          isOpen={!!selectedTask}
          onRequestClose={closeModal}
          className="modal-content"
          overlayClassName="modal"
          contentLabel="Edit Task Modal"
        >
          {selectedTask && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-[var(--color-primary)]">Edit Task</h2>
              <input
                type="text"
                value={selectedTask.title}
                onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                className="p-2 border border-[var(--color-muted)] rounded-lg w-full bg-[var(--color-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-200"
              />
              <select
                value={selectedTask.category}
                onChange={(e) => setSelectedTask({ ...selectedTask, category: e.target.value })}
                className="p-2 border border-[var(--color-muted)] rounded-lg w-full bg-[var(--color-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-200"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const taskRef = doc(db, "tasks", selectedTask.id);
                    await updateDoc(taskRef, {
                      title: selectedTask.title,
                      category: selectedTask.category,
                    });
                    closeModal();
                  }}
                  className="bg-[var(--color-primary)] text-[var(--color-text)] px-4 py-2 rounded-lg hover:bg-[var(--color-secondary)] transition-all duration-200"
                >
                  Save
                </button>
                <button
                  onClick={closeModal}
                  className="bg-[var(--color-muted)] text-[var(--color-text)] px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default App;
