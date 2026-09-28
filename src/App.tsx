import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ScheduleBoard from './components/Schedule/ScheduleBoard';
import EmployeeList from './components/Roster/EmployeeList';
import ClassManager from './components/Classes/ClassManager';
import ShiftSummary from './components/Reports/ShiftSummary';
import PrintSheet from './components/Print/PrintSheet';
import ConflictModal from './components/Conflicts/ConflictModal';
import HelpModal from './components/Common/HelpModal';
import { CalendarDays } from 'lucide-react';
import GithubIcon from './components/Common/GithubIcon';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [showConflicts, setShowConflicts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenConflicts={() => setShowConflicts(true)}
        onOpenHelp={() => setShowHelp(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'schedule' && <ScheduleBoard />}
        {activeTab === 'roster' && <EmployeeList />}
        {activeTab === 'classes' && <ClassManager />}
        {activeTab === 'summary' && <ShiftSummary />}
        {activeTab === 'print' && <PrintSheet />}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">ShiftSync</span>
            <span>— Workforce Training & Shift Duty Scheduler</span>
          </div>

          <div className="flex items-center space-x-4 text-2xs text-slate-400">
            <span>Built for GitHub Pages</span>
            <span>•</span>
            <button
              onClick={() => setShowHelp(true)}
              className="hover:text-indigo-600 underline font-medium"
            >
              Hosting Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showConflicts && <ConflictModal onClose={() => setShowConflicts(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
