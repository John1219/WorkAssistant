import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrainingClass, Shift, TaskRequirement } from '../../types';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  Car,
  Users,
  Trash2,
  Edit2,
  Copy,
  MapPin,
  Check,
  ChevronRight,
  Shield,
  ClipboardList
} from 'lucide-react';
import TaskBadge from '../Common/TaskBadge';

export const ClassManager: React.FC = () => {
  const {
    state,
    selectedClass,
    setSelectedClassId,
    addClass,
    updateClass,
    deleteClass,
    addShift,
    updateShift,
    deleteShift
  } = useApp();

  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<TrainingClass | null>(null);

  // New class form state
  const [classTitle, setClassTitle] = useState('');
  const [classLocation, setClassLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classDescription, setClassDescription] = useState('');

  // Shift edit state
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftDate, setShiftDate] = useState('');
  const [shiftTitle, setShiftTitle] = useState('Morning Session');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('12:00');
  const [shiftNotes, setShiftNotes] = useState('');
  const [requirements, setRequirements] = useState<TaskRequirement[]>([
    { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 3 },
    { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 }
  ]);

  const shiftsForCurrentClass = selectedClass
    ? state.shifts
        .filter(s => s.classId === selectedClass.id)
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    : [];

  const handleOpenNewClass = () => {
    setEditingClass(null);
    setClassTitle('');
    setClassLocation('');
    setStartDate(new Date().toISOString().split('T')[0]);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    setClassDescription('');
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls: TrainingClass) => {
    setEditingClass(cls);
    setClassTitle(cls.title);
    setClassLocation(cls.location || '');
    setStartDate(cls.startDate);
    setEndDate(cls.endDate);
    setClassDescription(cls.description || '');
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim()) return;

    if (editingClass) {
      updateClass(editingClass.id, {
        title: classTitle.trim(),
        location: classLocation.trim() || undefined,
        startDate,
        endDate,
        description: classDescription.trim() || undefined
      });
    } else {
      const created = addClass({
        title: classTitle.trim(),
        location: classLocation.trim() || undefined,
        startDate,
        endDate,
        description: classDescription.trim() || undefined
      });

      // Automatically generate a morning & afternoon shift template for day 1
      addShift({
        classId: created.id,
        date: startDate,
        title: 'Morning Session',
        startTime: '07:30',
        endTime: '12:00',
        taskRequirements: [
          { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 3 },
          { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 }
        ],
        notes: 'Arrive 15 min early for parking briefing.'
      });
      addShift({
        classId: created.id,
        date: startDate,
        title: 'Afternoon Session',
        startTime: '12:30',
        endTime: '17:00',
        taskRequirements: [
          { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 2 },
          { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 }
        ]
      });
    }
    setShowClassModal(false);
  };

  const handleOpenNewShift = () => {
    if (!selectedClass) return;
    setEditingShift(null);
    setShiftDate(selectedClass.startDate);
    setShiftTitle('Morning Session');
    setStartTime('07:30');
    setEndTime('12:00');
    setShiftNotes('');
    setRequirements([
      { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 3 },
      { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 }
    ]);
    setShowShiftModal(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftDate(shift.date);
    setShiftTitle(shift.title);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setShiftNotes(shift.notes || '');
    setRequirements([...shift.taskRequirements]);
    setShowShiftModal(true);
  };

  const handleDuplicateShift = (shift: Shift) => {
    // Add 1 day to shift date
    const d = new Date(shift.date);
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().split('T')[0];

    addShift({
      classId: shift.classId,
      date: nextDate,
      title: shift.title,
      startTime: shift.startTime,
      endTime: shift.endTime,
      taskRequirements: JSON.parse(JSON.stringify(shift.taskRequirements)),
      notes: shift.notes
    });
  };

  const updateRequirementCount = (taskId: string, count: number) => {
    setRequirements(prev =>
      prev.map(r => (r.taskId === taskId ? { ...r, requiredCount: Math.max(0, count) } : r))
    );
  };

  const addCustomTaskRequirement = (task: { id: string; name: string }) => {
    if (requirements.some(r => r.taskId === task.id)) return;
    setRequirements(prev => [
      ...prev,
      { taskId: task.id, taskName: task.name, requiredCount: 1 }
    ]);
  };

  const removeRequirement = (taskId: string) => {
    setRequirements(prev => prev.filter(r => r.taskId !== taskId));
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !shiftDate) return;

    if (editingShift) {
      updateShift(editingShift.id, {
        date: shiftDate,
        title: shiftTitle,
        startTime,
        endTime,
        taskRequirements: requirements,
        notes: shiftNotes.trim() || undefined
      });
    } else {
      addShift({
        classId: selectedClass.id,
        date: shiftDate,
        title: shiftTitle,
        startTime,
        endTime,
        taskRequirements: requirements,
        notes: shiftNotes.trim() || undefined
      });
    }
    setShowShiftModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Class Selector */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            <span>Training Classes & Shift Requirements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dates, training sessions, and headcounts needed for Parking Duty & Support
          </p>
        </div>

        <button
          onClick={handleOpenNewClass}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Training Class</span>
        </button>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {state.classes.map(cls => {
          const isSelected = selectedClass?.id === cls.id;
          const shiftCount = state.shifts.filter(s => s.classId === cls.id).length;
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-3.5 rounded-xl border cursor-pointer min-w-64 transition-all ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                  {cls.title}
                </span>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-2xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {cls.startDate} ~ {cls.endDate}
                </span>
                <span>•</span>
                <span>{shiftCount} shift{shiftCount === 1 ? '' : 's'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Class Details & Shift List */}
      {selectedClass ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Class Header Bar */}
          <div className="bg-slate-50 p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{selectedClass.title}</h3>
                <button
                  onClick={() => handleOpenEditClass(selectedClass)}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                  title="Edit Class Details"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                {selectedClass.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {selectedClass.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {selectedClass.startDate} through {selectedClass.endDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenNewShift}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Shift</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${selectedClass.title}" and all its shifts?`)) {
                    deleteClass(selectedClass.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Training Class"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Shifts Table / Cards */}
          <div className="p-5">
            {shiftsForCurrentClass.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="mx-auto h-10 w-10 text-slate-300" />
                <h4 className="mt-2 text-sm font-semibold text-slate-800">No shifts created yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add morning or afternoon shifts and set how many employees are required for Parking and Support.
                </p>
                <button
                  onClick={handleOpenNewShift}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Create First Shift
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {shiftsForCurrentClass.map(shift => {
                  const parkingReq = shift.taskRequirements.find(r => r.taskId === 'parking');
                  const supportReq = shift.taskRequirements.find(r => r.taskId === 'support');
                  const otherReqs = shift.taskRequirements.filter(
                    r => r.taskId !== 'parking' && r.taskId !== 'support'
                  );
                  const totalNeeded = shift.taskRequirements.reduce((sum, r) => sum + r.requiredCount, 0);

                  return (
                    <div
                      key={shift.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Time & Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{shift.title}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-2xs font-semibold">
                            {shift.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {shift.startTime} – {shift.endTime}
                          </span>
                          {shift.notes && (
                            <span className="text-2xs text-slate-400 italic">
                              ({shift.notes})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Required Headcounts */}
                      <div className="flex flex-wrap items-center gap-2">
                        {parkingReq && (
                          <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1.5 text-xs font-medium">
                            <Car className="h-3.5 w-3.5 text-amber-700" />
                            <span>Parking Duty:</span>
                            <span className="font-bold bg-amber-200/80 px-1.5 py-0.2 rounded-md">
                              {parkingReq.requiredCount} staff
                            </span>
                          </div>
                        )}

                        {supportReq && (
                          <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-1.5 text-xs font-medium">
                            <Users className="h-3.5 w-3.5 text-blue-700" />
                            <span>Class Support:</span>
                            <span className="font-bold bg-blue-200/80 px-1.5 py-0.2 rounded-md">
                              {supportReq.requiredCount} staff
                            </span>
                          </div>
                        )}

                        {otherReqs.map(r => (
                          <div
                            key={r.taskId}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-1.5 text-xs font-medium"
                          >
                            <span>{r.taskName}:</span>
                            <span className="font-bold bg-emerald-200/80 px-1.5 py-0.2 rounded-md">
                              {r.requiredCount}
                            </span>
                          </div>
                        ))}

                        <span className="text-2xs text-slate-400 font-medium ml-1">
                          Total: {totalNeeded} staff needed
                        </span>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center justify-end w-full md:w-auto gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <button
                          onClick={() => handleDuplicateShift(shift)}
                          className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[36px]"
                          title="Copy this shift schedule to the next day"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy to +1 Day</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditShift(shift)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border border-slate-200"
                          title="Edit Shift Requirements"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${shift.title} on ${shift.date}?`)) {
                              deleteShift(shift.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border border-slate-200"
                          title="Delete Shift"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingClass ? 'Edit Training Class' : 'Create Training Class'}
              </h3>
              <button
                onClick={() => setShowClassModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveClass} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Class / Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q1 Operations & Safety Training"
                  value={classTitle}
                  onChange={e => setClassTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Location / Facility
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building C - North Campus & Lots A/B"
                  value={classLocation}
                  onChange={e => setClassLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes regarding attendees, weather contingency, etc."
                  value={classDescription}
                  onChange={e => setClassDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                >
                  {editingClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Requirement Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingShift ? 'Edit Shift Requirements' : 'Add Shift & Headcount'}
              </h3>
              <button
                onClick={() => setShowShiftModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveShift} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Shift Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={shiftDate}
                    onChange={e => setShiftDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Shift Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Session"
                    value={shiftTitle}
                    onChange={e => setShiftTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Task Staffing Requirements */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Required Staffing per Task
                </label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {requirements.map(req => (
                    <div
                      key={req.taskId}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {req.taskId === 'parking' && <Car className="h-4 w-4 text-amber-600 shrink-0" />}
                        {req.taskId === 'support' && <Users className="h-4 w-4 text-blue-600 shrink-0" />}
                        {req.taskId === 'registration' && <ClipboardList className="h-4 w-4 text-emerald-600 shrink-0" />}
                        {req.taskId === 'floater' && <Shield className="h-4 w-4 text-purple-600 shrink-0" />}
                        <span className="text-xs font-medium text-slate-900 truncate">{req.taskName}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-500 hidden sm:inline">Need:</span>
                        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateRequirementCount(req.taskId, req.requiredCount - 1)}
                            className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 text-sm font-bold min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            –
                          </button>
                          <span className="px-2.5 py-1 font-bold text-xs text-slate-900 min-w-7 text-center">
                            {req.requiredCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateRequirementCount(req.taskId, req.requiredCount + 1)}
                            className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 text-sm font-bold min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        {req.taskId !== 'parking' && req.taskId !== 'support' && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(req.taskId)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add additional tasks */}
                  <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                    <span className="text-2xs text-slate-500">Add other tasks:</span>
                    {state.taskTypes
                      .filter(t => !requirements.some(r => r.taskId === t.id))
                      .map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => addCustomTaskRequirement(t)}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-2xs font-medium text-slate-700 flex items-center gap-1"
                        >
                          <Plus className="h-2.5 w-2.5" />
                          <span>{t.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Shift Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavy traffic expected, rain gear recommended"
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                >
                  {editingShift ? 'Save Shift' : 'Add Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClassManager;
