import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { AppState, Employee, TrainingClass, Shift, Assignment, TaskType, ScheduleConflict } from '../types';
import { loadStoredState, saveStoredState } from '../utils/storage';
import { getInitialData } from '../utils/initialData';
import { autoScheduleShifts, detectConflicts } from '../utils/scheduler';
import { subscribeToWorkspace, pushWorkspaceState, SyncStatus } from '../services/firebase';
import confetti from 'canvas-confetti';

export type NavTab = 'schedule' | 'roster' | 'classes' | 'summary' | 'print';

interface AppContextType {
  state: AppState;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  conflicts: ScheduleConflict[];
  selectedClass: TrainingClass | undefined;
  classShifts: Shift[];

  // Cloud Real-Time Sync
  syncStatus: SyncStatus;
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
  lastSyncTime: Date | null;
  forceCloudSync: () => Promise<void>;

  // Employee actions
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  bulkAddEmployees: (names: string[], defaultRoles?: string[]) => void;

  // Class actions
  addClass: (cls: Omit<TrainingClass, 'id'>) => TrainingClass;
  updateClass: (id: string, updates: Partial<TrainingClass>) => void;
  deleteClass: (id: string) => void;
  setSelectedClassId: (id: string | null) => void;

  // Shift actions
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  deleteShift: (id: string) => void;

  // Assignment actions
  assignEmployee: (shiftId: string, taskId: string, employeeId: string) => void;
  removeAssignment: (assignmentId: string) => void;
  removeShiftTaskAssignment: (shiftId: string, taskId: string, employeeId: string) => void;
  clearClassAssignments: (classId?: string) => void;
  runAutoSchedule: (preserveExisting?: boolean) => { filled: number; total: number; unfilledCount: number };

  // Task Types
  addTaskType: (task: TaskType) => void;

  // State import/reset
  importState: (imported: Partial<AppState>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to resolve workspace ID from query param or localStorage
const getInitialWorkspaceId = (): string => {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlTeam = params.get('team') || params.get('workspace');
    if (urlTeam && urlTeam.trim()) {
      const clean = urlTeam.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      localStorage.setItem('training_scheduler_workspace_id', clean);
      return clean;
    }
    return localStorage.getItem('training_scheduler_workspace_id') || 'default';
  } catch {
    return 'default';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadStoredState();
    // Default to 'all' on startup
    return {
      ...loaded,
      selectedClassId: loaded.selectedClassId === 'class-sample-1' ? 'all' : (loaded.selectedClassId || 'all')
    };
  });
  const [activeTab, setActiveTab] = useState<NavTab>('schedule');

  // Cloud Real-Time Sync State
  const [workspaceId, setWorkspaceIdState] = useState<string>(getInitialWorkspaceId);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const isRemoteUpdateRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  const hasInitializedFromCloudRef = useRef(false);

