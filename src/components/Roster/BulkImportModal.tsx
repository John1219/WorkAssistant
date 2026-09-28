import React, { useState } from 'react';
import { X, Users, Upload, Check } from 'lucide-react';
import { TaskType } from '../../types';

interface BulkImportModalProps {
  taskTypes: TaskType[];
  onClose: () => void;
  onImport: (names: string[], defaultRoles: string[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  taskTypes,
  onClose,
  onImport
}) => {
  const [text, setText] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['parking', 'support']);

  // Extract names from text (lines or commas)
  const parsedNames = text
    .split(/[\r\n,]+/)
    .map(n => n.trim().replace(/^[-*•\d.]+\s*/, '')) // strip bullet points or numbers
    .filter(n => n.length > 0);

  const toggleRole = (id: string) => {
    setSelectedRoles(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    if (parsedNames.length === 0) return;
    onImport(parsedNames, selectedRoles);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-100">
                Bulk Add Staff Members
              </h3>
              <p className="text-xs text-slate-400">
                Paste employee names from a roster, spreadsheet, or email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Paste Employee Names (One per line or comma-separated)
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Alice Johnson&#10;Bob Martinez&#10;Charlie Williams&#10;Dana Garcia..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono outline-hidden"
            />
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
              <span>Auto-detects numbered lists or bullet points</span>
              <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                {parsedNames.length} name{parsedNames.length === 1 ? '' : 's'} identified
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Default Task Qualifications for These Employees
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {taskTypes.map(task => {
                const checked = selectedRoles.includes(task.id);
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
                      onChange={() => toggleRole(task.id)}
                      className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{task.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={parsedNames.length === 0}
              onClick={handleImport}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              Import {parsedNames.length} Employees
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BulkImportModal;
