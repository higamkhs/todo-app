'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
}

export default function TodoList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number|null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTodos();
    }
  }, [status, router]);

  const fetchTodos = async () => {
    setLoading(true);
    const response = await fetch('/api/todos');
    const data = await response.json();
    if (Array.isArray(data)) {
      data.sort((a: Todo, b: Todo) => Number(a.completed) - Number(b.completed));
      setTodos(data);
    } else {
      setTodos([]);
    }
    setLoading(false);
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      setLoading(true);
      await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTodo }),
      });
      setNewTodo('');
      fetchTodos();
      inputRef.current?.focus();
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setLoading(true);
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      fetchTodos();
    }
  };

  const deleteTodo = async (id: number) => {
    setLoading(true);
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });
    fetchTodos();
  };

  const startEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const saveEdit = async (id: number) => {
    if (editingTitle.trim()) {
      setLoading(true);
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingTitle }),
      });
      setEditingId(null);
      setEditingTitle('');
      fetchTodos();
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setTodos(items);
  };

  const activeCount = todos.filter(t => !t.completed).length;

  if (status === 'loading') {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Todo List
        </h1>

        {/* Add new todo */}
        <div className="mb-8 flex gap-4">
          <input
            ref={inputRef}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="新しいタスクを追加..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={addTodo}
            disabled={loading || !newTodo.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '追加中...' : '追加'}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            残り: {activeCount}件 / 全体: {todos.length}件
          </div>
        </div>

        {/* Todo list */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {todos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 transition-all ${
                          todo.completed 
                            ? 'border-green-500 opacity-75' 
                            : 'border-blue-500'
                        } ${
                          snapshot.isDragging ? 'rotate-2 scale-105' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                            disabled={loading}
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          
                          {editingId === todo.id ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(todo.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEdit(todo.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <>
                              <div 
                                className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
                                onDoubleClick={() => startEdit(todo.id, todo.title)}
                              >
                                {todo.title}
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(todo.id, todo.title)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                  title="編集"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => deleteTodo(todo.id)}
                                  disabled={loading}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                                  title="削除"
                                >
                                  🗑️
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          作成: {formatDate(todo.createdAt)}
                          {todo.updatedAt !== todo.createdAt && (
                            <> | 更新: {formatDate(todo.updatedAt)}</>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {todos.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            タスクがありません。新しいタスクを追加してください。
          </div>
        )}
      </div>
    </div>
  );
} 