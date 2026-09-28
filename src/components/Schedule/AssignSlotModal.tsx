import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Shift, TaskRequirement, Employee } from '../../types';
import { X, Search, Check, AlertTriangle, UserCheck, Star, ShieldAlert } from 'lucide-react';
import TaskBadge from '../Common/TaskBadge';

interface AssignSlotModalProps {
  shift: Shift;
  req: TaskRequirement;
  onClose: () => void;
  onAssign: (employeeId: string) => void;
}

export const AssignSlotModal: React.FC<AssignSlotModalProps> = ({
  shift,
  req,
  onClose,
  onAssign
}) => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Already assigned to this shift
  const assignedInThisShift = useMemo(() => {
    return state.assignments
      .filter(a => a.shiftId === shift.id)
      .map(a => a.employeeId);
  }, [state.assignments, shift.id]);

  // Count shifts assigned to each employee
  const employeeShiftCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of state.assignments.filter(as => as.classId === shift.classId)) {
      counts.set(a.employeeId, (counts.get(a.employeeId) || 0) + 1);
    }
    return counts;
  }, [state.assignments, shift.classId]);

  // Filter and sort candidates
  const candidates = useMemo(() => {
    return state.employees
      .filter(emp => emp.active)
      .filter(emp => {
        return (
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .map(emp => {
        const isQualified = emp.qualifications.includes(req.taskId);
        const isAlreadyInShift = assignedInThisShift.includes(emp.id);
        const isUnavailable = emp.unavailableDates.includes(shift.date);
        const shiftCount = employeeShiftCounts.get(emp.id) || 0;
        const maxShifts = emp.maxShifts || 4;
        const isOverCapacity = shiftCount >= maxShifts;

        return {
          emp,
          isQualified,
          isAlreadyInShift,
          isUnavailable,
          shiftCount,
          maxShifts,
          isOverCapacity
        };
      })
      .sort((a, b) => {
        // Priority: Not in this shift > Qualified > Fewer shifts
        if (a.isAlreadyInShift !== b.isAlreadyInShift) return a.isAlreadyInShift ? 1 : -1;
        if (a.isUnavailable !== b.isUnavailable) return a.isUnavailable ? 1 : -1;
        if (a.isQualified !== b.isQualified) return a.isQualified ? -1 : 1;
        return a.shiftCount - b.shiftCount;
      });
  }, [state.employees, searchTerm, req.taskId, assignedInThisShift, shift.date, employeeShiftCounts]);

  const taskType = state.taskTypes.find(t => t.id === req.taskId) || {
    id: req.taskId,
    name: req.taskName
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">Assign Staff Slot</span>
              <TaskBadge task={taskType} size="sm" />
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">
              {shift.title} • {shift.date} ({shift.startTime} - {shift.endTime})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search staff by name or dept..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white outline-hidden"
            />
          </div>
        </div>

        {/* Candidates List */}
        <div className="p-3 max-h-80 overflow-y-auto divide-y divide-slate-100 space-y-1">
          {candidates.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No active employees match your search.
            </div>
          ) : (
            candidates.map(item => {
              const { emp, isQualified, isAlreadyInShift, isUnavailable, shiftCount, maxShifts } = item;

              return (
                <button
                  key={emp.id}
                  disabled={isAlreadyInShift}
                  onClick={() => {
                    onAssign(emp.id);
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    isAlreadyInShift
                      ? 'opacity-40 bg-slate-100 cursor-not-allowed'
                      : 'hover:bg-indigo-50/80 hover:border-indigo-200 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-900">{emp.name}</span>
                        {isQualified && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-3xs font-bold" title="Qualified for this task">
                            QUALIFIED
                          </span>
                        )}
                      </div>
                      <div className="text-2xs text-slate-500">
                        {emp.department || 'Staff'} • {shiftCount} / {maxShifts} shifts
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {isAlreadyInShift ? (
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                        Already in shift
                      </span>
                    ) : isUnavailable ? (
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" /> Unavailable
                      </span>
                    ) : shiftCount === 0 ? (
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5" /> Best Choice (0 shifts)
                      </span>
                    ) : (
                      <span className="text-2xs font-semibold text-indigo-600 hover:text-indigo-800">
                        Select
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default AssignSlotModal;
