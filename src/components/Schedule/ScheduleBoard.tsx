import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Shift, TaskRequirement, Assignment, Employee } from '../../types';
import {
  CalendarDays,
  Clock,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Phone,
  Mail,
  Car,
  Users,
  ChevronDown,
  Printer,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import AssignSlotModal from './AssignSlotModal';

export const ScheduleBoard: React.FC = () => {
  const {
    state,
    selectedClass,
    setSelectedClassId,
    assignEmployee,
    removeAssignment,
    runAutoSchedule,
    clearClassAssignments,
    setActiveTab,
    conflicts
  } = useApp();

  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [assignModalData, setAssignModalData] = useState<{
    shift: Shift;
    req: TaskRequirement;
  } | null>(null);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  const isAllClasses = !state.selectedClassId || state.selectedClassId === 'all';

  // Shifts for the selected training class (or all classes)
  const classShifts = useMemo(() => {
    if (isAllClasses) {
      return [...state.shifts].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    }
    return state.shifts
      .filter(s => s.classId === state.selectedClassId)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [state.shifts, state.selectedClassId, isAllClasses]);

  const classMap = useMemo(() => {
    return new Map(state.classes.map(c => [c.id, c]));
  }, [state.classes]);

  // Distinct dates in this class's shifts
  const distinctDates = useMemo(() => {
    const dates = Array.from(new Set(classShifts.map(s => s.date))).sort();
    return dates;
  }, [classShifts]);

  // Filtered shifts based on date filter
  const displayedShifts = useMemo(() => {
    if (selectedDateFilter === 'all') return classShifts;
    return classShifts.filter(s => s.date === selectedDateFilter);
  }, [classShifts, selectedDateFilter]);

  // Overall staffing stats for this class
  const staffingStats = useMemo(() => {
    let requiredSlots = 0;
    let filledSlots = 0;
    let parkingRequired = 0;
    let parkingFilled = 0;
    let supportRequired = 0;
    let supportFilled = 0;

    for (const shift of classShifts) {
      for (const req of shift.taskRequirements) {
        requiredSlots += req.requiredCount;
        const assigned = state.assignments.filter(
          a => a.shiftId === shift.id && a.taskId === req.taskId
        ).length;
        filledSlots += Math.min(req.requiredCount, assigned);

        if (req.taskId === 'parking') {
          parkingRequired += req.requiredCount;
          parkingFilled += Math.min(req.requiredCount, assigned);
        } else if (req.taskId === 'support') {
          supportRequired += req.requiredCount;
          supportFilled += Math.min(req.requiredCount, assigned);
        }
      }
    }

    const percent = requiredSlots > 0 ? Math.round((filledSlots / requiredSlots) * 100) : 0;
    return {
      requiredSlots,
      filledSlots,
      percent,
      parkingRequired,
      parkingFilled,
      supportRequired,
      supportFilled
    };
  }, [classShifts, state.assignments]);

  // Map employees for fast lookup
  const employeeMap = useMemo(() => {
    return new Map<string, Employee>(state.employees.map(e => [e.id, e]));
  }, [state.employees]);

  // Conflict lookup for fast badges
  const conflictMap = useMemo(() => {
    const map = new Map<string, string>(); // key: `${shiftId}-${employeeId}`
    for (const c of conflicts) {
      if (c.shiftId) {
        map.set(`${c.shiftId}-${c.employeeId}`, c.message);
      }
    }
    return map;
  }, [conflicts]);

  const handleAutoSchedule = (preserveExisting: boolean) => {
    const result = runAutoSchedule(preserveExisting);
    if (result.unfilledCount > 0) {
      setScheduleNotice(
        `Scheduled ${result.filled} of ${result.total} slots. ${result.unfilledCount} slots could not be filled due to employee availability or capacity limits.`
      );
    } else {
      setScheduleNotice(`Successfully scheduled all ${result.total} shift slots fairly!`);
    }
    setTimeout(() => setScheduleNotice(null), 5000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all assignments for this training class?')) {
      clearClassAssignments();
      setScheduleNotice('Cleared all assignments for this class.');
      setTimeout(() => setScheduleNotice(null), 3000);
    }
  };

  if (state.classes.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <CalendarDays className="h-12 w-12 text-slate-300 mx-auto" />
        <h3 className="mt-3 text-base font-semibold text-slate-800">No training classes created yet</h3>
        <p className="text-xs text-slate-500 mt-1">Please create a training class to get started.</p>
        <button
          onClick={() => setActiveTab('classes')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          Go to Class Manager
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Class Title & Details */}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-2xs uppercase">
                {isAllClasses ? 'All Classes View' : 'Active Training Event'}
              </span>
              <select
                value={state.selectedClassId || 'all'}
                onChange={e => setSelectedClassId(e.target.value)}
                className="font-bold text-lg text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Training Classes ({state.classes.length})</option>
                {state.classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {isAllClasses
                  ? `${state.classes.length} Training Classes • ${classShifts.length} Total Shifts`
                  : `${selectedClass?.startDate} through ${selectedClass?.endDate}`}
              </span>
              {!isAllClasses && selectedClass?.location && (
                <>
                  <span>•</span>
                  <span>{selectedClass.location}</span>
                </>
              )}
            </p>
          </div>

          {/* Action Buttons: Auto-Schedule, Clear, Print */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAutoSchedule(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Fills any vacant slots while keeping your current manual assignments"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Fill Empty Slots</span>
            </button>

            <button
              onClick={() => handleAutoSchedule(false)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Re-run fair workload balancing across all shifts"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>✨ Auto-Schedule All</span>
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
              title="Clear all assignments for this class"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Staffing Progress & Duty Metrics Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Overall Staffing */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Total Staffing Coverage</span>
              <span className="font-bold text-indigo-600">
                {staffingStats.filledSlots} / {staffingStats.requiredSlots} ({staffingStats.percent}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  staffingStats.percent === 100
                    ? 'bg-emerald-500'
                    : staffingStats.percent > 70
                    ? 'bg-indigo-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${staffingStats.percent}%` }}
              />
            </div>
          </div>

          {/* Parking Duty Coverage */}
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <div className="text-2xs uppercase tracking-wider font-bold text-amber-800">
                  Parking Duty
                </div>
                <div className="text-xs font-medium text-amber-900">
                  {staffingStats.parkingFilled} of {staffingStats.parkingRequired} slots filled
                </div>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
              {staffingStats.parkingRequired > 0
                ? `${Math.round((staffingStats.parkingFilled / staffingStats.parkingRequired) * 100)}%`
                : '100%'}
            </span>
          </div>

          {/* Classroom Support Coverage */}
          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-800">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <div className="text-2xs uppercase tracking-wider font-bold text-blue-800">
                  Classroom Support
                </div>
                <div className="text-xs font-medium text-blue-900">
                  {staffingStats.supportFilled} of {staffingStats.supportRequired} slots filled
                </div>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
              {staffingStats.supportRequired > 0
                ? `${Math.round((staffingStats.supportFilled / staffingStats.supportRequired) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Temporary Auto-Schedule Notice */}
        {scheduleNotice && (
          <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>{scheduleNotice}</span>
          </div>
        )}
      </div>

      {/* Date Filter Tabs */}
      {distinctDates.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDateFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedDateFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Class Dates ({distinctDates.length})
          </button>
          {distinctDates.map((date, idx) => (
            <button
              key={date}
              onClick={() => setSelectedDateFilter(date)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDateFilter === date
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Day {idx + 1} ({date})
            </button>
          ))}
        </div>
      )}

      {/* Shifts Grid */}
      {displayedShifts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Clock className="h-10 w-10 text-slate-300 mx-auto" />
          <h4 className="mt-2 text-sm font-semibold text-slate-800">No shifts scheduled for this view</h4>
          <p className="text-xs text-slate-500 mt-1">
            Switch tabs or configure shifts in the "Classes & Shifts" tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayedShifts.map(shift => {
            const shiftAssignments = state.assignments.filter(a => a.shiftId === shift.id);

            return (
              <div
                key={shift.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Shift Header */}
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{shift.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-2xs font-mono font-medium">
                        {shift.date}
                      </span>
                      {isAllClasses && state.classes.length > 1 && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-900/90 text-indigo-200 border border-indigo-700/60 text-3xs font-semibold">
                          {classMap.get(shift.classId)?.title || 'Class'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{shift.startTime} – {shift.endTime}</span>
                      {shift.notes && (
                        <span className="text-2xs text-amber-300 italic ml-1">
                          • {shift.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shift Progress Badge */}
                  <div className="text-right">
                    {(() => {
                      const totalRequired = shift.taskRequirements.reduce(
                        (sum, r) => sum + r.requiredCount,
                        0
                      );
                      const isComplete = shiftAssignments.length >= totalRequired;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold ${
                            isComplete
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                              : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                          }`}
                        >
                          {shiftAssignments.length} / {totalRequired} Staffed
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Task Slots Container */}
                <div className="p-4 space-y-4 flex-1">
                  {shift.taskRequirements.map(req => {
                    const taskAssignments = shiftAssignments.filter(a => a.taskId === req.taskId);
                    const isParking = req.taskId === 'parking';
                    const isSupport = req.taskId === 'support';

                    // Empty slots needed
                    const unfilledCount = Math.max(0, req.requiredCount - taskAssignments.length);

                    return (
                      <div
                        key={req.taskId}
                        className={`p-3.5 rounded-xl border ${
                          isParking
                            ? 'bg-amber-50/50 border-amber-200'
                            : isSupport
                            ? 'bg-blue-50/50 border-blue-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {/* Task Section Header */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-1.5">
                            {isParking && <Car className="h-4 w-4 text-amber-700" />}
                            {isSupport && <Users className="h-4 w-4 text-blue-700" />}
                            <span className="font-bold text-xs text-slate-900">{req.taskName}</span>
                          </div>

                          <span className="text-2xs font-semibold text-slate-500">
                            {taskAssignments.length} of {req.requiredCount} assigned
                          </span>
                        </div>

                        {/* Staff Slot Chips */}
                        <div className="flex flex-wrap gap-2">
                          {/* Filled Slots */}
                          {taskAssignments.map(asgn => {
                            const emp = employeeMap.get(asgn.employeeId);
                            if (!emp) return null;

                            const conflictKey = `${shift.id}-${emp.id}`;
                            const conflictMsg = conflictMap.get(conflictKey);

                            return (
                              <div
                                key={asgn.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium shadow-2xs transition-all ${
                                  conflictMsg
                                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300'
                                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                                }`}
                              >
                                <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-3xs font-bold uppercase">
                                  {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="font-semibold">{emp.name}</span>

                                {conflictMsg && (
                                  <span title={conflictMsg} className="text-rose-600">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                  </span>
                                )}

                                <button
                                  onClick={() => removeAssignment(asgn.id)}
                                  className="ml-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded-md"
                                  title="Unassign employee"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}

                          {/* Unfilled Slot Buttons */}
                          {Array.from({ length: unfilledCount }).map((_, i) => (
                            <button
                              key={`unfilled-${i}`}
                              onClick={() => setAssignModalData({ shift, req })}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed text-xs font-semibold transition-all ${
                                isParking
                                  ? 'border-amber-400 text-amber-800 bg-amber-100/50 hover:bg-amber-100'
                                  : isSupport
                                  ? 'border-blue-400 text-blue-800 bg-blue-100/50 hover:bg-blue-100'
                                  : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100'
                              }`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Assign Staff Slot</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Slot Modal */}
      {assignModalData && (
        <AssignSlotModal
          shift={assignModalData.shift}
          req={assignModalData.req}
          onClose={() => setAssignModalData(null)}
          onAssign={empId => {
            assignEmployee(
              assignModalData.shift.id,
              assignModalData.req.taskId,
              empId
            );
          }}
        />
      )}
    </div>
  );
};
export default ScheduleBoard;
