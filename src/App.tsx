/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  LogOut, 
  LogIn, 
  UserPlus, 
  User, 
  Lock, 
  Mail, 
  CircleAlert, 
  X,
  Compass,
  Sun,
  Moon,
  LayoutDashboard,
  Brain,
  Clock,
  Mic,
  Sliders,
  FileSignature,
  FileText
} from "lucide-react";

// Types
import { 
  ResumeData, 
  JobDescriptionData, 
  AnalysisResult, 
  CoverLetter, 
  ATSResume, 
  InterviewAttempt, 
  InterviewQuestion 
} from "./types";

// Page Components
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import ResumeAnalysis from "./components/ResumeAnalysis";
import ATSResumeBuilder from "./components/ATSResumeBuilder";
import CoverLetterBuilder from "./components/CoverLetterBuilder";
import InterviewPractice from "./components/InterviewPractice";
import VoiceInterviewRoom from "./components/VoiceInterviewRoom";
import FeedbackReport from "./components/FeedbackReport";

type ViewState = 
  | 'landing'
  | 'dashboard'
  | 'resume-analysis'
  | 'ats-builder'
  | 'cover-letter'
  | 'interview-prep'
  | 'voice-room'
  | 'feedback-report';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    localStorage.removeItem("theme");
  }, []);

  // Core portfolio records
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [jobs, setJobs] = useState<JobDescriptionData[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [interviews, setInterviews] = useState<InterviewAttempt[]>([]);

  // Selected sub target id reference
  const [targetIdRef, setTargetIdRef] = useState<string | undefined>(undefined);

  // Global Sidebar Navigation and Tabs
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'upload' | 'assets'>('upload');

  // Active interview states
  const [activePartnerQuestions, setActivePartnerQuestions] = useState<InterviewQuestion[]>([]);
  const [activeRoomJobTitle, setActiveRoomJobTitle] = useState("");
  const [activeRoomCompany, setActiveRoomCompany] = useState("");
  const [currentFeedbackReport, setCurrentFeedbackReport] = useState<InterviewAttempt | null>(null);

  // Load local data on mount
  useEffect(() => {
    setIsLoading(true);
    loadLocalData();
    setIsLoading(false);
  }, []);

  const loadLocalData = () => {
    try {
      const cvs = localStorage.getItem("guest_resumes");
      const listJobs = localStorage.getItem("guest_jobs");
      const audits = localStorage.getItem("guest_analyses");
      const letters = localStorage.getItem("guest_letters");
      const sims = localStorage.getItem("guest_interviews");

      if (cvs) setResumes(JSON.parse(cvs));
      if (listJobs) setJobs(JSON.parse(listJobs));
      if (audits) setAnalyses(JSON.parse(audits));
      if (letters) setCoverLetters(JSON.parse(letters));
      if (sims) setInterviews(JSON.parse(sims));
    } catch (e) {
      console.error("Local Storage loaded with errors:", e);
    }
  };

  const saveLocalData = (type: string, data: any) => {
    try {
      localStorage.setItem(`guest_${type}`, JSON.stringify(data));
    } catch (e) {
      console.error("Local storage sync failed:", e);
    }
  };

  // --- Handlers & Mutators ---

  // Resume Upload / Save
  const handleUploadResume = async (fileName: string, extractedText: string) => {
    const newResume: ResumeData = {
      id: `resume_${Date.now()}`,
      userId: "guest",
      fileName,
      extractedText,
      createdAt: new Date().toISOString()
    };

    const updatedResumes = [newResume, ...resumes];
    setResumes(updatedResumes);
    saveLocalData("resumes", updatedResumes);
  };

  // Target Job Add / Save
  const handleAddJob = async (title: string, companyName: string, text: string) => {
    const newJob: JobDescriptionData = {
      id: `job_${Date.now()}`,
      userId: "guest",
      title,
      companyName,
      text,
      createdAt: new Date().toISOString()
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    saveLocalData("jobs", updatedJobs);
  };

  // Saved Analyses / Save comparison
  const handleSaveAnalysis = async (report: AnalysisResult) => {
    const reportWithUserId = { ...report, userId: "guest" };
    const updatedAnalyses = [reportWithUserId, ...analyses];
    setAnalyses(updatedAnalyses);
    saveLocalData("analyses", updatedAnalyses);
  };

  // Saved Cover Letter
  const handleSaveCoverLetter = async (letter: CoverLetter) => {
    const letterWithUserId = { ...letter, userId: "guest" };
    const updatedLetters = [letterWithUserId, ...coverLetters];
    setCoverLetters(updatedLetters);
    saveLocalData("letters", updatedLetters);
  };

  // Completed Interview attempt save
  const handleSaveInterviewAttempt = async (attempt: InterviewAttempt) => {
    const attemptWithUser = { ...attempt, userId: "guest" };
    const updatedInterviews = [attemptWithUser, ...interviews];
    setInterviews(updatedInterviews);
    saveLocalData("interviews", updatedInterviews);
  };

  // Deletions
  const handleDeleteResume = async (id: string) => {
    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    saveLocalData("resumes", updated);
  };

  const handleDeleteJob = async (id: string) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    saveLocalData("jobs", updated);
  };

  return (
    <div className="bg-[#0B0F19] text-gray-100 min-h-screen font-sans overflow-x-hidden flex flex-col justify-between">
      
      {/* Absolute Dynamic Navigation Header */}
      <header className="sticky top-0 z-45 bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div 
            onClick={() => setViewState('landing')} 
            className="flex items-center gap-2.5 cursor-pointer group text-white font-display font-extrabold text-lg select-none"
          >
            <div className="w-8 h-8 bg-[#A3FF3C]/10 border border-[#A3FF3C]/20 rounded-lg flex items-center justify-center text-[#A3FF3C] shadow-sm group-hover:rotate-6 transition-transform">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span>AI Career Copilot</span>
            <span className="hidden sm:inline bg-[#A3FF3C]/10 text-[#A3FF3C] text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border border-[#A3FF3C]/20">v2.0 Active</span>
          </div>

          <div className="flex items-center gap-3.5 text-xs font-semibold">
            {/* AI Engine Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-900 text-slate-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">AI ENGINE READY</span>
            </div>



            {viewState !== 'landing' && (
              <button
                onClick={() => setViewState('dashboard')}
                className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-[#A3FF3C] hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
                id="header-nav-dashboard"
              >
                Workspace Desk
              </button>
            )}

            <div className="flex items-center gap-3">
              <span className="text-[#14B8A6] font-extrabold uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 font-mono">
                Local Workspace Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Dynamic Stage Content */}
      <main className="flex-grow">
        
        {isLoading ? (
          <div className="py-32 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-xs font-mono">Synchronizing workspace details...</p>
          </div>
        ) : (
          <>
            {/* View ROUTER */}

            {viewState === 'landing' ? (
              <LandingPage 
                onGetStarted={() => {
                  setViewState('dashboard');
                  setActiveWorkspaceTab('upload');
                }}
              />
            ) : (
              <div className="max-w-[1600px] mx-auto min-h-screen lg:min-h-0 flex flex-col lg:flex-row text-gray-150 font-sans relative">
                
                {/* 1. GLOBAL SIDEBAR NAVIGATION */}
                <aside className={`bg-slate-950/80 border-b lg:border-r border-slate-900 transition-all duration-350 p-6 flex flex-col justify-between shrink-0 ${
                  sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
                }`} id="global-sidebar">
                  <div className="space-y-8">
                    {/* Size Collapse toggle for desktop */}
                    <div className="hidden lg:flex items-center justify-between">
                      {!sidebarCollapsed && <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-slate-500">Workspace Menu</span>}
                      <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Toggle sidebar size"
                        id="sidebar-toggle-btn"
                      >
                        <Sliders className="w-4 h-4 text-[#14B8A6]" />
                      </button>
                    </div>

                    <nav className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          setViewState('dashboard');
                          setActiveWorkspaceTab('upload');
                        }}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 text-xs tracking-wide font-bold transition-all ${
                          viewState === 'dashboard' && activeWorkspaceTab === 'upload'
                          ? "bg-[#A3FF3C]/10 text-[#A3FF3C] border-y border-r border-[#A3FF3C]/10 border-l-3 border-l-[#A3FF3C]" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent cursor-pointer"
                        }`}
                        id="nav-to-upload"
                      >
                        <LayoutDashboard className="w-4.5 h-4.5" />
                        {!sidebarCollapsed && <span>Upload Resumes & Jobs</span>}
                      </button>

                      <button 
                        onClick={() => {
                          setViewState('resume-analysis');
                        }}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 text-xs tracking-wide font-bold transition-all ${
                          viewState === 'resume-analysis'
                          ? "bg-[#14B8A6]/10 text-[#14B8A6] border-y border-r border-[#14B8A6]/10 border-l-3 border-l-[#14B8A6]" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent cursor-pointer"
                        }`}
                        id="nav-to-audit"
                      >
                        <Brain className="w-4.5 h-4.5" />
                        {!sidebarCollapsed && <span>CV Audit & ATS Score</span>}
                      </button>

                      <button 
                        onClick={() => {
                          setViewState('ats-builder');
                        }}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 text-xs tracking-wide font-bold transition-all ${
                          viewState === 'ats-builder'
                          ? "bg-[#14B8A6]/10 text-[#14B8A6] border-y border-r border-[#14B8A6]/10 border-l-3 border-l-[#14B8A6]" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent cursor-pointer"
                        }`}
                        id="nav-to-rewrite"
                      >
                        <FileText className="w-4.5 h-4.5" />
                        {!sidebarCollapsed && <span>ATS CV Keyword Inject</span>}
                      </button>

                      <button 
                        onClick={() => {
                          setViewState('cover-letter');
                        }}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 text-xs tracking-wide font-bold transition-all ${
                          viewState === 'cover-letter'
                          ? "bg-[#14B8A6]/10 text-[#14B8A6] border-y border-r border-[#14B8A6]/10 border-l-3 border-l-[#14B8A6]" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent cursor-pointer"
                        }`}
                        id="nav-to-letter"
                      >
                        <FileSignature className="w-4.5 h-4.5" />
                        {!sidebarCollapsed && <span>Cover Letter Drafts</span>}
                      </button>

                      <button 
                        onClick={() => {
                          setViewState('interview-prep');
                        }}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 text-xs tracking-wide font-bold transition-all ${
                          viewState === 'interview-prep' || viewState === 'voice-room' || viewState === 'feedback-report'
                          ? "bg-emerald-500/10 text-emerald-400 border-y border-r border-emerald-500/10 border-l-3 border-l-emerald-400" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent cursor-pointer"
                        }`}
                        id="nav-to-interview"
                      >
                        <Mic className="w-4.5 h-4.5" />
                        {!sidebarCollapsed && <span>AI Interview Practice</span>}
                      </button>

                      <button 
                        onClick={() => {
                          setViewState('dashboard');
                          setActiveWorkspaceTab('assets');
                        }}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 text-xs tracking-wide font-bold transition-all ${
                          viewState === 'dashboard' && activeWorkspaceTab === 'assets'
                          ? "bg-purple-500/10 text-purple-400 border-y border-r border-purple-500/10 border-l-3 border-l-purple-400" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent cursor-pointer"
                        }`}
                        id="nav-to-saved"
                      >
                        <Clock className="w-4.5 h-4.5" />
                        {!sidebarCollapsed && <span>Saved Documents ({resumes.length + jobs.length})</span>}
                      </button>
                    </nav>

                    {/* Guidelines block in sidebar */}
                    {!sidebarCollapsed && (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-900 text-[11px] leading-relaxed text-slate-500 font-semibold font-mono space-y-2">
                        <span className="text-[#A3FF3C] font-extrabold uppercase tracking-wide">// Copilot Pro Guidelines</span>
                        <p>Unlock direct navigation. Jump to feedback models, draft outreach coverages, and practice mock verbal reviews anytime!</p>
                      </div>
                    )}
                  </div>

                  {/* Sidebar bottom indicator */}
                  {!sidebarCollapsed && (
                    <div className="pt-4 border-t border-slate-905 text-[10px] text-slate-650 font-mono">
                      <span>Server Proxy Node: Safe</span>
                    </div>
                  )}
                </aside>

                {/* 2. DYNAMIC WORKSPACE ROUTING MAIN STAGE */}
                <div className="flex-grow min-w-0">
                  {viewState === 'dashboard' && (
                    <Dashboard 
                      resumes={resumes}
                      jobs={jobs}
                      analyses={analyses}
                      coverLetters={coverLetters}
                      interviews={interviews}
                      onUploadResume={handleUploadResume}
                      onAddJob={handleAddJob}
                      onDeleteResume={handleDeleteResume}
                      onDeleteJob={handleDeleteJob}
                      isLoading={false}
                      userEmail="Local Workspace"
                      activeWorkspaceTab={activeWorkspaceTab}
                      onSelectAction={(action, targetId) => {
                        setTargetIdRef(targetId);
                        if (action === 'resume-analysis') setViewState('resume-analysis');
                        if (action === 'ats-builder') setViewState('ats-builder');
                        if (action === 'cover-letter') setViewState('cover-letter');
                        if (action === 'interview-prep') setViewState('interview-prep');
                      }}
                    />
                  )}

                  {viewState === 'resume-analysis' && (
                    <ResumeAnalysis 
                      resumes={resumes}
                      jobs={jobs}
                      analyses={analyses}
                      onBackToDashboard={() => setViewState('dashboard')}
                      onSaveAnalysis={handleSaveAnalysis}
                      isLoading={false}
                      defaultJobId={targetIdRef}
                    />
                  )}

                  {viewState === 'ats-builder' && (
                    <ATSResumeBuilder 
                      resumes={resumes}
                      jobs={jobs}
                      onBackToDashboard={() => setViewState('dashboard')}
                      onSaveATSResume={() => {}}
                    />
                  )}

                  {viewState === 'cover-letter' && (
                    <CoverLetterBuilder 
                      resumes={resumes}
                      jobs={jobs}
                      coverLetters={coverLetters}
                      onBackToDashboard={() => setViewState('dashboard')}
                      onSaveCoverLetter={handleSaveCoverLetter}
                    />
                  )}

                  {viewState === 'interview-prep' && (
                    <InterviewPractice 
                      resumes={resumes}
                      jobs={jobs}
                      onBackToDashboard={() => setViewState('dashboard')}
                      onEnterVoiceRoom={(qs, roleName, compName) => {
                        setActivePartnerQuestions(qs);
                        setActiveRoomJobTitle(roleName);
                        setActiveRoomCompany(compName);
                        setViewState('voice-room');
                      }}
                    />
                  )}

                  {viewState === 'voice-room' && (
                    <VoiceInterviewRoom 
                      questions={activePartnerQuestions}
                      jobTitle={activeRoomJobTitle}
                      companyName={activeRoomCompany}
                      onBackToDashboard={() => setViewState('dashboard')}
                      onInterviewFinished={(resAttempt) => {
                        handleSaveInterviewAttempt(resAttempt);
                        setCurrentFeedbackReport(resAttempt);
                        setViewState('feedback-report');
                      }}
                    />
                  )}

                  {viewState === 'feedback-report' && currentFeedbackReport && (
                    <FeedbackReport 
                      attempt={currentFeedbackReport}
                      onBackToDashboard={() => setViewState('dashboard')}
                      onRestartPractice={() => setViewState('interview-prep')}
                    />
                  )}
                </div>
              </div>
            )}

          </>
        )}
      </main>



      {/* Global high-density clean footer */}
      <footer className="h-10 bg-slate-950 text-slate-500 flex items-center justify-between px-6 shrink-0 text-[10px] uppercase font-mono font-bold tracking-widest border-t border-slate-900">
        <div>System Status: Optimized</div>
        <div className="hidden sm:block text-slate-600">AI Career Copilot • Cloud Workspace</div>
        <div>Powered by Gemini 2.5 & Web Speech API</div>
      </footer>
    </div>
  );
}
