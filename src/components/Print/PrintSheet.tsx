import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Car, Users, Calendar, MapPin, Download, ArrowLeft } from 'lucide-react';
import { exportScheduleToCsv, downloadCsvFile } from '../../utils/export';

export const PrintSheet: React.FC = () => {
  const { state, selectedClass, setActiveTab } = useApp();

  const shifts = selectedClass
    ? state.shifts
        .filter(s => s.classId === selectedClass.id)
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    : [];

  const employeeMap = new Map(state.employees.map(e => [e.id, e]));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csv = exportScheduleToCsv(selectedClass, shifts, state.assignments, state.employees);
    downloadCsvFile(csv, `${selectedClass?.title || 'schedule'}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Screen-only Controls Bar */}
      <div className="no-print bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('schedule')}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Board</span>
          </button>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Print-Optimized Duty Schedule Roster
            </h2>
            <p className="text-2xs text-slate-500">
              Formatted for physical clipboards, breakroom boards, and attendee hand-outs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-2.5 sm:py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[40px] sm:min-h-0"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span className="truncate">Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[40px] sm:min-h-0"
          >
            <Printer className="h-4 w-4 shrink-0" />
            <span className="truncate">Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Layout */}
      <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-700">
                Official Shift Duty Roster
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                {selectedClass?.title || 'Training Program Shift Schedule'}
              </h1>
              {selectedClass?.location && (
                <p className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Facility Location: {selectedClass.location}</span>
                </p>
              )}
            </div>

            <div className="text-right text-2xs text-slate-500">
              <div>Effective: {selectedClass?.startDate} – {selectedClass?.endDate}</div>
              <div>Published: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {/* Schedule Grid by Shift */}
        <div className="space-y-6">
          {shifts.map((shift, idx) => {
            const shiftAssignments = state.assignments.filter(a => a.shiftId === shift.id);

            return (
              <div
                key={shift.id}
                className="print-card rounded-xl border border-slate-300 p-4 bg-white"
              >
                {/* Shift Title & Time */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div>
                    <span className="font-bold text-sm text-slate-900 uppercase">
                      {shift.title}
                    </span>
                    <span className="ml-2 font-mono text-xs font-semibold text-slate-700">
                      📅 {shift.date}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                    ⏰ {shift.startTime} – {shift.endTime}
                  </div>
                </div>

                {shift.notes && (
                  <div className="text-2xs italic text-slate-600 mb-3 bg-slate-50 p-2 rounded-md border border-slate-200">
                    <strong>Special Instructions:</strong> {shift.notes}
                  </div>
                )}

                {/* Duty Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shift.taskRequirements.map(req => {
                    const taskAssignments = shiftAssignments.filter(a => a.taskId === req.taskId);
                    const isParking = req.taskId === 'parking';
                    const isSupport = req.taskId === 'support';

                    return (
                      <div
                        key={req.taskId}
                        className="border border-slate-200 rounded-lg p-3 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            {isParking && <Car className="h-3.5 w-3.5 text-amber-700" />}
                            {isSupport && <Users className="h-3.5 w-3.5 text-blue-700" />}
                            {req.taskName}
                          </span>
                          <span className="text-3xs font-semibold text-slate-500 uppercase tracking-wider">
                            Required: {req.requiredCount} Staff
                          </span>
                        </div>

                        <ol className="divide-y divide-slate-200 text-xs">
                          {Array.from({ length: req.requiredCount }).map((_, slotIdx) => {
                            const asgn = taskAssignments[slotIdx];
                            const emp = asgn ? employeeMap.get(asgn.employeeId) : null;

                            return (
                              <li
                                key={slotIdx}
                                className="py-1.5 flex items-center justify-between"
                              >
                                <span className="font-medium text-slate-800 flex items-center gap-2">
                                  <span className="text-2xs text-slate-400 font-mono">
                                    #{slotIdx + 1}
                                  </span>
                                  <span className={emp ? 'font-bold' : 'text-rose-600 italic'}>
                                    {emp ? emp.name : 'UNASSIGNED SLOT'}
                                  </span>
                                </span>

                                <span className="text-2xs font-mono text-slate-500">
                                  {emp?.phone || emp?.department || '—'}
                                </span>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Notes for Printout */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-2xs text-slate-500">
          <div>Please report 15 minutes prior to shift start for safety briefing.</div>
          <div>ShiftSync • GitHub Pages App</div>
        </div>
      </div>
    </div>
  );
};
export default PrintSheet;
