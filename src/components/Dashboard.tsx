/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Briefcase, 
  Sparkles, 
  Plus, 
  Trash2, 
  Brain, 
  Mic, 
  FileSignature, 
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  LayoutDashboard,
  FileCheck,
  UserCheck,
  Flame,
  Award,
  BookOpen,
  Send,
  Sliders,
  Sparkle
} from "lucide-react";
import { ResumeData, JobDescriptionData, AnalysisResult, InterviewAttempt, CoverLetter } from "../types";
import { extractTextFromFile } from "../utils/fileExtractor";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  resumes: ResumeData[];
  jobs: JobDescriptionData[];
  analyses: AnalysisResult[];
  coverLetters: CoverLetter[];
  interviews: InterviewAttempt[];
  onUploadResume: (fileName: string, text: string) => Promise<void>;
  onAddJob: (title: string, company: string, text: string) => Promise<void>;
  onDeleteResume: (id: string) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  onSelectAction: (view: string, targetId?: string) => void;
  isLoading: boolean;
  userEmail?: string | null;
  activeWorkspaceTab: 'upload' | 'assets';
}

export default function Dashboard({
  resumes,
  jobs,
  analyses,
  coverLetters,
  interviews,
  onUploadResume,
  onAddJob,
  onDeleteResume,
  onDeleteJob,
  onSelectAction,
  isLoading,
  userEmail,
  activeWorkspaceTab
}: DashboardProps) {
  // Resume State Upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [manualResumeText, setManualResumeText] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [showManualResume, setShowManualResume] = useState(false);

  // Job Upload
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [jobText, setJobText] = useState("");
  const [isUploadingJob, setIsUploadingJob] = useState(false);
  const [jobError, setJobError] = useState("");
  const [showManualJob, setShowManualJob] = useState(false);

  // Hardcoded mock widget previews when user hasn't analyzed yet
  const fallbackAtsScore = 78;
  const fallbackMissingSkills = ["NextJS App Router", "Server-Side Gemini API", "Tailwind Theme", "CI/CD Pipeline Operations"];

  // Quick action upload handlers
  const handleResumeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setResumeError("");
    setIsUploadingResume(true);

    try {
      let extractedText = "";
      let nameToUse = "";

      if (resumeFile) {
        extractedText = await extractTextFromFile(resumeFile);
        nameToUse = resumeFile.name;
      } else if (manualResumeText.trim()) {
        extractedText = manualResumeText;
        nameToUse = `Paste Resume (${new Date().toLocaleDateString()})`;
      } else {
        throw new Error("Please select a file or copy plain resume text inside.");
      }

      await onUploadResume(nameToUse, extractedText);
      setResumeFile(null);
      setManualResumeText("");
      setShowManualResume(false);
    } catch (err: any) {
      setResumeError(err.message || "Could not read text from resume file.");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleJobSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobError("");
    setIsUploadingJob(true);

    if (!jobTitle.trim() || !companyName.trim()) {
      setJobError("Specify job title and target company.");
      setIsUploadingJob(false);
      return;
    }

    try {
      let textContent = "";

      if (jobFile) {
        textContent = await extractTextFromFile(jobFile);
      } else if (jobText.trim()) {
        textContent = jobText;
      } else {
        throw new Error("Add a job file or copy text guidelines.");
      }

      await onAddJob(jobTitle, companyName, textContent);
      setJobTitle("");
      setCompanyName("");
      setJobFile(null);
      setJobText("");
      setShowManualJob(false);
    } catch (err: any) {
      setJobError(err.message || "Failed to commit job information.");
    } finally {
      setIsUploadingJob(false);
    }
  };

  // Determine active parameters
  const currentResume = resumes[0] || null;
  const currentJob = jobs[0] || null;
  const activeAnalysis = analyses.find(a => currentResume && currentJob && a.resumeId === currentResume.id && a.jobId === currentJob.id) || null;

  return (
    <main className="p-4 lg:p-6 space-y-6 min-w-0">
      
      {/* Dynamic header row details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111827]/30 border border-slate-900/40 p-5 rounded-2xl backdrop-blur-md">
        <div className="space-y-0.5">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-white">
            AI Command Desk
          </h2>
          <p className="text-slate-450 text-[11px] font-semibold">
            Logged in profile: <span className="font-mono text-slate-300">{userEmail || "Guest Practiced Session"}</span>
          </p>
        </div>

        {/* Standard stats widget */}
        <div className="flex gap-3 sm:gap-4">
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-900 text-center min-w-[85px] hover:border-slate-800 transition-all shadow-lg shadow-black/45">
            <span className="text-slate-450 font-mono text-[9px] uppercase font-bold block tracking-wider">Resumes</span>
            <span className="text-white font-mono font-extrabold text-lg sm:text-xl block mt-0.5">{resumes.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-900 text-center min-w-[85px] hover:border-slate-800 transition-all shadow-lg shadow-black/45">
            <span className="text-slate-450 font-mono text-[9px] uppercase font-bold block tracking-wider">Targets</span>
            <span className="text-white font-mono font-extrabold text-lg sm:text-xl block mt-0.5">{jobs.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-[#14B8A6]/25 text-center min-w-[85px] hover:border-[#14B8A6]/55 transition-all shadow-lg shadow-[#14B8A6]/5">
            <span className="text-[#14B8A6] font-mono text-[9px] uppercase font-bold block tracking-wider">Interviews</span>
            <span className="text-[#A3FF3C] font-mono font-extrabold text-lg sm:text-xl block mt-0.5">{interviews.length}</span>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC CONTENT SPLIT WORK-DESK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-12 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: UPLOAD DOCUMENTS WORKSPACE */}
            {activeWorkspaceTab === 'upload' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* CV Resume upload card */}
                  <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-[#A3FF3C]/5 to-transparent rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-6 text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                      <FileCheck className="w-5 h-5 text-[#A3FF3C]" />
                      <span>Candidate CV / Resume Core Profile</span>
                    </div>

                    <form onSubmit={handleResumeSubmission} className="space-y-4">
                      
                      {/* Drag & Drop simulated field */}
                      <div className="h-44 border border-dashed border-slate-800 hover:border-[#A3FF3C]/50 rounded-2xl p-6 bg-slate-950/60 relative flex flex-col items-center justify-center transition-all">
                        <input 
                          type="file" 
                          accept=".txt,.docx,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setResumeFile(file);
                            if (file) setManualResumeText("");
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <FileText className="w-9 h-9 text-slate-500 mb-2" />
                        <span className="text-xs font-bold text-slate-350 text-center select-none leading-relaxed">
                          {resumeFile ? resumeFile.name : "Drag your resume file here or click to browse files"}
                        </span>
                        <span className="text-[10px] text-zinc-650 font-mono mt-1">Accepts plain PDF, DOCX, or TXT formats</span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <button 
                          type="button" 
                          onClick={() => setShowManualResume(!showManualResume)}
                          className="text-[#14B8A6] hover:underline"
                        >
                          {showManualResume ? "Close copy paste block" : "Or copy paste raw resume"}
                        </button>

                        <button 
                          type="submit"
                          disabled={isUploadingResume || (!resumeFile && !manualResumeText.trim())}
                          className="px-5 py-2 rounded-xl bg-[#A3FF3C] hover:bg-[#b0f554] disabled:bg-slate-900 disabled:text-slate-600 text-slate-950 font-extrabold cursor-pointer"
                        >
                          {isUploadingResume ? "Parsing resume vectors..." : "Save Resume Profile"}
                        </button>
                      </div>

                      {showManualResume && (
                        <textarea 
                          value={manualResumeText}
                          onChange={(e) => {
                            setManualResumeText(e.target.value);
                            setResumeFile(null);
                          }}
                          placeholder="Paste plaintext resume contents..."
                          className="w-full h-40 bg-slate-950 border border-slate-900 focus:outline-none focus:border-[#A3FF3C]/40 p-4 rounded-xl text-slate-300 text-xs font-mono"
                        />
                      )}

                      {resumeError && (
                        <div className="p-3 bg-red-950/15 border border-red-900/20 rounded-xl text-red-400 text-[11px] flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{resumeError}</span>
                        </div>
                      )}
                    </form>

                    {/* Stored resume details if uploaded */}
                    {resumes.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-slate-900">
                        <p className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-widest mb-3">Stored Resume Profile Active</p>
                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-900">
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            <FileText className="w-4 h-4 text-[#A3FF3C] shrink-0" />
                            <span className="text-xs font-bold font-mono text-white truncate">{resumes[0].fileName}</span>
                          </div>
                          <button 
                            onClick={() => onDeleteResume(resumes[0].id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20"
                            title="Delete resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target JD upload card */}
                  <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-[#14B8A6]/5 to-transparent rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-6 text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                      <Briefcase className="w-5 h-5 text-[#14B8A6]" />
                      <span>Target Job Description Matrix</span>
                    </div>

                    <form onSubmit={handleJobSubmission} className="space-y-4">
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-xs">
                          <label className="text-slate-450 block font-bold">Job Title</label>
                          <input 
                            type="text"
                            required
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Lead Staff Architect"
                            className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 focus:outline-none focus:border-[#14B8A6]/50 text-slate-200"
                          />
                        </div>
                        <div className="space-y-1 text-xs">
                          <label className="text-slate-450 block font-bold">Company Name</label>
                          <input 
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. OpenAI"
                            className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 focus:outline-none focus:border-[#14B8A6]/50 text-slate-200"
                          />
                        </div>
                      </div>

                      {/* Drag & Drop simulated field */}
                      <div className="h-28 border border-dashed border-slate-800 hover:border-[#14B8A6]/50 rounded-2xl p-4 bg-slate-950/60 relative flex flex-col items-center justify-center transition-all">
                        <input 
                          type="file" 
                          accept=".txt,.docx,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setJobFile(file);
                            if (file) setJobText("");
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Briefcase className="w-7 h-7 text-slate-500 mb-1" />
                        <span className="text-[11px] font-bold text-slate-350 text-center select-none max-w-full truncate px-2">
                          {jobFile ? jobFile.name : "Upload Job Post Description file"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <button 
                          type="button" 
                          onClick={() => setShowManualJob(!showManualJob)}
                          className="text-[#14B8A6] hover:underline"
                        >
                          {showManualJob ? "Hide paste details input" : "Or copy paste JD guidelines"}
                        </button>

                        <button 
                          type="submit"
                          disabled={isUploadingJob || (!jobFile && !jobText.trim()) || !jobTitle.trim()}
                          className="px-5 py-2 rounded-xl bg-[#14B8A6] text-slate-950 font-extrabold cursor-pointer hover:bg-[#1bb3a2]"
                        >
                          {isUploadingJob ? "Parsing credentials..." : "Save Job Guidelines"}
                        </button>
                      </div>

                      {showManualJob && (
                        <textarea 
                          value={jobText}
                          onChange={(e) => {
                            setJobText(e.target.value);
                            setJobFile(null);
                          }}
                          placeholder="Paste target job post text..."
                          className="w-full h-40 bg-slate-950 border border-slate-900 focus:outline-none focus:border-[#14B8A6]/40 p-4 rounded-xl text-slate-300 text-xs font-mono"
                        />
                      )}

                      {jobError && (
                        <div className="p-3 bg-red-950/15 border border-red-900/20 rounded-xl text-red-400 text-[11px] flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{jobError}</span>
                        </div>
                      )}
                    </form>

                    {/* Stored jobs details */}
                    {jobs.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-slate-900">
                        <p className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-widest mb-3">Stored Active Job Focus</p>
                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-900">
                          <div className="overflow-hidden pr-2">
                            <span className="text-xs font-bold text-white block truncate">{jobs[0].title}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 block mt-0.5">{jobs[0].companyName}</span>
                          </div>
                          <button 
                            onClick={() => onDeleteJob(jobs[0].id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20"
                            title="Delete job details"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: ASSETS LIST (RESUMES & JOBS SAVED PORTFOLIO) */}
              {activeWorkspaceTab === 'assets' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Resumes registered list */}
                    <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 text-left">
                      <h4 className="text-xs font-mono font-bold uppercase text-[#A3FF3C] mb-4 flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5" />
                        Uploaded Career Resumes ({resumes.length})
                      </h4>

                      {resumes.length === 0 ? (
                        <p className="text-slate-500 italic text-xs py-10 text-center font-medium border border-dashed border-slate-850 rounded-2xl bg-slate-950">No registered resumes. Put files inside Document Upload!</p>
                      ) : (
                        <div className="space-y-3">
                          {resumes.map(r => (
                            <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex justify-between items-center hover:border-slate-800 transition-all">
                              <div className="overflow-hidden pr-3">
                                <span className="text-xs font-bold font-mono text-zinc-100 block truncate">{r.fileName}</span>
                                <span className="text-[10px] text-slate-500 font-mono block mt-1">Uploaded: {new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                              <button 
                                onClick={() => onDeleteResume(r.id)}
                                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Jobs registered list */}
                    <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 text-left">
                      <h4 className="text-xs font-mono font-bold uppercase text-[#14B8A6] mb-4 flex items-center gap-2">
                        <Briefcase className="w-4.5 h-4.5" />
                        Target Job Guidelines ({jobs.length})
                      </h4>

                      {jobs.length === 0 ? (
                        <p className="text-slate-500 italic text-xs py-10 text-center font-medium border border-dashed border-slate-850 rounded-2xl bg-slate-950">No saved targets listed. Add target specifications!</p>
                      ) : (
                        <div className="space-y-3">
                          {jobs.map(j => (
                            <div key={j.id} className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex justify-between items-center hover:border-slate-800 transition-all">
                              <div className="overflow-hidden pr-3">
                                <span className="text-xs font-bold font-medium text-white block truncate">{j.title}</span>
                                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{j.companyName}</span>
                              </div>
                              <button 
                                onClick={() => onDeleteJob(j.id)}
                                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

    </main>
  );
}
