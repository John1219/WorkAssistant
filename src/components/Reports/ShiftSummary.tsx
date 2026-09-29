import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Car,
  Users,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers
} from 'lucide-react';

export const ShiftSummary: React.FC = () => {
  const { state, selectedClass } = useApp();

  // Compute metrics for the selected class
  const employeeStats = useMemo(() => {
    const targetAssignments = selectedClass
      ? state.assignments.filter(a => a.classId === selectedClass.id)
      : state.assignments;

    const map = new Map<
      string,
      {
        total: number;
        parking: number;
        support: number;
        other: number;
      }
    >();

    for (const emp of state.employees) {
      map.set(emp.id, { total: 0, parking: 0, support: 0, other: 0 });
    }

    for (const asgn of targetAssignments) {
      const stats = map.get(asgn.employeeId) || { total: 0, parking: 0, support: 0, other: 0 };
      stats.total += 1;
      if (asgn.taskId === 'parking') {
        stats.parking += 1;
      } else if (asgn.taskId === 'support') {
        stats.support += 1;
      } else {
        stats.other += 1;
      }
      map.set(asgn.employeeId, stats);
    }

    return state.employees
      .map(emp => {
        const counts = map.get(emp.id) || { total: 0, parking: 0, support: 0, other: 0 };
        return {
          employee: emp,
          ...counts
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [state.employees, state.assignments, selectedClass]);

  // General totals
  const overall = useMemo(() => {
    const classShifts = selectedClass
      ? state.shifts.filter(s => s.classId === selectedClass.id)
      : state.shifts;
    const targetAssignments = selectedClass
      ? state.assignments.filter(a => a.classId === selectedClass.id)
      : state.assignments;

    let totalRequired = 0;
    let parkingRequired = 0;
    let supportRequired = 0;

    for (const s of classShifts) {
      for (const r of s.taskRequirements) {
        totalRequired += r.requiredCount;
        if (r.taskId === 'parking') parkingRequired += r.requiredCount;
        if (r.taskId === 'support') supportRequired += r.requiredCount;
      }
    }

    const totalFilled = targetAssignments.length;
    const parkingFilled = targetAssignments.filter(a => a.taskId === 'parking').length;
    const supportFilled = targetAssignments.filter(a => a.taskId === 'support').length;

    return {
      totalRequired,
      totalFilled,
      parkingRequired,
      parkingFilled,
      supportRequired,
      supportFilled,
      coveragePercent: totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0
    };
  }, [state.shifts, state.assignments, selectedClass]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          <span>Workload Distribution & Shift Fairness</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Auditing task rotation to ensure fair balance between Parking Duty and Classroom Support
        </p>

        {/* Highlight Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
              Total Shifts Filled
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {overall.totalFilled} / {overall.totalRequired}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Coverage: {overall.coveragePercent}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> Parking Duty Slots
            </span>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {overall.parkingFilled} / {overall.parkingRequired}
            </div>
            <div className="text-xs text-amber-700 mt-0.5">
              {overall.parkingRequired - overall.parkingFilled} open slots remaining
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-2xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Class Support Slots
            </span>
            <div className="text-2xl font-black text-blue-900 mt-1">
              {overall.supportFilled} / {overall.supportRequired}
            </div>
            <div className="text-xs text-blue-700 mt-0.5">
              {overall.supportRequired - overall.supportFilled} open slots remaining
            </div>
          </div>
        </div>
      </div>

      {/* Fairness Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-800">
              Employee Duty Rotation & Balance
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sorted by total shifts assigned
          </span>
        </div>

        {/* Mobile Card List (Phones) */}
        <div className="md:hidden divide-y divide-slate-100">
          {employeeStats.map(item => {
            const { employee, total, parking, support, other } = item;
            const max = employee.maxShifts || 4;
            const percent = Math.min(100, Math.round((total / max) * 100));

            return (
              <div key={employee.id} className="p-4 space-y-3">
                {/* Header: Name, Dept, Status Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {employee.name}
                    </div>
                    <div className="text-2xs text-slate-500 truncate">
                      {employee.department || 'General'}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {total === 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-2xs font-medium">
                        Unassigned
                      </span>
                    ) : parking > 0 && support > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-2xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Balanced Split
                      </span>
                    ) : parking > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-2xs font-semibold">
                        Only Parking
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-2xs font-semibold">
                        Only Support
                      </span>
                    )}
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-2xs mb-1 font-semibold">
                    <span className="text-slate-600">Assigned Shifts</span>
                    <span className={total > max ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'}>
                      {total} of {max} max ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        total > max
                          ? 'bg-rose-500'
                          : total === max
                          ? 'bg-emerald-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Duty Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-3xs uppercase font-bold text-amber-800 flex items-center justify-center gap-1">
                      <Car className="h-3 w-3" /> Parking
                    </div>
                    <div className="text-base font-bold text-amber-950 mt-0.5">{parking}</div>
                  </div>

                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-3xs uppercase font-bold text-blue-800 flex items-center justify-center gap-1">
                      <Users className="h-3 w-3" /> Support
                    </div>
                    <div className="text-base font-bold text-blue-950 mt-0.5">{support}</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-3xs uppercase font-bold text-slate-600">
                      Other
                    </div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">{other}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (Medium & Large screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5 text-center">Total Shifts</th>
                <th className="px-4 py-3.5 text-center">Parking Shifts</th>
                <th className="px-4 py-3.5 text-center">Support Shifts</th>
                <th className="px-4 py-3.5 text-center">Other Tasks</th>
                <th className="px-4 py-3.5">Workload Ratio</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {employeeStats.map(item => {
                const { employee, total, parking, support, other } = item;
                const max = employee.maxShifts || 4;
                const percent = Math.min(100, Math.round((total / max) * 100));

                return (
                  <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-sm">
                        {employee.name}
                      </div>
                      <div className="text-2xs text-slate-400">
                        {employee.email || 'No email registered'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {employee.department || 'General'}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-center font-bold text-slate-900 text-sm">
                      {total}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-semibold border border-amber-200">
                        {parking}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-semibold border border-blue-200">
                        {support}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-center text-slate-600">
                      {other}
                    </td>

                    {/* Progress Bar of Capacity */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="w-36">
                        <div className="flex justify-between text-2xs mb-1">
                          <span className="font-semibold text-slate-600">{total} / {max} max</span>
                          <span className="text-slate-400">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              total > max
                                ? 'bg-rose-500'
                                : total === max
                                ? 'bg-emerald-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Duty Balance Badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      {total === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-2xs font-medium">
                          Unassigned
                        </span>
                      ) : parking > 0 && support > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-2xs font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Balanced Split
                        </span>
                      ) : parking > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-2xs font-semibold">
                          Only Parking
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-2xs font-semibold">
                          Only Support
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ShiftSummary;
