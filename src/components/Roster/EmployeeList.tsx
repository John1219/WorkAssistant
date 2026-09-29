import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import {
  Search,
  Plus,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  Car,
  ClipboardList
} from 'lucide-react';
import EmployeeModal from './EmployeeModal';
import BulkImportModal from './BulkImportModal';
import TaskBadge from '../Common/TaskBadge';

export const EmployeeList: React.FC = () => {
  const {
    state,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    bulkAddEmployees,
    selectedClass
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Compute shift count for each employee in the active class
  const shiftCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const parkingCounts = new Map<string, number>();
    const supportCounts = new Map<string, number>();

    const targetAssignments = selectedClass
      ? state.assignments.filter(a => a.classId === selectedClass.id)
      : state.assignments;

    for (const asgn of targetAssignments) {
      counts.set(asgn.employeeId, (counts.get(asgn.employeeId) || 0) + 1);
      if (asgn.taskId === 'parking') {
        parkingCounts.set(asgn.employeeId, (parkingCounts.get(asgn.employeeId) || 0) + 1);
      } else if (asgn.taskId === 'support') {
        supportCounts.set(asgn.employeeId, (supportCounts.get(asgn.employeeId) || 0) + 1);
      }
    }
    return { counts, parkingCounts, supportCounts };
  }, [state.assignments, selectedClass]);

  const filteredEmployees = useMemo(() => {
    return state.employees.filter(emp => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'active' && emp.active) ||
        (roleFilter === 'inactive' && !emp.active) ||
        emp.qualifications.includes(roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [state.employees, searchTerm, roleFilter]);

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the roster? Any scheduled shifts will be unassigned.`)) {
      deleteEmployee(id);
    }
  };

  const handleSaveEmployee = (empData: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, empData);
    } else {
      addEmployee(empData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <span>Employee Roster ({state.employees.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage staff qualifications for Parking Duty and Classroom Support
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="px-3 py-2.5 sm:py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[42px] sm:min-h-0"
          >
            <ClipboardList className="h-4 w-4 text-slate-500 shrink-0" />
            <span>Bulk Add</span>
          </button>

          <button
            onClick={() => {
              setEditingEmployee(null);
              setModalOpen(true);
            }}
            className="px-3.5 py-2.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[42px] sm:min-h-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, department, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 shrink-0">Filter:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium outline-hidden"
          >
            <option value="all">All Staff ({state.employees.length})</option>
            <option value="active">Active Only</option>
            <option value="parking">Qualified: Parking Duty</option>
            <option value="support">Qualified: Classroom Support</option>
            <option value="registration">Qualified: Registration</option>
            <option value="floater">Qualified: Floater</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table of Employees */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No employees found</h3>
            <p className="mt-1 text-xs text-slate-500">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your search terms or filter.'
                : 'Get started by adding your first employee or importing a roster.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (Phones) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredEmployees.map(emp => {
                const assignedCount = shiftCounts.counts.get(emp.id) || 0;
                const parkingCount = shiftCounts.parkingCounts.get(emp.id) || 0;
                const supportCount = shiftCounts.supportCounts.get(emp.id) || 0;
                const max = emp.maxShifts || 4;
                const percent = Math.min(100, Math.round((assignedCount / max) * 100));

                return (
                  <div
                    key={emp.id}
                    className={`p-4 space-y-3 ${!emp.active ? 'opacity-60 bg-slate-50/50' : ''}`}
                  >
                    {/* Header: Avatar, Name, Dept & Active Toggle */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate">{emp.name}</div>
                          <div className="text-slate-500 text-2xs truncate">{emp.department || 'General Staff'}</div>
                          {emp.email && (
                            <div className="text-3xs text-slate-400 truncate max-w-[170px]">{emp.email}</div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => updateEmployee(emp.id, { active: !emp.active })}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold shrink-0 transition-colors ${
                          emp.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                        title="Toggle active status"
                      >
                        {emp.active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-slate-500" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Qualifications badges */}
                    <div className="flex flex-wrap gap-1">
                      {emp.qualifications.map(qId => {
                        const taskType = state.taskTypes.find(t => t.id === qId);
                        if (!taskType) return null;
                        return <TaskBadge key={qId} task={taskType} size="sm" />;
                      })}
                    </div>

                    {/* Shift Count Progress & Duty Split */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-2xs font-semibold mb-1">
                          <span className="text-slate-600">Event Shifts</span>
                          <span className={assignedCount > max ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                            {assignedCount} / {max}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              assignedCount > max
                                ? 'bg-rose-500'
                                : assignedCount === max
                                ? 'bg-emerald-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Duty Badges */}
                      <div className="flex items-center gap-1.5 text-2xs font-semibold shrink-0">
                        <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <Car className="h-3 w-3 text-amber-700" /> {parkingCount}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
                          <Users className="h-3 w-3 text-blue-700" /> {supportCount}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Edit & Remove with comfortable touch targets */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[36px]"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[36px]"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (Medium & Large screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Employee</th>
                    <th scope="col" className="px-4 py-3.5">Qualifications</th>
                    <th scope="col" className="px-4 py-3.5">Contact</th>
                    <th scope="col" className="px-4 py-3.5 text-center">
                      Current Event Shifts
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center">Duty Split</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Status</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredEmployees.map(emp => {
                    const assignedCount = shiftCounts.counts.get(emp.id) || 0;
                    const parkingCount = shiftCounts.parkingCounts.get(emp.id) || 0;
                    const supportCount = shiftCounts.supportCounts.get(emp.id) || 0;
                    const max = emp.maxShifts || 4;
                    const percent = Math.min(100, Math.round((assignedCount / max) * 100));

                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !emp.active ? 'opacity-60 bg-slate-50/50' : ''
                        }`}
                      >
                        {/* Name & Dept */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">{emp.name}</div>
                              <div className="text-slate-500 text-2xs">{emp.department || 'General Staff'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Qualifications */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {emp.qualifications.map(qId => {
                              const taskType = state.taskTypes.find(t => t.id === qId);
                              if (!taskType) return null;
                              return (
                                <TaskBadge key={qId} task={taskType} size="sm" />
                              );
                            })}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                          {emp.email && <div className="text-2xs">{emp.email}</div>}
                          {emp.phone && <div className="text-2xs font-mono text-slate-500">{emp.phone}</div>}
                          {!emp.email && !emp.phone && <span className="text-slate-400 italic">No contact info</span>}
                        </td>

                        {/* Current Event Shift Count */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`font-bold text-xs ${
                              assignedCount > max ? 'text-rose-600' : 'text-slate-800'
                            }`}>
                              {assignedCount} / {max} shifts
                            </span>
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  assignedCount > max
                                    ? 'bg-rose-500'
                                    : assignedCount === max
                                    ? 'bg-emerald-500'
                                    : 'bg-indigo-600'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Duty Split (Parking vs Support) */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5 text-2xs font-medium">
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                              <Car className="h-2.5 w-2.5" /> {parkingCount}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-0.5">
                              <Users className="h-2.5 w-2.5" /> {supportCount}
                            </span>
                          </div>
                        </td>

                        {/* Active Status */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => updateEmployee(emp.id, { active: !emp.active })}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium transition-colors ${
                              emp.active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Click to toggle active status"
                          >
                            {emp.active ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-slate-500" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleEdit(emp)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Employee"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id, emp.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove Employee"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <EmployeeModal
          employee={editingEmployee}
          taskTypes={state.taskTypes}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveEmployee}
        />
      )}

      {bulkModalOpen && (
        <BulkImportModal
          taskTypes={state.taskTypes}
          onClose={() => setBulkModalOpen(false)}
          onImport={(names, roles) => bulkAddEmployees(names, roles)}
        />
      )}
    </div>
  );
};
export default EmployeeList;
