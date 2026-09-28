import React, { useState, useEffect } from 'react';
import { Employee, TaskType } from '../../types';
import { X, UserPlus, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface EmployeeModalProps {
  employee?: Employee | null;
  taskTypes: TaskType[];
  onClose: () => void;
  onSave: (employeeData: Omit<Employee, 'id'>) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employee,
  taskTypes,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(employee?.name || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [department, setDepartment] = useState(employee?.department || '');
  const [qualifications, setQualifications] = useState<string[]>(
    employee?.qualifications || ['parking', 'support']
  );
  const [maxShifts, setMaxShifts] = useState<number>(employee?.maxShifts || 4);
  const [notes, setNotes] = useState(employee?.notes || '');
  const [unavailableDates, setUnavailableDates] = useState<string[]>(
    employee?.unavailableDates || []
  );
  const [newUnavailDate, setNewUnavailDate] = useState('');
  const [active, setActive] = useState(employee ? employee.active : true);
  const [error, setError] = useState('');

  const toggleQual = (id: string) => {
    setQualifications(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleAddUnavailableDate = () => {
    if (!newUnavailDate) return;
    if (!unavailableDates.includes(newUnavailDate)) {
      setUnavailableDates([...unavailableDates, newUnavailDate].sort());
    }
    setNewUnavailDate('');
  };

  const handleRemoveUnavailableDate = (date: string) => {
    setUnavailableDates(unavailableDates.filter(d => d !== date));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Employee name is required');
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      department: department.trim() || undefined,
      qualifications,
      maxShifts: Number(maxShifts) || 4,
      unavailableDates,
      notes: notes.trim() || undefined,
      active
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              {employee ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <h3 className="font-semibold text-lg text-slate-100">
              {employee ? 'Edit Employee Profile' : 'Add New Employee'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Facilities, Operations"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Max Preferred Shifts
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxShifts}
                onChange={e => setMaxShifts(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="jordan@company.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Task Qualifications & Roles
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {taskTypes.map(task => {
                const checked = qualifications.includes(task.id);
                return (
                  <label
                    key={task.id}
                    className={`flex items-center space-x-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                      checked
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleQual(task.id)}
                      className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{task.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Unavailable Dates
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="date"
                value={newUnavailDate}
                onChange={e => setNewUnavailDate(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={handleAddUnavailableDate}
                disabled={!newUnavailDate}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Date
              </button>
            </div>
            {unavailableDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                {unavailableDates.map(date => (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-medium"
                  >
                    {date}
                    <button
                      type="button"
                      onClick={() => handleRemoveUnavailableDate(date)}
                      className="hover:text-rose-950"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Notes / Special Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Needs morning shifts, certified in radio protocol..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Active in pool for scheduling</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                {employee ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EmployeeModal;
