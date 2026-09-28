import React from 'react';
import { X, HelpCircle, Check, Sparkles, ExternalLink } from 'lucide-react';
import GithubIcon from './GithubIcon';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">User Guide & GitHub Pages Hosting</h3>
              <p className="text-xs text-slate-400">Everything you need to run and share this app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Section 1: How to host on GitHub */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm mb-2">
              <GithubIcon className="h-4 w-4 text-indigo-700" />
              <span>How to Host on Your GitHub Account (GitHub Pages)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-indigo-900 leading-relaxed">
              <li>
                Push this repository to your GitHub account (e.g. <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">https://github.com/your-username/WorkAssistant</code>).
              </li>
              <li>
                On GitHub, go to <strong>Settings</strong> → <strong>Pages</strong>.
              </li>
              <li>
                Under <strong>Build and deployment</strong> → <strong>Source</strong>, select <strong>GitHub Actions</strong>.
              </li>
              <li>
                That's it! The included <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">.github/workflows/deploy.yml</code> workflow automatically builds and hosts your app at <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">https://&lt;your-username&gt;.github.io/WorkAssistant/</code>.
              </li>
            </ol>
          </div>

          {/* Section 2: Core Workflows */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Key Features & How to Use</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <strong className="text-slate-900 font-semibold block mb-1">
                  1. Add Employees & Qualifications
                </strong>
                Go to the <strong>Employee Roster</strong> tab. You can add individual employees or click <strong>Bulk Add Staff</strong> to paste names directly from a spreadsheet. Check off whether each person is qualified for Parking Duty, Classroom Support, or both!
              </div>

              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <strong className="text-slate-900 font-semibold block mb-1">
                  2. Configure Classes & Headcounts
                </strong>
                In <strong>Classes & Shifts</strong>, define training sessions and specify the exact number of staff needed for Parking Duty and Support. The headcounts can vary from shift to shift.
              </div>

              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <strong className="text-slate-900 font-semibold block mb-1">
                  3. One-Click Fair Auto-Scheduling
                </strong>
                On the <strong>Schedule Board</strong>, click <strong>✨ Auto-Schedule All</strong>. The algorithm assigns employees fairly, prevents double-booking, and rotates parking vs. classroom support so duties are balanced.
              </div>

              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <strong className="text-slate-900 font-semibold block mb-1">
                  4. Export, Share & Print
                </strong>
                Export directly to an Excel CSV spreadsheet, generate a printable clipboard roster, or export a JSON backup to share with coworkers.
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
          >
            Got it, Let's Schedule!
          </button>
        </div>
      </div>
    </div>
  );
};
export default HelpModal;
