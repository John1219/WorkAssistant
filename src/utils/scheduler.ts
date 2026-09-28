import { Employee, Shift, Assignment, ScheduleConflict } from '../types';

interface AutoScheduleOptions {
  preserveExisting?: boolean;
  classId?: string;
}

export interface AutoScheduleResult {
  assignments: Assignment[];
  unfilledSlots: { shiftId: string; taskId: string; slotIndex: number; shiftTitle: string; taskName: string }[];
  totalFilled: number;
  totalRequired: number;
}

/**
 * Detects conflicts in the current assignments
 */
export function detectConflicts(
  assignments: Assignment[],
  shifts: Shift[],
  employees: Employee[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const empMap = new Map<string, Employee>(employees.map(e => [e.id, e]));
  const shiftMap = new Map<string, Shift>(shifts.map(s => [s.id, s]));

  // Track shift assignments per employee
  const employeeShiftCount = new Map<string, number>();
  // Track (employeeId + date) to detect same-day or same-shift overlaps
  const employeeShiftSlots = new Map<string, { shift: Shift; taskId: string }[]>();

  for (const asgn of assignments) {
    const emp = empMap.get(asgn.employeeId);
    const shift = shiftMap.get(asgn.shiftId);
    if (!emp || !shift) continue;

    // Count shifts
    const count = (employeeShiftCount.get(emp.id) || 0) + 1;
    employeeShiftCount.set(emp.id, count);

    // Check unavailability
    if (emp.unavailableDates?.includes(shift.date)) {
      conflicts.push({
        type: 'unavailable',
        employeeId: emp.id,
        employeeName: emp.name,
        shiftId: shift.id,
        message: `${emp.name} is marked as unavailable on ${shift.date}.`
      });
    }

    // Check qualification
    if (emp.qualifications && emp.qualifications.length > 0 && !emp.qualifications.includes(asgn.taskId)) {
      conflicts.push({
        type: 'unqualified',
        employeeId: emp.id,
        employeeName: emp.name,
        shiftId: shift.id,
        message: `${emp.name} does not have the listed qualification for this task.`
      });
    }

    // Check overlapping/double booked in same shift or overlapping hours
    const currentList = employeeShiftSlots.get(emp.id) || [];
    for (const existing of currentList) {
      if (existing.shift.id === shift.id) {
        conflicts.push({
          type: 'double_booked',
          employeeId: emp.id,
          employeeName: emp.name,
          shiftId: shift.id,
          message: `${emp.name} is assigned to multiple tasks simultaneously in ${shift.title}.`
        });
      } else if (existing.shift.date === shift.date) {
        // Check time overlap
        if (isTimeOverlapping(existing.shift.startTime, existing.shift.endTime, shift.startTime, shift.endTime)) {
          conflicts.push({
            type: 'double_booked',
            employeeId: emp.id,
            employeeName: emp.name,
            shiftId: shift.id,
            message: `${emp.name} has overlapping shifts on ${shift.date} (${existing.shift.title} & ${shift.title}).`
          });
        }
      }
    }

    currentList.push({ shift, taskId: asgn.taskId });
    employeeShiftSlots.set(emp.id, currentList);
  }

  // Check over capacity
  for (const [empId, count] of employeeShiftCount.entries()) {
    const emp = empMap.get(empId);
    if (emp && emp.maxShifts && count > emp.maxShifts) {
      conflicts.push({
        type: 'over_capacity',
        employeeId: emp.id,
        employeeName: emp.name,
        shiftId: '',
        message: `${emp.name} is assigned ${count} shifts, exceeding preferred limit of ${emp.maxShifts}.`
      });
    }
  }

  return conflicts;
}

function isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}

/**
 * Intelligent Auto-Scheduler
 * Balances parking vs classroom support, distributes shifts evenly,
 * prioritizes qualifications, and respects availability.
 */
