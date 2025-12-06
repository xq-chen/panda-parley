import { useEffect, useState } from 'react';
import { useDebateStore } from './store/debateStore';
import { SetupScreen } from './components/SetupScreen';
import { DebateStage } from './components/DebateStage';
import { ControlPanel } from './components/ControlPanel';
import { HistoryModal } from './components/HistoryModal';
import { useDebateController } from './hooks/useDebateController';
import { History, Archive } from 'lucide-react';

function App() {
  const { status, resetSession, archiveSession, messages } = useDebateStore();
  const { nextStep } = useDebateController();
  const [showHistory, setShowHistory] = useState(false);

  // Auto-play loop
  useEffect(() => {
    let timeout: number;
    if (status === 'debating') {
      // Delay between turns for readability
      timeout = window.setTimeout(() => {
        nextStep();
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [status, nextStep]);

  // Show setup if idle
  if (status === 'idle') {
    return (
      <div className="h-screen bg-gradient-to-br from-panda-base to-gray-100 flex items-center justify-center p-4 overflow-y-auto">
        <SetupScreen />

        {/* Access History from landing page */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-3 bg-white/50 hover:bg-white rounded-full text-panda-ink/50 hover:text-panda-ink transition-all"
            title="Archives"
          >
            <History size={24} />
          </button>
        </div>
        <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
      </div>
    );
  }

  const handleArchive = () => {
    archiveSession();
    alert("Session archived successfully!");
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-panda-base to-gray-100 flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-panda-ink/5 bg-white/50 backdrop-blur-sm flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-panda-ink">PandaParley 🐼</h1>

          {/* Archive Button (visible if messages exist) */}
          {messages.length > 0 && (
            <button
              onClick={handleArchive}
              className="p-2 hover:bg-panda-green/10 text-panda-green rounded-full transition-colors"
              title="Save to Archive"
            >
              <Archive size={20} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(true)}
            className="text-panda-ink/50 hover:text-panda-ink transition-colors"
            title="Archives"
          >
            <History size={20} />
          </button>

          <div className="h-4 w-px bg-panda-ink/10"></div>

          <button
            onClick={() => {
              if (messages.length > 0) {
                archiveSession();
                // Optional: notify user?
                // alert("Previous session archived.");
              }
              resetSession();
            }}
            className="text-xs px-3 py-1 rounded-full border border-panda-charcoal/20 hover:bg-panda-charcoal/10 transition-colors"
          >
            Start Over
          </button>
        </div>
      </header>

      {/* Main Stage */}
      <main className="flex-1 overflow-hidden relative">
        <DebateStage />
      </main>

      {/* Controls */}
      <ControlPanel />

      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}

export default App;
