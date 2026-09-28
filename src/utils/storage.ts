import { AppState } from '../types';
import { getInitialData } from './initialData';

const STORAGE_KEY = 'training_scheduler_data_v1';

export function loadStoredState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialData();
      saveStoredState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      employees: parsed.employees || [],
      classes: parsed.classes || [],
      shifts: parsed.shifts || [],
      assignments: parsed.assignments || [],
      taskTypes: parsed.taskTypes || [],
      selectedClassId: parsed.selectedClassId || 'all',
      selectedDate: parsed.selectedDate || null,
      firebaseConfig: parsed.firebaseConfig
    };
  } catch (err) {
    console.error('Failed to load schedule from localStorage, using initial sample data', err);
    return getInitialData();
  }
}

export function saveStoredState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save schedule to localStorage', err);
  }
}

export function exportStateToJson(state: AppState): string {
  const exportPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: state
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function parseImportedJson(jsonString: string): Partial<AppState> {
  const parsed = JSON.parse(jsonString);
  if (parsed.data && typeof parsed.data === 'object') {
    return parsed.data;
  }
  return parsed;
}
