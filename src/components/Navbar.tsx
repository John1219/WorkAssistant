import React, { useState } from 'react';
import { useApp, NavTab } from '../context/AppContext';
import {
  CalendarDays,
  Users,
  GraduationCap,
  BarChart3,
  Printer,
  Download,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import ExportModal from './Export/ExportModal';

interface NavbarProps {
  onOpenConflicts: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConflicts, onOpenHelp }) => {
  const { activeTab, setActiveTab, conflicts } = useApp();
  const [showExportModal, setShowExportModal] = useState(false);

  const tabs: { id: NavTab; label: string; mobileLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'schedule', label: 'Schedule Board', mobileLabel: 'Schedule', icon: CalendarDays },
    { id: 'roster', label: 'Employee Roster', mobileLabel: 'Roster', icon: Users },
    { id: 'classes', label: 'Classes & Shifts', mobileLabel: 'Classes', icon: GraduationCap },
    { id: 'summary', label: 'Workload & Stats', mobileLabel: 'Stats', icon: BarChart3 },
    { id: 'print', label: 'Print Duty Sheet', mobileLabel: 'Print', icon: Printer }
  ];

  return (
    <>
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-400 flex items-center justify-center shadow-inner shrink-0">
                <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="font-bold text-base sm:text-lg text-slate-100 tracking-tight truncate">
                    ShiftSync <span className="text-amber-400 font-semibold">Training</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 rounded-full">
                    GitHub Pages
                  </span>
                </div>
                <p className="text-2xs text-slate-400 hidden sm:block truncate">
                  Parking Duty & Class Support Workforce Scheduler
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Actions: Conflicts, Share/Export, Help */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {conflicts.length > 0 && (
                <button
                  onClick={onOpenConflicts}
                  className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors animate-pulse"
                  title="View detected scheduling conflicts"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{conflicts.length}</span>
                  <span className="hidden sm:inline">Conflict{conflicts.length > 1 ? 's' : ''}</span>
                </button>
              )}

              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
                title="Export or Import Schedule & Data"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share / Export</span>
              </button>

              <button
                onClick={onOpenHelp}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Quick Guide & GitHub Pages hosting info"
              >
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Native App Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1 py-1.5 flex items-center justify-around shadow-2xl no-print">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-3xs font-medium transition-all min-h-[46px] ${
                isActive
                  ? 'text-indigo-400 bg-indigo-950/60 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 mb-0.5 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-400'}`} />
              <span className="truncate max-w-[64px]">{tab.mobileLabel}</span>
            </button>
          );
        })}
      </nav>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </>
  );
};
export default Navbar;
