"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Scale, Gavel, Loader2, FileText, UploadCloud, Activity, CheckCircle2, AlertTriangle, AlertCircle, Info, Download } from "lucide-react";
import { ClauseCard, type Clause } from "@/components/ClauseCard";
import { ParticleBackground } from "@/components/ParticleBackground";
import { TypewriterText } from "@/components/TypewriterText";
import { playScanHum, playThud } from "@/lib/audio";
import { useReactToPrint } from "react-to-print";

type AnalysisResult = {
  overall_score: number;
  category_scores: Record<string, number>;
  trust_metrics: Record<string, number>;
  industry_aggression_score: string;
  final_verdict: {
    summary: string;
    top_dangers: string[];
    power_imbalance: string;
  };
  clauses: Clause[];
};

export default function Home() {
  const [contractText, setContractText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const targetRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: targetRef, documentTitle: 'LEXGUARD_Risk_Report' });

  // Load recent scans on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lexguard_recent_scans');
      if (saved) setRecentScans(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load recent scans", e);
    }
  }, []);

  const saveToRecent = (data: AnalysisResult, name: string) => {
    try {
      const newScan = {
        id: Date.now(),
        name,
        date: new Date().toLocaleDateString(),
        score: data.overall_score,
        data
      };
      const updated = [newScan, ...recentScans].slice(0, 3); // Keep only last 3
      setRecentScans(updated);
      localStorage.setItem('lexguard_recent_scans', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save recent scan", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setContractText(""); // clear text if file uploaded
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async () => {
    if (!contractText.trim() && !file) return;
    
    setIsAnalyzing(true);
    setResults(null);
    setErrorMsg(null);
    
    // Start Audio Scan Hum
    const stopHum = playScanHum();

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("contractText", contractText);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: file ? formData : JSON.stringify({ contractText }),
        headers: file ? {} : { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        let errorText = "Failed to analyze contract";
        try {
          const errData = await response.json();
          errorText = errData.error || errorText;
        } catch {
          errorText = await response.text();
        }
        throw new Error(errorText);
      }

      const data = await response.json();
      setResults(data);
      saveToRecent(data, file ? file.name : "Pasted Text Document");
      
      // Stop Hum and Play Thud!
      stopHum();
      playThud();
      
    } catch (error: any) {
      console.error("Analysis error:", error);
      setErrorMsg(error.message || "An unexpected error occurred.");
      stopHum();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return { text: "text-green-400", border: "border-green-500", shadow: "shadow-[0_0_30px_rgba(34,197,94,0.4)]", bg: "bg-green-500/10" };
    if (score <= 70) return { text: "text-yellow-400", border: "border-yellow-500", shadow: "shadow-[0_0_30px_rgba(234,179,8,0.4)]", bg: "bg-yellow-500/10" };
    return { text: "text-red-500", border: "border-red-600", shadow: "shadow-[0_0_40px_rgba(220,38,38,0.6)]", bg: "bg-red-500/10" };
  };

  const getHeatmapColor = (severity: string) => {
    switch(severity) {
      case "Low": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "High": return "bg-orange-500";
      case "Critical": return "bg-red-600";
      default: return "bg-slate-500";
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden relative pb-20">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              LEXGUARD v2.0 Live
            </div>
          </div>

          <div className="inline-flex items-center justify-center space-x-4 mb-6">
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <ShieldAlert className="w-12 h-12 text-indigo-500 relative z-10" />
            </div>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-400 animate-gradient-x">
              LEXGUARD
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            Detect exploitative clauses, hidden liabilities, and real-world risks <span className="text-slate-200 font-medium">before</span> you sign.
          </p>
        </motion.div>

        {/* Input System */}
        {!results && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 animate-gradient-x transition duration-1000" />
            <div className="relative bg-slate-900/90 backdrop-blur-2xl ring-1 ring-white/10 rounded-3xl p-1 shadow-2xl">
              <div className="bg-slate-950 rounded-[22px] p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* File Upload */}
                  <div 
                    className={`relative overflow-hidden border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group/dropzone ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-800/80'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden" 
                      accept=".pdf,.docx,.txt"
                    />
                    {file ? (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/30">
                          <FileText className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-lg font-semibold text-slate-200 truncate w-full px-4">{file.name}</p>
                        <p className="text-sm text-indigo-400/80 mt-2 font-medium">Click to change document</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 border border-slate-700 group-hover/dropzone:bg-indigo-500/10 group-hover/dropzone:border-indigo-500/30 transition-colors">
                          <UploadCloud className="w-8 h-8 text-slate-400 group-hover/dropzone:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-lg font-medium text-slate-200">Upload Document</p>
                        <p className="text-sm text-slate-500 mt-2 font-medium">PDF, DOCX, or TXT</p>
                      </>
                    )}
                  </div>

                  {/* Text Paste */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3 text-slate-500">
                      <span className="text-xs font-bold uppercase tracking-widest">Or Paste Raw Text</span>
                    </div>
                    <textarea
                      value={contractText}
                      onChange={(e) => { setContractText(e.target.value); setFile(null); }}
                      placeholder="Paste the Terms of Service, EULA, or agreement here..."
                      className="flex-1 w-full bg-slate-900/50 text-slate-200 rounded-2xl p-5 border border-slate-700/50 focus:border-indigo-500/50 focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder-slate-600 font-mono text-sm shadow-inner"
                      spellCheck={false}
                    />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col items-center">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!contractText.trim() && !file)}
                    className="relative overflow-hidden w-full sm:w-3/4 px-8 py-5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center space-x-3"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        <span className="text-slate-800">Agents Analyzing Contract...</span>
                      </>
                    ) : (
                      <>
                        <span>Commence Adversarial Analysis</span>
                        <Activity className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 mt-4 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> End-to-end encrypted analysis. We do not store your documents.
                  </p>
                  
                  {/* Error Message Display */}
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 p-4 w-full sm:w-3/4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3 text-red-400 text-sm"
                      >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium">{errorMsg}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
              >
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Scans</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {recentScans.map((scan) => (
                    <button 
                      key={scan.id}
                      onClick={() => setResults(scan.data)}
                      className="px-4 py-2 bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2 group"
                    >
                      <span className={`w-2 h-2 rounded-full ${scan.score > 70 ? 'bg-red-500' : scan.score > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      <span className="truncate max-w-[150px]">{scan.name}</span>
                      <span className="text-xs text-slate-600 ml-2 group-hover:text-indigo-400">{scan.date}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        )}

        {/* Results Dashboard */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 space-y-8"
              ref={targetRef}
            >
              {/* PDF Export Button */}
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => handlePrint()} 
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
                >
                  <Download className="w-4 h-4" /> Export Risk Report
                </button>
              </div>

              {/* Top Row: Risk Meter & Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Meter Card */}
                <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                  <h3 className="text-xl font-bold text-slate-300 mb-8 w-full text-center tracking-wide uppercase">Overall Risk Score</h3>
                  <div className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center border-[8px] ${getScoreColor(results.overall_score).border} ${getScoreColor(results.overall_score).bg} ${getScoreColor(results.overall_score).shadow} transition-all duration-1000`}>
                    <span className={`text-7xl font-black tracking-tighter ${getScoreColor(results.overall_score).text}`}>
                      {results.overall_score}
                    </span>
                    <span className="text-sm font-bold text-slate-400 mt-1">/ 100</span>
                  </div>
                  <div className="mt-8 px-4 py-2 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Industry Aggression: <span className="text-indigo-400">{results.industry_aggression_score}</span>
                  </div>
                </div>

                {/* Metrics Panels */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Category Scores */}
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400" /> Category Risks
                    </h3>
                    <div className="space-y-5">
                      {Object.entries(results.category_scores).map(([category, score]) => (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-slate-400">{category}</span>
                            <span className={score > 70 ? 'text-red-400' : score > 40 ? 'text-yellow-400' : 'text-green-400'}>{score}/100</span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-full rounded-full ${score > 70 ? 'bg-red-500' : score > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust Metrics */}
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-blue-400" /> Trust & Fairness Metrics
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(results.trust_metrics).map(([metric, score]) => (
                        <div key={metric} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800/50">
                          <span className="text-slate-300 font-medium">{metric}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-indigo-400">{score}</span>
                            <span className="text-xs text-slate-500">/ 100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* The Verdict */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                        <Gavel className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">Final Contract Verdict</h2>
                    </div>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium mb-6 min-h-[100px]">
                      <TypewriterText text={results.final_verdict.summary} delay={15} />
                    </p>
                    <div className="p-5 rounded-xl bg-red-950/20 border border-red-900/30">
                      <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Power Imbalance Analysis</h4>
                      <p className="text-slate-300 text-sm">{results.final_verdict.power_imbalance}</p>
                    </div>
                  </div>
                  <div className="md:col-span-1 border-l border-slate-800 pl-0 md:pl-12">
                    <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" /> Top Dangers
                    </h3>
                    <ul className="space-y-4">
                      {results.final_verdict.top_dangers.map((danger, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          <span className="text-slate-300 text-sm leading-snug">{danger}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contract Heatmap */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-200">Contract Risk Heatmap</h3>
                  <div className="flex gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500"/> Safe</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-500"/> Warning</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-500"/> High Risk</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-600"/> Critical</span>
                  </div>
                </div>
                <div className="flex w-full h-8 rounded-lg overflow-hidden bg-slate-950 shadow-inner">
                  {results.clauses.map((clause, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 1 + (i * 0.05) }}
                      className={`h-full flex-1 border-r border-slate-900/50 last:border-0 ${getHeatmapColor(clause.severity)}`}
                      title={`${clause.clause_type}: ${clause.severity} Risk`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-slate-500 mt-4">Visual representation of clause severity across the document</p>
              </div>

              {/* Clause Breakdown */}
              <div className="mt-16 pt-8 border-t border-slate-800/50">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tight mb-4">Clause-by-Clause Breakdown</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">Expand each flagged clause to view the exact text, AI agent perspectives, negotiation suggestions, and fairer rewrites.</p>
                </div>
                
                <div className="max-w-5xl mx-auto">
                  {results.clauses.map((clause, index) => (
                    <ClauseCard key={index} clause={clause} index={index} />
                  ))}
                </div>
              </div>

              {/* Minimalist Disclaimer */}
              <div className="mt-20 pt-8 border-t border-slate-800/50 text-center text-xs text-slate-500 max-w-4xl mx-auto flex items-center justify-center gap-2">
                <Info className="w-3.5 h-3.5" />
                <p>
                  <span className="font-semibold text-slate-400">Disclaimer:</span> LEXGUARD provides AI-assisted analysis, not formal legal advice. Findings should not replace consultation with a legal professional.
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
