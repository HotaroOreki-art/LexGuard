import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldAlert, Scale, Gavel, FileText, MessageSquare, Repeat, CheckCircle } from "lucide-react";
import { TypewriterText } from "./TypewriterText";

export type Clause = {
  clause_type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  risk_score: number;
  flagged_text: string;
  plain_english: string;
  why_risky: string;
  worst_case: string;
  shark_view: string;
  advocate_view: string;
  judge_verdict: string;
  negotiation_suggestion: string;
  rewritten_clause: string;
};

export function ClauseCard({ clause, index }: { clause: Clause; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRewritten, setIsRewritten] = useState(false);
  const [activeTab, setActiveTab] = useState<'shark' | 'advocate' | 'judge'>('shark');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low": return "text-green-400 border-green-500 bg-green-500/10";
      case "Medium": return "text-yellow-400 border-yellow-500 bg-yellow-500/10";
      case "High": return "text-orange-500 border-orange-500 bg-orange-500/10";
      case "Critical": return "text-red-500 border-red-600 bg-red-500/10";
      default: return "text-slate-400 border-slate-500 bg-slate-500/10";
    }
  };

  const severityColor = getSeverityColor(clause.severity);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-slate-900/60 border rounded-2xl overflow-hidden mb-6 transition-colors duration-500 ${isRewritten ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-slate-800'}`}
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 cursor-pointer hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${isRewritten ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10' : severityColor}`}>
              {isRewritten ? 'RESOLVED' : `${clause.severity} RISK`}
            </span>
            <span className="text-sm font-semibold text-slate-400">{clause.clause_type}</span>
          </div>
          <h3 className={`text-xl font-medium transition-colors ${isRewritten ? 'text-indigo-300' : 'text-slate-200'} line-clamp-1`}>
            {clause.plain_english}
          </h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className={`text-2xl font-bold ${isRewritten ? 'text-indigo-400' : 'text-slate-100'}`}>
              {isRewritten ? '0' : clause.risk_score}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Score</div>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="p-2 bg-slate-800 rounded-full text-slate-400">
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-slate-800/50 space-y-8">
              
              {/* Core Warning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-3 text-red-400 font-semibold">
                    <ShieldAlert className="w-5 h-5" />
                    <h4>Worst Case Scenario</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <TypewriterText text={clause.worst_case} delay={15} />
                  </p>
                </div>
                
                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 text-slate-400 font-semibold">
                    <FileText className="w-5 h-5" />
                    <h4>Target Contract Text</h4>
                  </div>
                  <div className="relative">
                    <p className={`text-sm italic border-l-2 pl-3 leading-relaxed transition-all duration-700 ${isRewritten ? 'text-slate-600 line-through border-slate-700' : 'text-slate-400 border-red-500/50'}`}>
                      {clause.flagged_text}
                    </p>
                    
                    <AnimatePresence>
                      {isRewritten && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 text-indigo-300 text-sm italic border-l-2 border-indigo-500 pl-3 leading-relaxed font-medium bg-indigo-950/30 p-2 rounded-r-lg"
                        >
                          {clause.rewritten_clause}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* The Agent Battleground (Tabbed Interface) */}
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('shark'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${activeTab === 'shark' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Scale className="w-4 h-4" /> Shark View
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('advocate'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${activeTab === 'advocate' ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ShieldAlert className="w-4 h-4" /> Advocate View
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('judge'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${activeTab === 'judge' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Gavel className="w-4 h-4" /> Judge Verdict
                  </button>
                </div>
                
                <div className="min-h-[100px] p-4 rounded-b-xl border border-t-0 border-slate-800 bg-slate-950/30">
                  {activeTab === 'shark' && (
                    <p className="text-slate-300 text-sm leading-relaxed">
                      <TypewriterText text={clause.shark_view} delay={10} />
                    </p>
                  )}
                  {activeTab === 'advocate' && (
                    <p className="text-slate-300 text-sm leading-relaxed">
                      <TypewriterText text={clause.advocate_view} delay={10} />
                    </p>
                  )}
                  {activeTab === 'judge' && (
                    <p className="text-slate-300 text-sm leading-relaxed">
                      <TypewriterText text={clause.judge_verdict} delay={10} />
                    </p>
                  )}
                </div>
              </div>

              {/* Actionables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-950/20 p-5 rounded-xl border border-green-900/30">
                  <div className="flex items-center gap-2 mb-3 text-green-400 font-semibold">
                    <MessageSquare className="w-5 h-5" />
                    <h4>Negotiation Suggestion</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{clause.negotiation_suggestion}</p>
                </div>
                
                <div className={`p-5 rounded-xl border transition-colors ${isRewritten ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-indigo-950/20 border-indigo-900/30'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                      <Repeat className="w-5 h-5" />
                      <h4>Fair Rewrite</h4>
                    </div>
                    {!isRewritten ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRewritten(true);
                        }}
                        className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors flex items-center gap-2"
                      >
                        Apply to Contract
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Applied
                      </div>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{clause.rewritten_clause}</p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
