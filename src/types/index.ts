export type TaskCategory = 'parking' | 'support' | 'custom';

export interface TaskType {
  id: string;
  name: string;
  category: TaskCategory;
  color: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'indigo' | 'cyan';
  icon: 'car' | 'users' | 'clipboard' | 'shield' | 'star' | 'coffee';
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  qualifications: string[]; // task IDs they are qualified to perform
  maxShifts?: number; // max preferred shifts for this event/week
  unavailableDates: string[]; // YYYY-MM-DD strings
  notes?: string;
  active: boolean;
}

export interface TaskRequirement {
  taskId: string;
  taskName: string;
  requiredCount: number;
}

export interface Shift {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g., "Morning Session", "Afternoon Session"
  startTime: string; // "07:30"
  endTime: string; // "12:00"
  taskRequirements: TaskRequirement[];
  notes?: string;
}

export interface TrainingClass {
  id: string;
  title: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
  color?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  shiftId: string;
  taskId: string;
  employeeId: string;
  assignedAt: string;
}

export interface ScheduleConflict {
  type: 'double_booked' | 'unavailable' | 'over_capacity' | 'unqualified';
  employeeId: string;
  employeeName: string;
  shiftId: string;
  message: string;
}

export interface AppState {
  employees: Employee[];
  classes: TrainingClass[];
  shifts: Shift[];
  assignments: Assignment[];
  taskTypes: TaskType[];
  selectedClassId: string | null;
  selectedDate: string | null;
  firebaseConfig?: {
    apiKey: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
}
