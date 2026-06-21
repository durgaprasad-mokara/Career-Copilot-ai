/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Brain, 
  ArrowRight, 
  BookOpen, 
  Award, 
  FileText, 
  HelpCircle,
  Mic,
  Activity,
  Zap
} from "lucide-react";
import { ResumeData, JobDescriptionData, InterviewQuestion } from "../types";
import { getFallbackInterviewPrep } from "../utils/fallbacks";
import { motion, AnimatePresence } from "motion/react";

interface InterviewPracticeProps {
  resumes: ResumeData[];
  jobs: JobDescriptionData[];
  onBackToDashboard: () => void;
  onEnterVoiceRoom: (questions: InterviewQuestion[], jobTitle: string, companyName: string) => void;
}

export default function InterviewPractice({
  resumes,
  jobs,
  onBackToDashboard,
  onEnterVoiceRoom
}: InterviewPracticeProps) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const handleGenerateQuestions = async () => {
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
      let result;
      try {
        const response = await fetch("/api/generate-interview-prep", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: resume.extractedText,
            jobDescription: job.text,
            jobTitle: job.title,
            companyName: job.companyName
          })
        });

        if (!response.ok) {
          throw new Error("Local proxy server is offline or returned an error status.");
        }
        result = await response.json();
      } catch (fetchErr) {
        console.warn("[Standalone Client Mode] Falling back to high-fidelity offline interview builder engine:", fetchErr);
        result = getFallbackInterviewPrep(resume.extractedText, job.title, job.companyName, job.text);
      }

      setIsUsingFallback(!!result._isFallback);
      setQuestions(result.questions || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate interview simulator questions matrix.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="max-w-[1500px] mx-auto min-h-0 text-gray-150 font-sans p-6 leading-relaxed">
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-900">
        <div className="flex items-center gap-4">
          {/* <button
            onClick={onBackToDashboard}
            className="p-3 rounded-2xl bg-slate-955 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Return to central dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-[#14B8A6]" />
          </button> */}
          <div>
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
              Behavioral & Tech Mock Preparation Dashboard
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Generate diagnostic interview guides custom-tailored to qualifications and target job criteria.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-955/20 border border-red-900/40 rounded-2xl text-red-400 text-xs font-semibold mb-8 max-w-2xl flex items-center gap-2.5 animate-fade-in">
          <BookOpen className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. SPECIFY ASSESSMENT CONTEXT (Runs when no questionnaire loaded yet) */}
      {questions.length === 0 && (
        <div className="p-8 rounded-3xl bg-[#111827] border border-slate-800 max-w-3xl mx-auto text-center space-y-8 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3FF3C]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-14 h-14 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/15 text-[#14B8A6] flex items-center justify-center mx-auto">
            <Brain className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-extrabold font-display text-white">Configure Mock Training Syllabus</h3>
            <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed font-semibold">
              Select qualifications context and job description targets. Gemini deep learning maps roles and highlights standard structural interview queries to prepare delivery formats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-450 block font-bold">Candidate Resume Context</label>
              {resumes.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-900 rounded-xl text-center text-slate-500 bg-slate-950 font-semibold">
                  No saved portfolios. Paste or upload a portfolio on Dashboard first.
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3.5 pl-4 focus:outline-none focus:border-[#14B8A6]/40 text-slate-201 text-xs font-mono font-semibold"
                  id="prep-select-resume"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#111827]">{r.fileName}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-450 block font-bold">Hiring Target Post Specifications</label>
              {jobs.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-900 rounded-xl text-center text-slate-500 bg-slate-950 font-semibold">
                  No target listings. Specify enterprise positions on Dashboard.
                </div>
              ) : (
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3.5 pl-4 focus:outline-none focus:border-[#14B8A6]/40 text-slate-201 text-xs font-semibold"
                  id="prep-select-jd"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id} className="bg-[#111827]">{j.title} at {j.companyName}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={isLoading || resumes.length === 0 || jobs.length === 0}
            className="w-full sm:w-auto px-10 py-4.5 rounded-2xl bg-[#14B8A6] hover:bg-[#0d9488] disabled:bg-slate-900 disabled:text-slate-500 text-white font-extrabold text-xs uppercase tracking-wider font-display transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#14B8A6]/10"
            id="compile-questions-btn"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Compiling Target Assessment Room...
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" />
                Compile Mock Interview Guide
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0B0F19]/85 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-sm p-8 bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-900 border-t-[#14B8A6] animate-spin"></div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold font-display text-white">Mapping Interview Syllabus</h3>
              <p className="text-slate-405 text-xs font-semibold leading-relaxed">Analyzing professional history context against responsibilities to formulate behavioral questions...</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. READY STATE: VIEW COMPILED QUESTIONNAIRE */}
      {questions.length > 0 && !isLoading && (
        <div className="space-y-8 animate-fade-in">
          {isUsingFallback && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-semibold flex items-start gap-3 max-w-4xl">
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
          
          <div className="p-6 md:p-8 rounded-3xl bg-slate-950 border border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#14B8A6]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1.5 max-w-lg z-10 text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest bg-[#14B8A6]/10 border border-[#14B8A6]/15 text-[#14B8A6] px-3 py-1 rounded-full font-bold">
                SIMULATION SUITE ACTIVE
              </span>
              <h3 className="text-lg font-extrabold font-display text-white mt-1 pt-2">Initiate Mock interactive Voice Session?</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Gemini synthesized 7 diagnostic challenges spanning introduction, tech depth, leadership, domain acumen, and problem solving. Take part in the oral screen to practice matching high-impact requirements.
              </p>
            </div>

            <button
              onClick={() => onEnterVoiceRoom(questions, selectedJob?.title || "Role Target", selectedJob?.companyName || "Hiring Company")}
              className="px-6 py-4 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white text-xs font-extrabold uppercase tracking-wider font-display flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#14B8A6]/10 shrink-0"
              id="enter-voice-simulator-btn"
            >
              <Mic className="w-4.5 h-4.5 text-white animate-pulse shrink-0" />
              Start Interactive Speech Interview
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

          <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest flex items-center gap-2 mb-4">
            <Activity className="w-4 text-[#14B8A6]" />
            Diagnostic Mock Assessment Syllabus
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 flex flex-col justify-between shadow-xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/40 rounded-full blur-2xl pointer-events-none" />
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 text-[#14B8A6] border border-slate-900 flex items-center justify-center text-[10px] font-bold font-mono">
                      0{idx + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-mono tracking-widest font-extrabold uppercase ${
                      q.type === 'introduction' ? 'bg-blue-950/25 border border-blue-900/30 text-blue-400' :
                      q.type === 'technical' ? 'bg-orange-950/25 border border-orange-900/30 text-orange-400' : 
                      q.type === 'behavioral' ? 'bg-pink-950/25 border border-pink-900/30 text-pink-400' : 
                      q.type === 'problem-solving' ? 'bg-emerald-950/25 border border-emerald-900/30 text-[#14B8A6]' : 
                      q.type === 'projects' ? 'bg-purple-950/25 border border-purple-900/30 text-purple-400' : 
                      q.type === 'leadership' ? 'bg-yellow-950/25 border border-yellow-905/30 text-yellow-400' : 
                      q.type === 'domain-knowledge' ? 'bg-cyan-950/25 border border-cyan-900/30 text-cyan-400' : 
                      'bg-slate-950/25 border border-slate-900/30 text-slate-400'
                    }`}>
                      {q.type.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="text-sm font-bold font-sans text-slate-200 leading-relaxed">
                    "{q.question}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-900/80 text-xs text-slate-350 space-y-3 font-semibold">
                  <div className="text-xs">
                    <strong className="text-indigo-400 font-mono text-[10px] mr-1 block uppercase tracking-wider mb-0.5">Focus Key:</strong>
                    <span className="leading-relaxed text-slate-400 block">{q.contextTip}</span>
                  </div>
                  {q.idealKeywords && q.idealKeywords.length > 0 && (
                    <div className="pt-1.5">
                      <strong className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block mb-1.5">Expected Keywords:</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {q.idealKeywords.map((tag, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-400 font-mono text-[9px] font-extrabold uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
