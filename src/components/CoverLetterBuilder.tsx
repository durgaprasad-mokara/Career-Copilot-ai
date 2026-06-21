/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Mail, 
  Building, 
  UserPlus 
} from "lucide-react";
import { ResumeData, JobDescriptionData, CoverLetter } from "../types";
import { getFallbackCoverLetter } from "../utils/fallbacks";
import { motion, AnimatePresence } from "motion/react";

interface CoverLetterBuilderProps {
  resumes: ResumeData[];
  jobs: JobDescriptionData[];
  coverLetters: CoverLetter[];
  onBackToDashboard: () => void;
  onSaveCoverLetter: (letter: CoverLetter) => void;
}

export default function CoverLetterBuilder({
  resumes,
  jobs,
  coverLetters,
  onBackToDashboard,
  onSaveCoverLetter
}: CoverLetterBuilderProps) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || "");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const handleJobSelectChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setCompanyName(job.companyName);
      setJobTitle(job.title);
    } else {
      setCompanyName("");
      setJobTitle("");
    }
  };

  const handleGenerateLetter = async () => {
    setErrorMsg("");
    const resume = resumes.find(r => r.id === selectedResumeId);
    const job = jobs.find(j => j.id === selectedJobId);

    if (!resume) {
      setErrorMsg("Please upload and select a resume core profile first.");
      return;
    }
    if (!companyName.trim() || !jobTitle.trim()) {
      setErrorMsg("Please specify the targeting job title and hiring company.");
      return;
    }

    setIsLoading(true);

    try {
      let report;
      try {
        const response = await fetch("/api/generate-cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: resume.extractedText,
            jobTitle,
            companyName,
            jobDescription: job ? job.text : ""
          })
        });

        if (!response.ok) {
          throw new Error("Local proxy server is offline or returned an error status.");
        }
        report = await response.json();
      } catch (fetchErr) {
        console.warn("[Standalone Client Mode] Falling back to high-fidelity offline cover letter builder engine:", fetchErr);
        report = getFallbackCoverLetter(resume.extractedText, jobTitle, companyName, job ? job.text : "");
      }

      setIsUsingFallback(!!report._isFallback);
      setCurrentLetter(report.letterContent);

      const clObj: CoverLetter = {
        id: `cl_${Date.now()}`,
        userId: "guest",
        resumeId: selectedResumeId,
        companyName,
        jobTitle,
        letterContent: report.letterContent,
        createdAt: new Date().toISOString()
      };

      onSaveCoverLetter(clObj);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate customized cover letter.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentLetter) return;
    navigator.clipboard.writeText(currentLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cover_Letter_${companyName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 3cm; 
              color: #333; 
              line-height: 1.6;
              white-space: pre-line;
            }
          </style>
        </head>
        <body>
          \${currentLetter}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

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
              Cover Letter Architect
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Draft highly compelling, personalized cover letters aligning details flawlessly.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-955/20 border border-red-900/40 rounded-2xl text-red-400 text-xs font-semibold mb-8 max-w-2xl flex items-center gap-2.5">
          <Check className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* 2. LEFT INPUT CONFIG PARAMETERS */}
        <div className="lg:col-span-4 p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-xs font-mono font-bold text-[#A3FF3C] uppercase tracking-widest">
            Target Parameter Configuration
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            {/* CV Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-450 block font-bold">1. Source Qualifications Dossier</label>
              {resumes.length === 0 ? (
                <p className="text-xs text-slate-500 italic font-semibold p-3 border border-dashed border-slate-850 rounded-xl text-center bg-slate-950">No saved resumes. Upload a portfolio first.</p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3.5 pl-4 focus:outline-none focus:border-[#14B8A6]/40 text-slate-200"
                  id="cl-select-resume"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#111827]">{r.fileName}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Job Loader Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-450 block font-bold">2. Load parameters from Target Job Role</label>
              <select
                value={selectedJobId}
                onChange={(e) => handleJobSelectChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3.5 pl-4 focus:outline-none focus:border-[#14B8A6]/40 text-slate-200 text-xs"
                id="cl-select-jd"
              >
                <option value="" className="bg-[#111827]">-- Custom Manual Setup --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id} className="bg-[#111827]">{j.title} ({j.companyName})</option>
                ))}
              </select>
            </div>

            {/* Manual Fields */}
            <div className="space-y-1.5">
              <label className="text-slate-450 block font-bold">3. Targeting Professional Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Lead Dev Advocate"
                className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3.5 focus:outline-none focus:border-[#14B8A6]/40 text-slate-200"
                id="cl-role-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-450 block font-bold">4. Hiring Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. DeepMind"
                className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3.5 focus:outline-none focus:border-[#12b8a6]/40 text-slate-200"
                id="cl-company-input"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateLetter}
            disabled={isLoading || resumes.length === 0 || !companyName.trim() || !jobTitle.trim()}
            className="w-full py-4 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] disabled:bg-slate-900 disabled:text-slate-500 text-white font-extrabold text-xs uppercase tracking-wider font-display transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#14B8A6]/10"
            id="cl-draft-btn"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                Drafting Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Draft Cover Letter
              </>
            )}
          </button>
        </div>

        {/* 3. RIGHT PREVIEW EDITOR DESK */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {isUsingFallback && currentLetter && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-semibold mb-6 flex items-start gap-3 animate-fade-in">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-extrabold text-white mb-0.5 flex items-center gap-1.5">
                  Optimal Fallback Knowledge Mode Activated
                </h4>
                <p className="text-slate-400 font-medium text-[11px] leading-relaxed">
                  Completed successfully using our expert-curated local CV knowledge base. To activate live Gemini API models, please update your keys in Settings once current free-tier hourly usage limits reset.
                </p>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            {currentLetter ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-slate-800 rounded-3xl overflow-hidden shadow-xl bg-[#111827]"
              >
                
                {/* Subject top header bar */}
                <div className="px-6 py-4.5 bg-slate-950/60 border-b border-slate-900 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="flex items-center gap-2 pr-2">
                    <Mail className="w-4 h-4 text-[#14B8A6] shrink-0 font-bold" />
                    <span className="text-xs font-bold font-mono text-zinc-300 truncate">
                      Subject: Job Application: {jobTitle} at {companyName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopy}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-900 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-505" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-1.5 rounded-lg bg-[#14B8A6] hover:bg-[#1bb3a2] text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Print Letter
                    </button>
                  </div>
                </div>

                {/* Main editable text stream */}
                <textarea
                  value={currentLetter}
                  onChange={(e) => setCurrentLetter(e.target.value)}
                  className="w-full h-[60vh] bg-[#111827] text-slate-200 border-none p-8 pl-8 text-sm focus:outline-none focus:ring-0 leading-relaxed font-mono focus:bg-[#111827]"
                  id="cover-letter-composer"
                />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center border-2 border-dashed border-slate-900 rounded-3xl bg-[#111827]/30 shadow-inner flex flex-col items-center justify-center p-6 h-full"
              >
                <FileText className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
                  Specify details on the left, then click Generate to let Gemini draft a highly customized, ATS-friendly cover letter template instantly.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
