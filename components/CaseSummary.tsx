import React from 'react';
import { CaseData } from '../types';
import { FileText, Users, DollarSign, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface CaseSummaryProps {
  data: CaseData;
}

export const CaseSummary: React.FC<CaseSummaryProps> = ({ data }) => {
  // Simple progress calculation based on filled fields
  const fieldsToCheck = [
    data.applicantName,
    data.formType !== 'Unknown',
    data.children && data.children.length > 0,
    data.financials?.income,
    data.contactRequirements
  ];
  const filledCount = fieldsToCheck.filter(Boolean).length;
  const progress = Math.round((filledCount / 5) * 100);

  return (
    <div className="bg-white h-full border-l border-slate-200 flex flex-col shadow-2xl">
      {/* Header with Progress */}
      <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          Case File
        </h3>
        
        <div>
           <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
             <span>Completeness</span>
             <span className="text-blue-600">{progress}%</span>
           </div>
           <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
             <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm" 
                style={{ width: `${progress}%` }}
             ></div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        
        {/* Status Card */}
        {data.currentStatus && (
          <div className="bg-white border-l-4 border-blue-500 rounded-r-lg shadow-sm p-4">
             <div className="flex items-start gap-3">
               <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
               <div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Activity</span>
                 <p className="text-slate-800 font-medium mt-1">{data.currentStatus}</p>
               </div>
             </div>
          </div>
        )}

        {/* Applicant Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Applicant</h4>
          </div>
          <div className="p-4 space-y-3">
             <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">Name</span>
                <span className={`font-semibold ${data.applicantName ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                  {data.applicantName || 'Required'}
                </span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Form Type</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${data.formType !== 'Unknown' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                  {data.formType}
                </span>
             </div>
          </div>
        </div>

        {/* Children Section */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden ring-1 ring-emerald-50">
          <div className="bg-emerald-50/50 px-4 py-2 border-b border-emerald-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Children</h4>
          </div>
          <div className="p-4">
            {data.children && data.children.length > 0 ? (
              <div className="space-y-2">
                 {data.children.map((child, idx) => (
                   <div key={idx} className="flex items-center gap-2 text-sm bg-emerald-50/30 p-2 rounded border border-emerald-100">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-slate-700 font-medium">{child}</span>
                   </div>
                 ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-2">No children added yet</p>
            )}
          </div>
        </div>

        {/* Financials Section */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden ring-1 ring-amber-50">
          <div className="bg-amber-50/50 px-4 py-2 border-b border-amber-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest">Financials</h4>
          </div>
          <div className="p-4 space-y-3">
             <div className="text-sm">
                <span className="block text-slate-500 text-xs mb-1 font-medium">Monthly Income</span>
                <p className={`p-2 rounded border ${data.financials?.income ? 'bg-amber-50 border-amber-100 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-300 italic'}`}>
                  {data.financials?.income || 'Not recorded'}
                </p>
             </div>
             <div className="text-sm">
                <span className="block text-slate-500 text-xs mb-1 font-medium">Assets</span>
                <p className={`p-2 rounded border ${data.financials?.assets ? 'bg-amber-50 border-amber-100 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-300 italic'}`}>
                  {data.financials?.assets || 'Not recorded'}
                </p>
             </div>
          </div>
        </div>

        {/* Safety Alert */}
        {data.safetyConcerns && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-bold text-red-800">Safety Concerns Flagged</h5>
              <p className="text-xs text-red-700 mt-1">
                A C1A supplemental form will likely be required.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-white">
        <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:shadow-none" disabled>
          Generate Draft Documents
        </button>
      </div>
    </div>
  );
};
