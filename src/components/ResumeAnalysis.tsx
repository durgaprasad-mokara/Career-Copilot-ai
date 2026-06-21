/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Target, 
  FileText, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Brain, 
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Flame,
  Lightbulb,
  Zap,
  Info
} from "lucide-react";
import { ResumeData, JobDescriptionData, AnalysisResult } from "../types";
import { getFallbackAnalysis } from "../utils/fallbacks";
import { motion, AnimatePresence } from "motion/react";

interface ResumeAnalysisProps {
  resumes: ResumeData[];
  jobs: JobDescriptionData[];
  analyses: AnalysisResult[];
  onBackToDashboard: () => void;
  onSaveAnalysis: (analysis: AnalysisResult) => void;
  isLoading: boolean;
  defaultJobId?: string;
}

export default function ResumeAnalysis({
  resumes,
  jobs,
  analyses,
  onBackToDashboard,
  onSaveAnalysis,
  isLoading: initialIsLoading,
  defaultJobId
}: ResumeAnalysisProps) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [selectedJobId, setSelectedJobId] = useState(defaultJobId || jobs[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(() => {
    if (defaultJobId) {
      const existing = analyses.find(a => a.jobId === defaultJobId);
      return existing || null;
    }
    return null;
  });
  const [isUsingFallback, setIsUsingFallback] = useState(currentResult?._isFallback || false);

  const handleRunAnalysis = async () => {
    setErrorMsg("");
    
    const resume = resumes.find(r => r.id === selectedResumeId);
    const job = jobs.find(j => j.id === selectedJobId);

    if (!resume) {
      setErrorMsg("Please upload and select a resume core profile first.");
      return;
    }
    if (!job) {
      setErrorMsg("Please add and select a target job description specifications first.");
      return;
    }

    setIsLoading(true);

    try {
      let report;
      try {
        const response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: resume.extractedText,
            jobDescription: job.text
          })
        });

        if (!response.ok) {
          throw new Error("Local proxy server is offline or returned an error status.");
        }
        report = await response.json();
      } catch (fetchErr) {
        console.warn("[Standalone Client Mode] Falling back to high-fidelity offline analysis engine:", fetchErr);
        report = getFallbackAnalysis(resume.extractedText, job.text);
      }

      setIsUsingFallback(!!report._isFallback);
      
      const analysisObj: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        userId: "guest",
        resumeId: selectedResumeId,
        jobId: selectedJobId,
        matchScore: report.matchScore || 0,
        atsScore: report.atsScore || report.matchScore || 0,
        matchingSkills: report.matchingSkills || [],
        missingSkills: report.missingSkills || [],
        missingKeywords: report.missingKeywords || [],
        experienceGap: report.experienceGap || "No tenure issues discovered",
        educationGap: report.educationGap || "No specific educational gaps outlined",
        strengthPoints: report.strengthPoints || [],
        weaknessPoints: report.weaknessPoints || [],
        actionableFormattingTips: report.actionableFormattingTips || [],
        recommendations: report.recommendations || [],
        createdAt: new Date().toISOString(),
        _isFallback: true // explicitly set so user knows it's modeled offline fallback / local processing
      };

      setCurrentResult(analysisObj);
      onSaveAnalysis(analysisObj);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during Gemini processing.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="max-w-[1500px] mx-auto min-h-0 text-gray-150 font-sans p-6 leading-relaxed">
      
      {/* 1. HEADER PANEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-900">
        <div className="flex items-center gap-4">
          {/* <button
            onClick={onBackToDashboard}
            className="p-3 rounded-2xl bg-slate-955 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Return to main dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-[#14B8A6]" />
          </button> */}
          <div>
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
              ATS Comparative Audit Center
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Audit credentials against target roles to bypass automated scanner algorithms.</p>
          </div>
        </div>
        
        {currentResult && (
          <button
            onClick={handleRunAnalysis}
            disabled={isLoading || !selectedResumeId || !selectedJobId}
            className="px-5 py-3 rounded-2xl bg-[#A3FF3C] hover:bg-[#b0f554] disabled:bg-slate-900 disabled:text-slate-650 text-slate-950 text-xs font-black uppercase tracking-wider font-display flex items-center gap-2 transition-transform cursor-pointer shadow-md"
            id="re-analyze-btn"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? "Analyzing indices..." : "Update Scan Score"}
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-955/20 border border-red-900/40 rounded-2xl text-red-400 text-xs font-semibold mb-8 max-w-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-505 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. MATCH SPECIFIER INPUTS (Runs when no active analysis computed yet) */}
      {!currentResult && (
        <div className="p-8 rounded-3xl bg-[#111827] border border-slate-800 max-w-3xl mx-auto text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3FF3C]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-14 h-14 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/15 text-[#14B8A6] flex items-center justify-center mx-auto">
            <Target className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-extrabold font-display text-white">Specify Assessment Context</h3>
            <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed font-semibold">
              Select one saved resume and target job requirements. Gemini will perform comparative key-value queries to output immediate ATS recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {/* Resume drop down selector */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 block font-bold">Base Candidate Resume</label>
              {resumes.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-900 rounded-xl text-center text-slate-500 bg-slate-950 font-semibold">
                  No saved portfolios. Upload a resume file inside workspace.
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 pl-4 focus:outline-none focus:border-[#14B8A6]/40 text-slate-200 text-xs font-semibold"
                  id="select-resume-dropdown"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#111827]">{r.fileName}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Job selector dropdown */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 block font-bold">Target Job Description</label>
              {jobs.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-900 rounded-xl text-center text-slate-500 bg-slate-950 font-semibold">
                  No listed jobs. Please specify target corporate post in Desk.
                </div>
              ) : (
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 pl-4 focus:outline-none focus:border-[#14B8A6]/40 text-slate-200 text-xs font-semibold"
                  id="select-jd-dropdown"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id} className="bg-[#111827]">{j.title} at {j.companyName}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isLoading || resumes.length === 0 || jobs.length === 0}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#A3FF3C] hover:bg-[#b0f554] disabled:bg-slate-900 disabled:text-slate-650 text-slate-950 font-black text-xs uppercase tracking-wider font-display transition-transform inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#A3FF3C]/10"
            id="run-analysis-btn"
          >
            {isLoading ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                Evaluating Qualifications Matrix...
              </>
            ) : (
              <>
                Compute ATS Alignment Report
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* 3. LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0B0F19]/85 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-sm p-8 bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-900 border-t-[#14B8A6] animate-spin"></div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold font-display text-white">Consulting Gemini Expert</h3>
              <p className="text-slate-405 text-xs font-semibold leading-relaxed">Mapping hard credentials tenure, auditing ATS semantic patterns, and grading bullet metrics...</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. PERFORMANCE REPORT PANEL */}
      {currentResult && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {isUsingFallback && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-semibold flex items-start gap-3 max-w-4xl">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-extrabold text-white mb-0.5 flex items-center gap-1.5">
                  Optimal Fallback Knowledge Mode Activated
                </h4>
                <p className="text-slate-400 font-medium">
                  Completed successfully using our expert-curated local CV knowledge base. To activate live Gemini API models, please update your keys in Settings once current free-tier hourly usage limits reset.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Core Meter indicators */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6">
            
            <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3FF3C]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row justify-around gap-4 items-center mb-6">
                {/* Meter 1: Match Score */}
                <div className="text-center space-y-2">
                  <span className="text-[9px] font-mono uppercase bg-[#14B8A6]/10 border border-[#14B8A6]/15 text-[#14B8A6] px-2.5 py-1 rounded-full font-bold tracking-wider">
                    ROLE MATCH
                  </span>
                  
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="50" className="stroke-slate-950 fill-none" strokeWidth="6" />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-[#14B8A6] fill-none transition-all duration-1000 ease-out"
                        strokeWidth="6"
                        strokeDasharray={314}
                        strokeDashoffset={314 - (314 * currentResult.matchScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="text-center relative">
                      <span className="text-2xl font-black font-display text-white tracking-tighter block">{currentResult.matchScore}%</span>
                      <span className="text-slate-500 text-[8px] uppercase tracking-widest font-mono font-bold block mt-0.5">FIT</span>
                    </div>
                  </div>
                </div>

                {/* Meter 2: ATS Scanner Score */}
                <div className="text-center space-y-2">
                  <span className="text-[9px] font-mono uppercase bg-[#A3FF3C]/10 border border-[#A3FF3C]/15 text-[#A3FF3C] px-2.5 py-1 rounded-full font-bold tracking-wider">
                    ATS SCAN
                  </span>
                  
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="50" className="stroke-slate-950 fill-none" strokeWidth="6" />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-[#A3FF3C] fill-none transition-all duration-1000 ease-out"
                        strokeWidth="6"
                        strokeDasharray={314}
                        strokeDashoffset={314 - (314 * (currentResult.atsScore || currentResult.matchScore)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="text-center relative">
                      <span className="text-2xl font-black font-display text-white tracking-tighter block">{currentResult.atsScore || currentResult.matchScore}%</span>
                      <span className="text-slate-500 text-[8px] uppercase tracking-widest font-mono font-bold block mt-0.5">SCORE</span>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="text-sm md:text-base font-black font-display text-white">
                {currentResult.matchScore >= 80 ? "Optimized Qualification Index" :
                 currentResult.matchScore >= 65 ? "Detected Keyword Deficit" :
                 "Significant Formatting Optimization Advised"}
              </h4>

              <p className="text-slate-400 text-xs mt-3 leading-relaxed font-semibold max-w-xs mx-auto">
                Modern enterprise parsers scan matching phrase indexes. Score criteria above 80% minimize candidate rejection chances.
              </p>
            </div>

            {/* Comparing details badge card */}
            <div className="p-6 rounded-3xl bg-[#111827]/60 border border-slate-905 text-xs shadow-md">
              <h4 className="text-slate-500 uppercase font-bold font-mono tracking-widest block mb-4">CORRELATED PARAMETERS</h4>
              <div className="space-y-3 font-semibold">
                <div className="flex justify-between items-center py-2 border-b border-slate-900">
                  <span className="text-slate-405">Target Role:</span>
                  <span className="font-bold text-white max-w-[150px] truncate">{selectedJob ? selectedJob.title : "Corporate Goal"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-900">
                  <span className="text-slate-405">Enterprise Context:</span>
                  <span className="font-bold text-white max-w-[150px] truncate">{selectedJob ? selectedJob.companyName : "Enterprise"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-405">Generated On:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{new Date(currentResult.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Detailed gaps & formatting recommendations */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
            
            {/* Structural Gaps Block */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-8">
              <h3 className="text-base font-extrabold font-display text-white flex items-center gap-2 border-b border-slate-900 pb-4">
                <AlertTriangle className="w-5 h-5 text-[#14B8A6]" />
                Qualification Depolarization & Gaps
              </h3>

              <div className="space-y-6">
                
                {/* 1. Absent skills */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-red-950/30 border border-red-900/30 text-red-400">
                      Absent Technical Skills
                    </span>
                    <span className="text-[11px] text-slate-450 font-semibold">Incorporate these phrases directly inside bullet points:</span>
                  </div>

                  {currentResult.missingSkills.length === 0 ? (
                    <p className="text-xs text-[#14B8A6] italic font-bold">Outstanding credential match index! No critical absent skills.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {currentResult.missingSkills.map((sk, index) => (
                        <span key={index} className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-300 text-xs font-mono font-bold">
                          ⚠ {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Missing core keywords */}
                <div className="space-y-2.5 pt-6 border-t border-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-amber-950/30 border border-amber-900/30 text-amber-400">
                      Absent ATS Keywords
                    </span>
                    <span className="text-[11px] text-slate-450 font-semibold">Essential terms frequently referenced inside the target posting:</span>
                  </div>

                  {currentResult.missingKeywords.length === 0 ? (
                    <p className="text-xs text-[#14B8A6] italic font-bold font-semibold">Phrase semantic densities are fully optimized.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {currentResult.missingKeywords.map((kw, index) => (
                        <span key={index} className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-900 text-slate-400 text-xs font-mono font-bold">
                          # {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Tenure gap grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-900">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-905">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 font-display text-xs font-bold uppercase">
                      <Briefcase className="w-4 h-4 text-[#14B8A6]" />
                      <span>Experience Tenure Gap</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-semibold">{currentResult.experienceGap}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-905">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 font-display text-xs font-bold uppercase">
                      <BookOpen className="w-4 h-4 text-[#A3FF3C]" />
                      <span>Creds & Education Alignment</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-semibold">{currentResult.educationGap}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Strengths / Weaknesses Dual column panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl text-left">
                <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-[#14B8A6] mb-4 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <CheckCircle className="w-4.5 h-4.5" />
                  Key Qualification Strengths ({currentResult.strengthPoints.length})
                </h4>
                <ul className="space-y-3 font-semibold text-xs leading-relaxed text-slate-400">
                  {currentResult.strengthPoints.map((st, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[#14B8A6] font-extrabold font-mono text-sm leading-none">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl text-left">
                <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-red-400 mb-4 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  Suggested Bullet Overhauls ({currentResult.weaknessPoints.length})
                </h4>
                <ul className="space-y-3 font-semibold text-xs leading-relaxed text-slate-400">
                  {currentResult.weaknessPoints.map((wk, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-red-500 font-extrabold font-mono text-sm leading-none">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Formatting Tips details card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl text-left">
                <h4 className="text-sm font-extrabold font-display text-white mb-6 flex items-center gap-2">
                  <Lightbulb className="w-4.5 h-4.5 text-[#A3FF3C]" />
                  ATS Actionable Layout & Formatting Advice
                </h4>
                <div className="space-y-3">
                  {currentResult.actionableFormattingTips.map((tip, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-905 text-slate-350 text-xs leading-relaxed flex items-start gap-3 font-semibold">
                      <span className="w-5 h-5 rounded-lg bg-[#A3FF3C]/10 border border-[#A3FF3C]/15 text-[#A3FF3C] font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        0{i + 1}
                      </span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl text-left">
                <h4 className="text-sm font-extrabold font-display text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-[#14B8A6]" />
                  AI Carrier Strategic Recommendations
                </h4>
                <div className="space-y-3">
                  {(currentResult.recommendations && currentResult.recommendations.length > 0) ? (
                    currentResult.recommendations.map((rec, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-905 text-slate-350 text-xs leading-relaxed flex items-start gap-3 font-semibold">
                        <span className="w-5 h-5 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/15 text-[#14B8A6] font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          0{i + 1}
                        </span>
                        <span>{rec}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 italic bg-slate-950 rounded-xl border border-slate-905">
                      No custom recommendations loaded. Update your score with new criteria.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
        </div>
      )}

    </div>
  );
}
