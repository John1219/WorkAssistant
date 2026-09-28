import { Shift, Assignment, Employee, TrainingClass } from '../types';

export function downloadJsonFile(content: string, filename: string = 'training-schedule.json') {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportScheduleToCsv(
  trainingClass: TrainingClass | undefined,
  shifts: Shift[],
  assignments: Assignment[],
  employees: Employee[]
): string {
  const empMap = new Map(employees.map(e => [e.id, e]));

  const headers = ['Training Class', 'Date', 'Shift Title', 'Start Time', 'End Time', 'Task / Role', 'Assigned Employee', 'Employee Email', 'Employee Phone'];
  const rows: string[][] = [headers];

  const sortedShifts = [...shifts].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  for (const shift of sortedShifts) {
    for (const req of shift.taskRequirements) {
      const taskAssignments = assignments.filter(a => a.shiftId === shift.id && a.taskId === req.taskId);

      // Loop through required count
      for (let i = 0; i < req.requiredCount; i++) {
        const asgn = taskAssignments[i];
        const emp = asgn ? empMap.get(asgn.employeeId) : null;

        rows.push([
          trainingClass?.title || 'Training Class',
          shift.date,
          shift.title,
          shift.startTime,
          shift.endTime,
          req.taskName,
          emp ? emp.name : 'UNASSIGNED',
          emp?.email || '',
          emp?.phone || ''
        ]);
      }
    }
  }

  // Format as CSV lines
  return rows.map(row => row.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
}

export function downloadCsvFile(csvContent: string, filename: string = 'schedule.csv') {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateTextRoster(
  trainingClass: TrainingClass | undefined,
  shifts: Shift[],
  assignments: Assignment[],
  employees: Employee[]
): string {
  const empMap = new Map(employees.map(e => [e.id, e]));
  const lines: string[] = [];

  lines.push(`=======================================================`);
  lines.push(`TRAINING DUTY SCHEDULE: ${trainingClass?.title || 'Training Event'}`);
  if (trainingClass?.location) lines.push(`Location: ${trainingClass.location}`);
  lines.push(`Dates: ${trainingClass?.startDate || ''} to ${trainingClass?.endDate || ''}`);
  lines.push(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
  lines.push(`=======================================================\n`);

  const sortedShifts = [...shifts].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  for (const shift of sortedShifts) {
    lines.push(`📅 ${shift.date} | ${shift.title} (${shift.startTime} - ${shift.endTime})`);
    if (shift.notes) lines.push(`   Note: ${shift.notes}`);

    for (const req of shift.taskRequirements) {
      const taskAssignments = assignments.filter(a => a.shiftId === shift.id && a.taskId === req.taskId);
      const names = taskAssignments.map(a => {
        const emp = empMap.get(a.employeeId);
        return emp ? `${emp.name}${emp.phone ? ` (${emp.phone})` : ''}` : 'Unknown';
      });

      const missingCount = req.requiredCount - taskAssignments.length;
      if (missingCount > 0) {
        for (let m = 0; m < missingCount; m++) {
          names.push('[⚠️ UNASSIGNED SLOT]');
        }
      }

      lines.push(`   • ${req.taskName} (${taskAssignments.length}/${req.requiredCount}): ${names.join(', ') || 'None'}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
