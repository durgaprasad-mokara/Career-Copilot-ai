/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Download, 
  Edit3, 
  Check, 
  Plus, 
  Trash, 
  Briefcase, 
  Award, 
  BookOpen,
  Eye,
  FileSignature,
  AlertTriangle
} from "lucide-react";
import { ResumeData, JobDescriptionData, ATSResume } from "../types";
import { getFallbackAtsResume } from "../utils/fallbacks";
import { motion, AnimatePresence } from "motion/react";

interface ATSResumeBuilderProps {
  resumes: ResumeData[];
  jobs: JobDescriptionData[];
  onBackToDashboard: () => void;
  onSaveATSResume: (ats: ATSResume) => void;
}

export default function ATSResumeBuilder({
  resumes,
  jobs,
  onBackToDashboard,
  onSaveATSResume
}: ATSResumeBuilderProps) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<ATSResume["optimizedContent"] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'preview' | 'json'>('preview');
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const handleGenerateATSResume = async () => {
    setErrorMsg("");
    const resume = resumes.find(r => r.id === selectedResumeId);
    const job = jobs.find(j => j.id === selectedJobId);

    if (!resume) {
      setErrorMsg("Please upload and select a resume core profile first.");
      return;
    }

    setIsLoading(true);

    try {
      let optimized;
      try {
        const response = await fetch("/api/generate-ats-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: resume.extractedText,
            jobDescription: job ? job.text : ""
          })
        });

        if (!response.ok) {
          throw new Error("Local proxy server is offline or returned an error status.");
        }
        optimized = await response.json();
      } catch (fetchErr) {
        console.warn("[Standalone Client Mode] Falling back to high-fidelity offline ATS builder engine:", fetchErr);
        optimized = getFallbackAtsResume(resume.extractedText, job ? job.text : "");
      }

      setIsUsingFallback(!!optimized._isFallback);
      setOptimizedResume(optimized);
      
      const newATSObj: ATSResume = {
        id: `ats_${Date.now()}`,
        userId: "guest",
        resumeId: selectedResumeId,
        optimizedContent: optimized,
        createdAt: new Date().toISOString()
      };
      onSaveATSResume(newATSObj);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate optimized ATS cv fields.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("ats5-cv-printable");
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printStyle = `
      <style>
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-family: Arial, Helvetica, sans-serif !important;
            padding: 2cm !important;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>ATS_Optimized_Resume</title>
          <script src="https://cdn.tailwindcss.com"></script>
          ${printStyle}
        </head>
        <body class="bg-white p-8">
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleFieldValueChange = (path: string, val: any) => {
    if (!optimizedResume) return;

    setOptimizedResume(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      
      if (path === "fullName") copy.fullName = val;
      if (path === "email") copy.email = val;
      if (path === "phone") copy.phone = val;
      if (path === "linkedin") copy.linkedin = val;
      if (path === "summary") copy.summary = val;

      return copy;
    });
  };

  return (
    <div className="max-w-[1500px] mx-auto min-h-0 text-gray-150 font-sans p-6 leading-relaxed">
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-900">
        <div className="flex items-center gap-4">
          {/* <button
            onClick={onBackToDashboard}
            className="p-3 rounded-2xl bg-slate-955 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Return to workspace dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-[#14B8A6]" />
          </button> */}
          <div>
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
              ATS Resume Rewriter & Optimizer
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Refactor resume details with STAR action statements. Export pristine machine-readable PDFs.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-955/20 border border-red-900/40 rounded-2xl text-red-400 text-xs font-semibold mb-8 max-w-2xl flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. SPECIFIER INPUTS (Runs when no active resume rewrites executed yet) */}
      {!optimizedResume && (
        <div className="p-8 rounded-3xl bg-[#111827] border border-slate-800 max-w-3xl mx-auto text-center space-y-8 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3FF3C]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-14 h-14 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/15 text-[#14B8A6] flex items-center justify-center mx-auto">
            <FileSignature className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-extrabold font-display text-white">Initiate Professional CV Blueprint</h3>
            <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed font-semibold">
              Optimize spacing and bullet structures based on the target job coordinates. Gemini models write verified action statements using exact standard metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-450 block font-bold">Source Portfolio Resume</label>
              {resumes.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-900 rounded-xl text-center text-slate-500 bg-slate-950 font-semibold">
                  No resumes recorded. Paste or upload a portfolio on Dashboard first.
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 pl-4 focus:outline-none focus:border-[#14B8A6]/40 text-slate-200 text-xs font-semibold font-mono"
                  id="ats-select-resume"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#111827]">{r.fileName}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-450 block font-bold">Match Role Target (Optional)</label>
              {jobs.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-900 rounded-xl text-center text-slate-500 bg-slate-950 font-semibold">
                  No saved roles. Generates standard best-practice CV.
                </div>
              ) : (
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 pl-4 focus:outline-none focus:border-[#14B8A6]/40 text-slate-200 text-xs font-semibold"
                  id="ats-select-jd"
                >
                  <option value="" className="bg-[#111827]">Standard Industry Best-Practice CV</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id} className="bg-[#111827]">{j.title} ({j.companyName})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerateATSResume}
            disabled={isLoading || resumes.length === 0}
            className="w-full sm:w-auto px-10 py-4.5 rounded-2xl bg-[#14B8A6] hover:bg-[#0d9488] disabled:bg-slate-900 disabled:text-slate-500 text-white font-extrabold text-xs uppercase tracking-wider font-display transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#14B8A6]/10"
            id="ats-rewrite-btn"
          >
            {isLoading ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Technical Verb Structures...
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" />
                Generate ATS-Optimized Resume
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading animation overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0B0F19]/85 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-sm p-8 bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-900 border-t-[#14B8A6] animate-spin"></div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold font-display text-white">Refactoring Bullets with Gemini</h3>
              <p className="text-slate-405 text-xs font-semibold leading-relaxed">Rewriting achievements to feature relevant quantitative key performance metrics...</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CO-PILOT OPTIMIZER EDITOR & PREVIEW split screen */}
      {optimizedResume && (
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
          
          {/* Left panel metadata configuration */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4">
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">Configure Resume Fields</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-display flex items-center gap-1.5 transition-all cursor-pointer ${
                    isEditing 
                    ? 'bg-[#14B8A6] text-slate-950 shadow-sm' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-900 hover:bg-slate-900'
                  }`}
                  id="toggle-edit-btn"
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Fields
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      Tweak Text
                    </>
                  )}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-slate-405 block font-bold">Full Identity Name</label>
                    <input
                      type="text"
                      value={optimizedResume.fullName}
                      onChange={(e) => handleFieldValueChange("fullName", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-450 block font-bold">Professional Email</label>
                    <input
                      type="email"
                      value={optimizedResume.email}
                      onChange={(e) => handleFieldValueChange("email", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-455 block font-bold">Cell Contact Number</label>
                    <input
                      type="text"
                      value={optimizedResume.phone}
                      onChange={(e) => handleFieldValueChange("phone", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-450 block font-bold">LinkedIn URL Address</label>
                    <input
                      type="text"
                      value={optimizedResume.linkedin || ""}
                      onChange={(e) => handleFieldValueChange("linkedin", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-450 block font-bold">Executive Pitch Summary</label>
                    <textarea
                      value={optimizedResume.summary}
                      onChange={(e) => handleFieldValueChange("summary", e.target.value)}
                      className="w-full h-32 bg-slate-950 border border-slate-905 rounded-xl p-3 text-slate-200"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-xs text-slate-350 leading-relaxed font-semibold">
                  <div className="p-4 bg-slate-950 border border-slate-905 rounded-2xl space-y-2">
                    <p className="text-sm font-black text-white">{optimizedResume.fullName}</p>
                    <p className="font-mono text-[11px] text-slate-400">{optimizedResume.email} • {optimizedResume.phone}</p>
                    {optimizedResume.linkedin && <p className="text-[#14B8A6] font-mono select-all truncate">{optimizedResume.linkedin}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block">Professional Pitch</span>
                    <p className="italic text-slate-400 leading-relaxed">"{optimizedResume.summary}"</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block mb-2.5">Skills Matrix Profiles</span>
                    <div className="flex flex-wrap gap-1.5">
                      {optimizedResume.skills.technical.map((t, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-[#A3FF3C]/10 border border-[#A3FF3C]/15 text-[#A3FF3C] text-[10px] font-bold font-mono uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                      {optimizedResume.skills.soft.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right physical printable white layout */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex justify-between items-center bg-[#111827] p-4 rounded-3xl border border-slate-800 shadow-md">
              <div className="flex gap-2">
                <button
                  onClick={() => setActivePreviewTab('preview')}
                  className={`px-4 py-2 font-display rounded-xl text-xs font-bold cursor-pointer ${
                    activePreviewTab === 'preview' 
                    ? 'bg-[#A3FF3C] text-slate-950' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ATS Layout Canvas
                </button>
                <button
                  onClick={() => setActivePreviewTab('json')}
                  className={`px-4 py-2 font-display rounded-xl text-xs font-bold cursor-pointer ${
                    activePreviewTab === 'json' 
                    ? 'bg-[#A3FF3C] text-slate-950' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw JSON Structure
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#1bb3a2] text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform"
                id="export-pdf-btn"
              >
                <Download className="w-3.5 h-3.5" />
                Print/Export PDF Resume
              </button>
            </div>

            {activePreviewTab === 'preview' ? (
              <div 
                id="ats5-cv-printable" 
                className="bg-white text-slate-800 p-10 md:p-14 rounded-3xl shadow-2xl overflow-y-auto max-h-[85vh] font-serif border border-slate-300"
              >
                {/* Header info */}
                <div className="text-center space-y-1.5 pb-6 border-b border-gray-250">
                  <h2 className="text-2xl font-black text-gray-900 uppercase font-sans tracking-tight">{optimizedResume.fullName}</h2>
                  <p className="text-xs text-gray-650 font-sans font-medium">
                    {optimizedResume.email} &nbsp;|&nbsp; {optimizedResume.phone}
                    {optimizedResume.linkedin && `  |  ${optimizedResume.linkedin}`}
                    {optimizedResume.portfolio && `  |  ${optimizedResume.portfolio}`}
                  </p>
                </div>

                {/* Summary */}
                <div className="py-5 font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-250 pb-1 mb-2">Professional Summary</h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-serif text-justify font-medium">{optimizedResume.summary}</p>
                </div>

                {/* Skills */}
                <div className="py-3 font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-250 pb-1 mb-2">Technical Skills</h3>
                  <p className="text-xs text-slate-650 leading-relaxed font-medium">
                    <strong className="text-slate-950 font-sans">Hard Capabilities:</strong> {optimizedResume.skills.technical.join(", ")}
                  </p>
                  <p className="text-xs text-slate-650 leading-relaxed mt-1 font-medium">
                    <strong className="text-slate-950 font-sans">Core Principles:</strong> {optimizedResume.skills.soft.join(", ")}
                  </p>
                </div>

                {/* Experience */}
                <div className="py-4 font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-250 pb-1 mb-3">Work Experience</h3>
                  <div className="space-y-4">
                    {optimizedResume.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1.5 font-serif">
                        <div className="flex justify-between items-start font-sans text-xs">
                          <div>
                            <strong className="text-slate-950 text-sm">{exp.company}</strong>
                            <span className="text-slate-600 font-light block mt-0.5">{exp.role}</span>
                          </div>
                          <div className="text-right text-[11px] text-slate-500 font-medium font-sans">
                            <span>{exp.startDate} - {exp.endDate}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5 italic">{exp.location}</span>
                          </div>
                        </div>

                        <ul className="list-disc pl-5 mt-2 text-xs text-slate-650 leading-relaxed text-left font-serif space-y-1 font-medium">
                          {exp.bulletPoints.map((bullet, idxB) => (
                            <li key={idxB}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="py-4 font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-250 pb-1 mb-3">Education</h3>
                  <div className="space-y-3 font-serif">
                    {optimizedResume.education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs font-sans">
                        <div>
                          <strong className="text-slate-950 font-bold">{edu.institution}</strong>
                          <span className="block mt-0.5 font-light text-slate-500 font-serif">{edu.degree}</span>
                        </div>
                        <div className="text-right text-[11px] text-slate-500 font-medium">
                          <span>{edu.graduationYear}</span>
                          <span className="block text-[10px] text-slate-400 italic font-serif">{edu.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <pre className="p-6 rounded-2xl bg-slate-950 border border-slate-900 font-mono text-[11px] text-indigo-400 overflow-x-auto max-h-[85vh] shadow-inner">
                {JSON.stringify(optimizedResume, null, 2)}
              </pre>
            )}

          </div>

        </div>
        </div>
      )}

    </div>
  );
}