  const setWorkspaceId = (id: string) => {
    const clean = (id || 'default').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    localStorage.setItem('training_scheduler_workspace_id', clean);
    setWorkspaceIdState(clean);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('team', clean);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  // Real-time listener for incoming Firestore updates
  useEffect(() => {
    setSyncStatus('syncing');
    hasInitializedFromCloudRef.current = false;

    const unsubscribe = subscribeToWorkspace(
      workspaceId,
      cloudData => {
        setSyncStatus('connected');
        setLastSyncTime(new Date());

        // If cloud document has data, merge into local state
        if (cloudData && (cloudData.classes || cloudData.shifts || cloudData.employees)) {
          isRemoteUpdateRef.current = true;
          setState(prev => ({
            ...prev,
            employees: cloudData.employees ?? prev.employees,
            classes: cloudData.classes ?? prev.classes,
            shifts: cloudData.shifts ?? prev.shifts,
            assignments: cloudData.assignments ?? prev.assignments,
            taskTypes: cloudData.taskTypes ?? prev.taskTypes,
            selectedClassId:
              cloudData.selectedClassId !== undefined ? cloudData.selectedClassId : prev.selectedClassId
          }));
          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 150);
        } else if (!hasInitializedFromCloudRef.current) {
          // Cloud workspace doc is new/empty -> Seed with local state
          hasInitializedFromCloudRef.current = true;
          pushWorkspaceState(workspaceId, state).catch(err => {
            console.warn('[Sync] Initial push error:', err);
          });
        }
      },
      err => {
        console.warn('[Sync] Listener error:', err);
        setSyncStatus('offline');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [workspaceId]);

  // Outbound sync: Debounced push to Firestore on local state change
  useEffect(() => {
    // Always persist to localStorage for offline access
    saveStoredState(state);

    // If update arrived from Firestore, do NOT echo it back
    if (isRemoteUpdateRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    setSyncStatus('syncing');
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        await pushWorkspaceState(workspaceId, state);
        setSyncStatus('connected');
        setLastSyncTime(new Date());
      } catch (err) {
        console.warn('[Sync] Failed to push state to Firestore:', err);
        setSyncStatus('offline');
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state, workspaceId]);

  const forceCloudSync = async () => {
    setSyncStatus('syncing');
    try {
      await pushWorkspaceState(workspaceId, state);
      setSyncStatus('connected');
      setLastSyncTime(new Date());
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  // Selected training class (undefined if 'all')
  const selectedClass = useMemo(() => {
    if (!state.selectedClassId || state.selectedClassId === 'all') return undefined;
    return state.classes.find(c => c.id === state.selectedClassId);
  }, [state.classes, state.selectedClassId]);

  // Shifts for current selected class (or all shifts if 'all' is selected)
  const classShifts = useMemo(() => {
    if (!state.selectedClassId || state.selectedClassId === 'all') {
      return state.shifts;
    }
    return state.shifts.filter(s => s.classId === state.selectedClassId);
  }, [state.shifts, state.selectedClassId]);

  // Detected conflicts
  const conflicts = useMemo(() => {
    return detectConflicts(state.assignments, state.shifts, state.employees);
  }, [state.assignments, state.shifts, state.employees]);

  // Handlers
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmp]
    }));
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(e => (e.id === id ? { ...e, ...updates } : e))
    }));
  };

  const deleteEmployee = (id: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id),
      assignments: prev.assignments.filter(a => a.employeeId !== id)
    }));
  };

  const bulkAddEmployees = (names: string[], defaultRoles: string[] = ['parking', 'support']) => {
    const newEmps: Employee[] = names
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .map((name, i) => ({
        id: `emp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        department: 'Operations',
        qualifications: [...defaultRoles],
        maxShifts: 4,
        unavailableDates: [],
        active: true
      }));

    setState(prev => ({
      ...prev,
      employees: [...prev.employees, ...newEmps]
    }));
  };

  const addClass = (clsData: Omit<TrainingClass, 'id'>): TrainingClass => {
    const newClass: TrainingClass = {
      ...clsData,
      id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setState(prev => ({
      ...prev,
      classes: [...prev.classes, newClass],
      selectedClassId: newClass.id
    }));
    return newClass;
  };

  const updateClass = (id: string, updates: Partial<TrainingClass>) => {
    setState(prev => ({
      ...prev,
      classes: prev.classes.map(c => (c.id === id ? { ...c, ...updates } : c))
    }));
  };

  const deleteClass = (id: string) => {
    setState(prev => {
      const remainingClasses = prev.classes.filter(c => c.id !== id);
      return {
        ...prev,
        classes: remainingClasses,
        shifts: prev.shifts.filter(s => s.classId !== id),
        assignments: prev.assignments.filter(a => a.classId !== id),
        selectedClassId: remainingClasses[0]?.id || null
      };
    });
  };

  const setSelectedClassId = (id: string | null) => {
    setState(prev => ({ ...prev, selectedClassId: id }));
  };

  const addShift = (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      ...shiftData,
      id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setState(prev => ({
      ...prev,
      shifts: [...prev.shifts, newShift]
    }));
  };

  const updateShift = (id: string, updates: Partial<Shift>) => {
    setState(prev => ({
      ...prev,
      shifts: prev.shifts.map(s => (s.id === id ? { ...s, ...updates } : s))
    }));
  };

  const deleteShift = (id: string) => {
    setState(prev => ({
      ...prev,
      shifts: prev.shifts.filter(s => s.id !== id),
      assignments: prev.assignments.filter(a => a.shiftId !== id)
    }));
  };

  const assignEmployee = (shiftId: string, taskId: string, employeeId: string) => {
    const shift = state.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    // Check if this employee is already in this shift & task
    const exists = state.assignments.some(
      a => a.shiftId === shiftId && a.taskId === taskId && a.employeeId === employeeId
    );
    if (exists) return;

    const newAsgn: Assignment = {
      id: `asgn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      classId: shift.classId,
      shiftId,
      taskId,
      employeeId,
      assignedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAsgn]
    }));
  };

  const removeAssignment = (assignmentId: string) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.id !== assignmentId)
    }));
  };

  const removeShiftTaskAssignment = (shiftId: string, taskId: string, employeeId: string) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.filter(
        a => !(a.shiftId === shiftId && a.taskId === taskId && a.employeeId === employeeId)
      )
    }));
  };

  const clearClassAssignments = (classId?: string) => {
    const isAll = (classId === 'all') || (!classId && (!state.selectedClassId || state.selectedClassId === 'all'));
    if (isAll) {
      setState(prev => ({
        ...prev,
        assignments: []
      }));
      return;
    }
    const targetClassId = classId || selectedClass?.id;
    if (!targetClassId) return;

    setState(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.classId !== targetClassId)
    }));
  };

  const runAutoSchedule = (preserveExisting: boolean = false) => {
    const isAll = !state.selectedClassId || state.selectedClassId === 'all';
    const targetClassId = isAll ? undefined : (state.selectedClassId || undefined);

    const targetShifts = isAll
      ? state.shifts
      : state.shifts.filter(s => s.classId === targetClassId);

    if (targetShifts.length === 0) {
      return { filled: 0, total: 0, unfilledCount: 0 };
    }

    const result = autoScheduleShifts(state.employees, targetShifts, state.assignments, {
      preserveExisting,
      classId: targetClassId
    });

    setState(prev => {
      if (isAll) {
        return {
          ...prev,
          assignments: result.assignments
        };
      }
      // Keep assignments for OTHER classes
      const otherClassAssignments = prev.assignments.filter(a => a.classId !== targetClassId);
      return {
        ...prev,
        assignments: [...otherClassAssignments, ...result.assignments]
      };
    });

    // Trigger celebration if shifts filled
    if (result.totalFilled > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (e) {
        // ignore
      }
    }

    return {
      filled: result.totalFilled,
      total: result.totalRequired,
      unfilledCount: result.unfilledSlots.length
    };
  };

  const addTaskType = (task: TaskType) => {
    setState(prev => ({
      ...prev,
      taskTypes: [...prev.taskTypes.filter(t => t.id !== task.id), task]
    }));
  };

  const importState = (imported: Partial<AppState>) => {
    setState(prev => ({
      ...prev,
      employees: imported.employees || prev.employees,
      classes: imported.classes || prev.classes,
      shifts: imported.shifts || prev.shifts,
      assignments: imported.assignments || prev.assignments,
      taskTypes: imported.taskTypes || prev.taskTypes,
      selectedClassId: imported.selectedClassId || imported.classes?.[0]?.id || prev.selectedClassId
    }));
  };

  const resetToDemoData = () => {
    const demo = getInitialData();
    setState(demo);
  };

  const clearAllData = () => {
    setState({
      employees: [],
      classes: [],
      shifts: [],
      assignments: [],
      taskTypes: state.taskTypes,
      selectedClassId: null,
      selectedDate: null
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab,
        conflicts,
        selectedClass,
        classShifts,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        bulkAddEmployees,
        addClass,
        updateClass,
        deleteClass,
        setSelectedClassId,
        addShift,
        updateShift,
        deleteShift,
        assignEmployee,
        removeAssignment,
        removeShiftTaskAssignment,
        clearClassAssignments,
        runAutoSchedule,
        addTaskType,
        importState,
        resetToDemoData,
        clearAllData,
        syncStatus,
        workspaceId,
        setWorkspaceId,
        lastSyncTime,
        forceCloudSync
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