export function autoScheduleShifts(
  employees: Employee[],
  shifts: Shift[],
  existingAssignments: Assignment[],
  options: AutoScheduleOptions = {}
): AutoScheduleResult {
  const { preserveExisting = false, classId } = options;

  // Filter shifts to schedule
  const targetShifts = classId ? shifts.filter(s => s.classId === classId) : [...shifts];
  // Sort shifts chronologically
  targetShifts.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  const activeEmployees = employees.filter(e => e.active);
  if (activeEmployees.length === 0) {
    return {
      assignments: preserveExisting ? existingAssignments : [],
      unfilledSlots: [],
      totalFilled: 0,
      totalRequired: 0
    };
  }

  // Assignments to keep or build
  let finalAssignments: Assignment[] = preserveExisting
    ? [...existingAssignments]
    : existingAssignments.filter(a => !targetShifts.some(s => s.id === a.shiftId));

  // Tracking employee workloads
  const totalAssignedCount = new Map<string, number>();
  const parkingAssignedCount = new Map<string, number>();
  const supportAssignedCount = new Map<string, number>();
  // Track shift IDs assigned to employee to prevent double booking
  const employeeShiftMap = new Map<string, Set<string>>();
  // Track date assignments to prevent same-day overload or overlapping
  const employeeDateMap = new Map<string, { shift: Shift; taskId: string }[]>();

  for (const emp of activeEmployees) {
    totalAssignedCount.set(emp.id, 0);
    parkingAssignedCount.set(emp.id, 0);
    supportAssignedCount.set(emp.id, 0);
    employeeShiftMap.set(emp.id, new Set());
    employeeDateMap.set(emp.id, []);
  }

  // Populate from preserved assignments
  for (const asgn of finalAssignments) {
    const shift = shifts.find(s => s.id === asgn.shiftId);
    if (!shift) continue;

    totalAssignedCount.set(asgn.employeeId, (totalAssignedCount.get(asgn.employeeId) || 0) + 1);
    if (asgn.taskId === 'parking') {
      parkingAssignedCount.set(asgn.employeeId, (parkingAssignedCount.get(asgn.employeeId) || 0) + 1);
    } else if (asgn.taskId === 'support') {
      supportAssignedCount.set(asgn.employeeId, (supportAssignedCount.get(asgn.employeeId) || 0) + 1);
    }

    employeeShiftMap.get(asgn.employeeId)?.add(asgn.shiftId);
    employeeDateMap.get(asgn.employeeId)?.push({ shift, taskId: asgn.taskId });
  }

  const unfilledSlots: AutoScheduleResult['unfilledSlots'] = [];
  let totalRequired = 0;
  let totalFilled = finalAssignments.length;

  // Process shifts
  for (const shift of targetShifts) {
    for (const req of shift.taskRequirements) {
      const requiredCount = req.requiredCount || 0;
      totalRequired += requiredCount;

      // Check how many already assigned to this requirement
      const currentAssigned = finalAssignments.filter(
        a => a.shiftId === shift.id && a.taskId === req.taskId
      );

      const slotsToFill = requiredCount - currentAssigned.length;

      for (let slot = 0; slot < slotsToFill; slot++) {
        // Find best candidate
        const candidates = activeEmployees.filter(emp => {
          // 1. Not unavailable on this date
          if (emp.unavailableDates?.includes(shift.date)) return false;

          // 2. Not already in this shift
          if (employeeShiftMap.get(emp.id)?.has(shift.id)) return false;

          // 3. Not overlapping on same day
          const sameDayShifts = employeeDateMap.get(emp.id) || [];
          for (const prev of sameDayShifts) {
            if (prev.shift.date === shift.date) {
              if (isTimeOverlapping(prev.shift.startTime, prev.shift.endTime, shift.startTime, shift.endTime)) {
                return false;
              }
            }
          }

          // 4. Check if maxShifts reached
          const currentTotal = totalAssignedCount.get(emp.id) || 0;
          if (emp.maxShifts && currentTotal >= emp.maxShifts) return false;

          return true;
        });

        if (candidates.length === 0) {
          unfilledSlots.push({
            shiftId: shift.id,
            taskId: req.taskId,
            slotIndex: currentAssigned.length + slot,
            shiftTitle: shift.title,
            taskName: req.taskName
          });
          continue;
        }

        // Score candidates based on:
        // - Qualification match (high score)
        // - Low total shift count (fairness)
        // - Balanced specific task (e.g. avoid giving same person all parking duties)
        // - Single shift per day preference (avoid tiring people out if others available)
        candidates.sort((a, b) => {
          const aQual = a.qualifications?.includes(req.taskId) ? 1 : 0;
          const bQual = b.qualifications?.includes(req.taskId) ? 1 : 0;
          if (aQual !== bQual) return bQual - aQual; // Qualified first

          // Specific task balance
          let aTaskCount = 0;
          let bTaskCount = 0;
          if (req.taskId === 'parking') {
            aTaskCount = parkingAssignedCount.get(a.id) || 0;
            bTaskCount = parkingAssignedCount.get(b.id) || 0;
          } else if (req.taskId === 'support') {
            aTaskCount = supportAssignedCount.get(a.id) || 0;
            bTaskCount = supportAssignedCount.get(b.id) || 0;
          }
          if (aTaskCount !== bTaskCount) return aTaskCount - bTaskCount;

          // Same day shift penalty: prefer someone who isn't already working another shift on this date
          const aSameDay = (employeeDateMap.get(a.id) || []).filter(s => s.shift.date === shift.date).length;
          const bSameDay = (employeeDateMap.get(b.id) || []).filter(s => s.shift.date === shift.date).length;
          if (aSameDay !== bSameDay) return aSameDay - bSameDay;

          // Overall total shifts assigned
          const aTotal = totalAssignedCount.get(a.id) || 0;
          const bTotal = totalAssignedCount.get(b.id) || 0;
          return aTotal - bTotal;
        });

        const selected = candidates[0];

        // Assign selected
        const newAssignment: Assignment = {
          id: `asgn-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          classId: shift.classId,
          shiftId: shift.id,
          taskId: req.taskId,
          employeeId: selected.id,
          assignedAt: new Date().toISOString()
        };

        finalAssignments.push(newAssignment);
        totalFilled++;

        totalAssignedCount.set(selected.id, (totalAssignedCount.get(selected.id) || 0) + 1);
        if (req.taskId === 'parking') {
          parkingAssignedCount.set(selected.id, (parkingAssignedCount.get(selected.id) || 0) + 1);
        } else if (req.taskId === 'support') {
          supportAssignedCount.set(selected.id, (supportAssignedCount.get(selected.id) || 0) + 1);
        }

        employeeShiftMap.get(selected.id)?.add(shift.id);
        employeeDateMap.get(selected.id)?.push({ shift, taskId: req.taskId });
      }
    }
  }

  return {
    assignments: finalAssignments,
    unfilledSlots,
    totalFilled,
    totalRequired
  };
}
