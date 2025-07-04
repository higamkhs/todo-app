import AppContextProvider from './providers/AppContextProvider';
import Sidebar from '../components/Sidebar';
import TodoList from '@/components/TodoList';

export default function Home() {
  return (
    <AppContextProvider>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'linear-gradient(120deg, #1e3a8a 0%, #3b82f6 60%, #1d4ed8 100%)', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start', minHeight: '100vh', padding: 0, margin: 0 }}>
          <TodoList />
        </main>
      </div>
    </AppContextProvider>
  );
}
