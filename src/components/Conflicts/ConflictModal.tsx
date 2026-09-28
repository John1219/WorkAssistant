import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, UserX, CalendarX, Layers, CheckCircle2 } from 'lucide-react';

interface ConflictModalProps {
  onClose: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({ onClose }) => {
  const { conflicts, setActiveTab } = useApp();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-700 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Scheduling Conflicts</h3>
              <p className="text-xs text-rose-200">
                {conflicts.length} issue{conflicts.length === 1 ? '' : 's'} identified in current shift roster
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-rose-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto space-y-3">
          {conflicts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h4 className="mt-2 text-sm font-bold text-slate-800">
                All Clear! No Conflicts Found
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                There are no double-booked shifts, availability conflicts, or capacity overruns.
              </p>
            </div>
          ) : (
            conflicts.map((conflict, idx) => {
              const isDouble = conflict.type === 'double_booked';
              const isUnavail = conflict.type === 'unavailable';
              const isOver = conflict.type === 'over_capacity';

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start gap-3"
                >
                  <div className="p-1.5 bg-rose-100 rounded-lg text-rose-700 shrink-0 mt-0.5">
                    {isDouble && <Layers className="h-4 w-4" />}
                    {isUnavail && <CalendarX className="h-4 w-4" />}
                    {isOver && <UserX className="h-4 w-4" />}
                    {!isDouble && !isUnavail && !isOver && <AlertTriangle className="h-4 w-4" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-950">
                        {conflict.employeeName}
                      </span>
                      <span className="text-3xs uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-900">
                        {conflict.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 mt-1">{conflict.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              setActiveTab('schedule');
            }}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            Review on Schedule Board →
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConflictModal;
