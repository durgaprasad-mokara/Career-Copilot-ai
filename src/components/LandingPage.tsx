/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Target, 
  FileCode, 
  Clock, 
  Mic, 
  ArrowRight,
  TrendingDown,
  Percent,
  CheckCircle2,
  Users2,
  Cpu,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Volume2,
  Bot,
  Flame,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  // ATS Demo interaction states
  const [atsCategory, setAtsCategory] = useState<"frontend" | "backend" | "fullstack">("frontend");
  const [atsScore, setAtsScore] = useState<number>(64);
  const [isScanningATS, setIsScanningATS] = useState(false);

  // AI Interview Demo states
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [isAnsweringDemo, setIsAnsweringDemo] = useState(false);
  const [demoResponseText, setDemoResponseText] = useState("");
  const [demoFeedback, setDemoFeedback] = useState<string | null>(null);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  // FAQ states
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Hardcoded content for ATS Demo
  const atsMockData = {
    frontend: {
      score: 89,
      jobTitle: "Senior React Engineer",
      matching: ["React 19", "Tailwind CSS", "TypeScript", "Vite Codebase"],
      missing: ["NextJS App Router", "Lighthouse Performance Audit", "Web Accessibility (A11y)"],
      keywords: ["SEO Optimization", "SSR rendering", "Hydration lag", "FCP score"],
      gaps: "Resume outlines fundamental client side modules, but has minimal metrics about server side hydration or SEO indexing strategies."
    },
    backend: {
      score: 92,
      jobTitle: "Distributed Systems Architect",
      matching: ["Node.js", "Express Router", "AWS Cloud ECS", "PostgreSQL"],
      missing: ["Distributed Caching (Redis)", "Kafka Event Bus", "Kubernetes Orchestration"],
      keywords: ["ACID transactions", "Rate Limiting", "Connection Pooling", "Horizontal Scaling"],
      gaps: "Candidate lists experience with standard relational DB designs, but lacks details on high replication database clusters or partition keys."
    },
    fullstack: {
      score: 87,
      jobTitle: "Staff Full-Stack Tech Lead",
      matching: ["React", "TypeScript", "Node.js", "Firebase Auth", "Firestore DB"],
      missing: ["CI/CD workflows", "Server-Side Gemini APIs", "Microservices routing"],
      keywords: ["Edge middleware", "JWT cookies", "Lazy instantiation", "Unit testing coverage"],
      gaps: "Candidate possesses solid experience in database design, but has minor experience gaps in end-to-end multi-tenant enterprise system setup."
    }
  };

  const handleATSScanTrigger = (category: "frontend" | "backend" | "fullstack") => {
    setIsScanningATS(true);
    setAtsCategory(category);
    // Mimic scanning latency
    setTimeout(() => {
      setIsScanningATS(false);
      setAtsScore(atsMockData[category].score);
    }, 1200);
  };

  // Hardcoded questions for mock voice demo
  const sampleInterviewQuestions = [
    {
      id: "q1",
      question: "How do you manage network latency and optimize initial site rendering (FCP) in a large-scale React app?",
      tip: "Mention code splitting, dynamic imports, SSR fallback, and image optimization metrics.",
      sampleAnswer: "I utilize React.lazy and Suspense for client-side bundle segmenting. Transitioning state calculations into servers-side rendering via Edge caching cuts initial script payloads by 40%.",
      feedback: "Spectacular vocabulary match! Your response correctly integrates bundle segmenting, client fallbacks, and edge execution models. Score estimation: Technical Alignment: 94% / Articulation clarity: 91%."
    },
    {
      id: "q2",
      question: "What is your architectural strategy to prevent write locks under severe high-concurrency database spikes?",
      tip: "Discuss write-behind caching, read replicas, database indexing, and Redis middleware setups.",
      sampleAnswer: "I construct Redis queues to throttle direct write volumes, moving the actual transactional pipelines into async workers operating with dead-letter queue structures.",
      feedback: "Excellent system engineering concepts. Incorporating async queues with transaction throttling is an enterprise-grade technique. Score estimation: Technical Alignment: 92% / Articulation clarity: 89%."
    }
  ];

  const handleDemoAnswerSubmit = (customText?: string) => {
    setIsAnsweringDemo(true);
    const textToEvaluate = customText || demoResponseText || sampleInterviewQuestions[activeQuestionIdx].sampleAnswer;
    if (!demoResponseText) {
      setDemoResponseText(textToEvaluate);
    }
    setTimeout(() => {
      setIsAnsweringDemo(false);
      setDemoFeedback(sampleInterviewQuestions[activeQuestionIdx].feedback);
    }, 1800);
  };

  const FAQs = [
    {
      q: "How does the AI optimize resumes for Applicant Tracking System (ATS) scanners?",
      a: "Our core engine, supercharged by Google's Gemini LLMs, parses your resume against specific Job Descriptions. It extracts key technical hard skills, action-oriented verbs, and missing search keywords. It then re-structures your resume content into an ATS-compliant layout, ensuring machine parser compatibility without creating fictional work experience."
    },
    {
      q: "Does the mock voice interview require external microphones or special hardware?",
      a: "No! It runs directly inside your web browser using the native HTML5 Web Speech API. You can plug in any standard built-in laptop microphone. The system listens in real time, generates an adaptive vocal transcription, and hands it over to our server-side evaluation pipeline."
    },
    {
      q: "Are my resumes, job descriptions, and voice transcript histories stored securely?",
      a: "Absolutely! To protect your personal information and maintain total privacy, your data is stored entirely on your browser using high-performance client-side offline local storage. No corporate account sign-ins or cloud servers are required, meaning your resumes, records, and interview simulations remain strictly under your personal custody."
    },
    {
      q: "How does the matching score calculate candidate competency?",
      a: "It measures the semantic gaps between candidate credentials and job requirements. Unlike primitive keyword regex checkers, it weighs factors like technological overlap, experience seniority levels, role-specific metrics, and educational context to assess exact professional alignment."
    }
  ];

  return (
    <div className="bg-[#0B0F19] text-gray-100 font-sans min-h-screen relative overflow-x-hidden">
      
      {/* Absolute floating gradient backgrounds (Glassmorphism design) */}
      <div className="absolute top-[-10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#14B8A6]/10 to-[#A3FF3C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-purple-500/10 to-[#14B8A6]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[2%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-r from-[#A3FF3C]/5 to-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-36 md:pb-24 flex flex-col items-center text-center">
        
        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight font-display max-w-5xl leading-[1.05] text-white"
        >
          The Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A3FF3C] via-[#14B8A6] to-[#A3FF3C] bg-[length:200%_auto] animate-[shimmer_5s_infinite_linear]">AI Career Copilot</span> For Modern Job Hunts.
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 text-base md:text-xl text-slate-400 max-w-3xl font-medium leading-relaxed"
        >
          Optimize client resumes to bypass Applicant Tracking Systems, analyze hard-skills discrepancy matrices, auto-draft cover letters, and master technical verbal simulation rooms.
        </motion.p>

        {/* Action Toggles */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row gap-5 justify-center relative z-20 w-full sm:w-auto"
        >
          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl bg-[#A3FF3C] hover:bg-[#b0f554] text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(163,255,60,0.25)] transition-all cursor-pointer hover:-translate-y-0.5"
            id="hero-go-workspace-btn"
          >
            Enter Corporate Workspace
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Live Metrics indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl w-full border border-slate-900 bg-slate-950/40 p-6 rounded-2xl backdrop-blur-md"
        >
          <div className="text-center font-display border-r border-slate-900">
            <h4 className="text-[#A3FF3C] text-2xl md:text-3xl font-bold font-mono">98.4%</h4>
            <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest font-bold mt-1">ATS Acceptance</p>
          </div>
          <div className="text-center font-display border-r border-slate-900">
            <h4 className="text-[#14B8A6] text-2xl md:text-3xl font-bold font-mono">&lt; 3.2s</h4>
            <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest font-bold mt-1">GenAI Generation</p>
          </div>
          <div className="text-center font-display border-r border-slate-900">
            <h4 className="text-white text-2xl md:text-3xl font-bold font-mono">14,200+</h4>
            <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest font-bold mt-1">Interviews Hosted</p>
          </div>
          <div className="text-center font-display">
            <h4 className="text-[#A3FF3C] text-2xl md:text-3xl font-bold font-mono">2.8x</h4>
            <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest font-bold mt-1">Callback Multiplier</p>
          </div>
        </motion.div>
      </div>

      {/* 2. FEATURES GRID SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10" id="landing-features">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[#A3FF3C] font-mono text-xs uppercase tracking-widest font-bold mb-3">// SUPERCHARGED CORE FEATURES</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold font-display text-white">
            Architected To Give You An Unfair Advantage
          </h3>
          <p className="text-slate-400 mt-4 text-sm md:text-base leading-relaxed">
            We combined specialized deep semantic processing with AI speech technologies to mirror exact criteria corporate hiring boards and robotic parsers prioritize.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1: ATS Parser */}
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-900 hover:border-slate-800 hover:bg-slate-950/80 transition-all flex flex-col justify-between group shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-tr from-[#A3FF3C]/10 to-[#14B8A6]/0 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#A3FF3C]/10 border border-[#A3FF3C]/20 flex items-center justify-center text-[#A3FF3C] mb-6 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold font-display text-white mb-3">Diagnostic Match Matrix</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Parse target Job Descriptions dynamically. Detect absent keywords, analyze hard credentials, highlight experience deficits, and recalculate match probability score index instantly.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-900/80 flex items-center justify-between text-[#A3FF3C] text-xs font-mono font-bold">
              <span>ATS COMPLIANCY CHECKS</span>
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 2: Voice simulation */}
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-900 hover:border-slate-800 hover:bg-slate-950/80 transition-all flex flex-col justify-between group shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-tr from-[#14B8A6]/10 to-transparent rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/10 border border-[#14B8A6]/20 flex items-center justify-center text-[#14B8A6] mb-6 group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold font-display text-white mb-3">AI Voice Simulation Lab</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Step inside an elegant interactive oral mock assessment. The host asks tailored domain prompts, captures candidate voice inputs using Web Speech, and scores dialogue matrices.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-900/80 flex items-center justify-between text-[#14B8A6] text-xs font-mono font-bold">
              <span>HTML5 SPEECH TRANSCRIPTS</span>
              <Cpu className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 3: Resume builder */}
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-900 hover:border-slate-800 hover:bg-slate-950/80 transition-all flex flex-col justify-between group shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-105 transition-transform">
                <FileCode className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold font-display text-white mb-3">Tailored PDF Optimizer</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate highly tailored descriptions reflecting candidate accomplishments framed via the Situation-Task-Action-Result (STAR) matrix. Export perfectly standard, parser-friendly PDFs.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-900/80 flex items-center justify-between text-purple-400 text-xs font-mono font-bold">
              <span>PDF PORTABLE OUTPUTS</span>
              <FileText className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10" id="landing-how-it-works">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[#A3FF3C] font-mono text-xs uppercase tracking-widest font-bold mb-3">// WORKFLOW PROCESS</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold font-display text-white">How AI Career Copilot Works</h3>
          <p className="text-slate-400 mt-4 text-sm leading-relaxed">
            An intuitive 4-step workflow modeled after top corporate engineering placement labs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Connector Line on Desktop */}
          <div className="hidden lg:block absolute top-[2.5rem] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-[#A3FF3C]/10 via-[#14B8A6]/10 to-purple-500/10 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 p-5 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-[#A3FF3C] font-mono font-bold text-center flex items-center justify-center border border-slate-800 shadow-[0_0_15px_rgba(163,255,60,0.15)] mb-4">
              01
            </div>
            <h4 className="text-lg font-bold font-display text-white mb-2">Upload Resume</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Drag your PDF resume in. Our parser extracts all your experience, certifications, and technical stack details.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 p-5 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-[#14B8A6] font-mono font-bold text-center flex items-center justify-center border border-slate-800 shadow-[0_0_15px_rgba(20,184,166,0.15)] mb-4">
              02
            </div>
            <h4 className="text-lg font-bold font-display text-white mb-2">Input JD Details</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Paste the text of your target job description to establish the professional comparative benchmark criteria.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 p-5 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-purple-400 font-mono font-bold text-center flex items-center justify-center border border-slate-800 shadow-[0_0_15px_rgba(168,85,247,0.15)] mb-4">
              03
            </div>
            <h4 className="text-lg font-bold font-display text-white mb-2">Audit Gaps</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Review your ATS scoring index, instantly identify missing keywords, and generate custom structured cover letters.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 p-5 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-[#A3FF3C] font-mono font-bold text-center flex items-center justify-center border border-slate-800 shadow-[0_0_15px_rgba(163,255,60,0.15)] mb-4">
              04
            </div>
            <h4 className="text-lg font-bold font-display text-white mb-2">Simulate Interview</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Answer tailored technical and behavioral questions using spoken speech or text. Receive deep score summaries.
            </p>
          </div>

        </div>
      </section>

      {/* 4. ATS ANALYSIS DEMO (INTERACTIVE COMPONENT) */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10" id="landing-ats-demo">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-[#A3FF3C] font-mono text-xs uppercase tracking-widest font-bold">// INTERACTIVE EXPERIMENT</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight">
              Test Ride the Real-time ATS Auditor
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Select a target tech track below and trigger a simulated semantic analysis to see how matching scores, keywords, and structural experience gaps change.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => handleATSScanTrigger("frontend")}
                className={`px-4 py-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between cursor-pointer transition-all ${
                  atsCategory === "frontend" 
                  ? "bg-[#A3FF3C]/10 border-[#A3FF3C] text-[#A3FF3C]"
                  : "bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                Frontend React Track
              </button>
              <button 
                onClick={() => handleATSScanTrigger("backend")}
                className={`px-4 py-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between cursor-pointer transition-all ${
                  atsCategory === "backend" 
                  ? "bg-[#14B8A6]/10 border-[#14B8A6] text-[#14B8A6]"
                  : "bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                Distributed Backend
              </button>
              <button 
                onClick={() => handleATSScanTrigger("fullstack")}
                className={`px-4 py-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between cursor-pointer transition-all ${
                  atsCategory === "fullstack" 
                  ? "bg-purple-500/10 border-purple-500 text-purple-400"
                  : "bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                Full-Stack Lead Track
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900/60 text-xs text-slate-400 leading-relaxed italic">
              <strong className="text-white font-bold not-italic">Designer Note: </strong>
              The full Workspace Desk handles dynamic, custom CV uploads and pastes custom descriptions directly, calling our production Gemini endpoints, providing complete data maps unique to your career history.
            </div>
          </div>

          {/* Interactive ATS display */}
          <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-[0_10px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-[#A3FF3C]/5 to-transparent rounded-full blur-2xl" />
            
            {/* Display Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono tracking-wider font-extrabold text-slate-400 uppercase">EXPERIMENT RUNS LAB</span>
              </div>
              <span className="text-xs text-slate-500 font-mono font-bold uppercase bg-slate-950 px-2.5 py-1 rounded-md border border-slate-900">
                Target: {atsMockData[atsCategory].jobTitle}
              </span>
            </div>

            {isScanningATS ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-[#A3FF3C] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-mono text-slate-400">Comparing text vectors against target criteria...</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Score Widget */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-950 p-5 rounded-2xl border border-slate-900">
                  <div className="md:col-span-4 text-center lg:border-r lg:border-slate-900/80 pr-4">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">COMPUTE INDEX</span>
                    <div className="relative inline-block">
                      <svg className="w-24 h-24">
                        <circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                        <svg className="absolute top-0 left-0">
                          <circle 
                            className="text-[#A3FF3C]" 
                            strokeWidth="6" 
                            strokeDasharray={`${2 * Math.PI * 38}`}
                            strokeDashoffset={`${2 * Math.PI * 38 * (1 - atsScore / 100)}`}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="38" 
                            cx="48" 
                            cy="48" 
                            transform="rotate(-90 48 48)"
                          />
                        </svg>
                      </svg>
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-mono font-extrabold text-[#A3FF3C]">
                        {atsScore}%
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-extrabold text-slate-200 uppercase font-mono tracking-wider text-[11px]">Experience Gap Analysis</span>
                    </div>
                    <p className="text-slate-450 leading-relaxed">
                      {atsMockData[atsCategory].gaps}
                    </p>
                  </div>
                </div>

                {/* Skills Matrix Lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Matching column */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-extrabold flex items-center gap-1.5 border-b border-slate-905 pb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Detected Keywords ({atsMockData[atsCategory].matching.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5 h-20 overflow-y-auto content-start">
                      {atsMockData[atsCategory].matching.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing column */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-extrabold flex items-center gap-1.5 border-b border-slate-905 pb-2">
                      <TrendingDown className="w-3.5 h-3.5 text-[#A3FF3C]" />
                      Missing Skills Gaps ({atsMockData[atsCategory].missing.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5 h-20 overflow-y-auto content-start">
                      {atsMockData[atsCategory].missing.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#A3FF3C]/10 border border-[#A3FF3C]/20 text-[#A3FF3C] font-mono text-[10px] font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* ATS Suggestion Keyword List */}
                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Recommend Keywords for Search Optimization</span>
                  <div className="flex flex-wrap gap-2">
                    {atsMockData[atsCategory].keywords.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-300 font-mono text-[10px]">
                        + {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </div>

        </div>
      </section>

      {/* 5. AI INTERVIEW DEMO (VOICE EXPERIENCE SIMULATOR) */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10" id="landing-interview-demo">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[#14B8A6] font-mono text-xs uppercase tracking-widest font-bold mb-3">// LIVE FLUID VOICE EXPERIENCE</h2>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display text-white">
            AI-Host Voice Simulation Box
          </h2>
          <p className="text-slate-400 mt-4 text-sm md:text-base leading-relaxed">
            Preview the conversational interaction flow right here. Pick a topic, review the host voice query, submit the test transcription draft, and get custom feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Avatar simulation speaker (lg:col-span-5) */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-[#111827] border border-slate-800 text-center flex flex-col justify-between h-[520px] relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-[#14B8A6]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between font-mono text-xs text-slate-500">
              <span className="text-[#14B8A6] font-bold uppercase tracking-wider">MOCK BOT COPILOT</span>
              <span>PROMPT {activeQuestionIdx + 1} of 2</span>
            </div>

            {/* Speaking/Listening waves indicator */}
            <div className="relative py-8 flex flex-col items-center justify-center">
              
              {/* Outer floating circle aura */}
              <div className="absolute w-44 h-44 rounded-full border border-[#14B8A6]/10 animate-ping opacity-20" />
              <div className="absolute w-36 h-36 rounded-full border border-[#14B8A6]/20 animate-pulse" />

              {/* Bot Avatar core */}
              <button 
                onClick={() => {
                  setIsPlayingAudioPreview(true);
                  setTimeout(() => setIsPlayingAudioPreview(false), 3000);
                }}
                className={`w-28 h-28 rounded-full border flex flex-col items-center justify-center transition-all bg-slate-950 border-slate-800 text-[#14B8A6] hover:border-[#14B8A6] relative z-10 shadow-2xl ${
                  isPlayingAudioPreview ? 'shadow-[0_0_25px_rgba(20,184,166,0.30)]' : ''
                }`}
              >
                {isPlayingAudioPreview ? (
                  <>
                    <Volume2 className="w-10 h-10 text-[#14B8A6] animate-bounce mb-1" />
                    <span className="text-[10px] font-mono tracking-widest font-extrabold">READING PROMPT</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-10 h-10 text-[#14B8A6] mb-1" />
                    <span className="text-[10px] font-mono tracking-widest font-extrabold">PLAY AUDIO</span>
                  </>
                )}
              </button>

              {/* Fluctuating Audio Waves (simulated canvas) */}
              <div className="flex items-center justify-center gap-1.5 mt-6 h-6 w-40">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 rounded-full bg-[#14B8A6] transition-all duration-300 ${
                      isPlayingAudioPreview 
                      ? "animate-bounce h-5" 
                      : "h-2 bg-slate-800"
                    }`}
                    style={{ 
                      animationDelay: isPlayingAudioPreview ? `${i * 120}ms` : '0ms' 
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold block text-white">
                {isPlayingAudioPreview ? "AI Co-pilot host is speaking the question..." : "Simulator interface is ready to practice!"}
              </h4>
              <p className="text-slate-500 text-xs tracking-wide leading-relaxed">
                Click PLAY AUDIO to hear the AI Host verbalize the question, or review the card on the right and proceed directly to feedback evaluations!
              </p>
            </div>

            {/* Select Toggles */}
            <div className="flex items-center gap-2 justify-center mt-2">
              <button 
                onClick={() => {
                  setActiveQuestionIdx(0);
                  setDemoFeedback(null);
                  setDemoResponseText("");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  activeQuestionIdx === 0 
                  ? "bg-[#14B8A6]/20 border border-[#14B8A6] text-[#14B8A6]"
                  : "bg-slate-950 text-slate-400 border border-slate-900"
                }`}
              >
                Prompt #1
              </button>
              <button 
                onClick={() => {
                  setActiveQuestionIdx(1);
                  setDemoFeedback(null);
                  setDemoResponseText("");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  activeQuestionIdx === 1 
                  ? "bg-[#14B8A6]/20 border border-[#14B8A6] text-[#14B8A6]"
                  : "bg-slate-950 text-slate-400 border border-slate-900"
                }`}
              >
                Prompt #2
              </button>
            </div>
          </div>

          {/* Question card & responses box (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Question Statement */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-900 text-slate-200">
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-[#14B8A6] px-2.5 py-0.5 rounded-full font-mono font-bold inline-block mb-3">
                SAMPLE SCENARIO PROMPT
              </span>
              <p className="text-lg font-bold font-display text-white leading-relaxed italic">
                "{sampleInterviewQuestions[activeQuestionIdx].question}"
              </p>
              <div className="mt-4 pt-3 border-t border-slate-900/60 text-xs text-slate-400">
                <span className="text-slate-500 font-bold">Concept Tip:</span> {sampleInterviewQuestions[activeQuestionIdx].tip}
              </div>
            </div>

            {/* Dialogue response box */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline text-xs text-slate-500 font-mono font-bold">
                <span>VERBAL RECONSTRUCTION</span>
                <span>Type response or use quick sample autofill</span>
              </div>

              <textarea 
                value={demoResponseText}
                onChange={(e) => setDemoResponseText(e.target.value)}
                placeholder="Insert your answer transcript here or press 'Autofill Excellent Answer' below..."
                className="w-full h-32 bg-slate-950 border border-slate-900 focus:outline-none focus:border-[#14B8A6]/60 p-4 rounded-xl text-slate-300 text-sm leading-relaxed font-mono"
              />

              <div className="flex flex-wrap gap-3 items-center justify-between text-xs font-mono">
                <button
                  onClick={() => {
                    setDemoResponseText(sampleInterviewQuestions[activeQuestionIdx].sampleAnswer);
                    setDemoFeedback(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 cursor-pointer font-bold"
                >
                  Autofill Answer Sample
                </button>

                <button
                  onClick={() => handleDemoAnswerSubmit()}
                  disabled={isAnsweringDemo}
                  className="px-6 py-2.5 rounded-lg bg-[#14B8A6] hover:bg-[#1bb3a2] text-slate-950 font-extrabold shadow-[0_0_15px_rgba(20,184,166,0.2)] disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
                >
                  {isAnsweringDemo ? "Analyzing response algorithms..." : "Evaluate Response"}
                </button>
              </div>
            </div>

            {/* Simulated Live Feedback Report */}
            <AnimatePresence mode="wait">
              {demoFeedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl bg-slate-950 border border-[#14B8A6]/30 text-xs leading-relaxed space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-[#14B8A6]" />
                  <div className="flex justify-between items-center pl-3">
                    <span className="text-[#14B8A6] font-mono font-extrabold uppercase tracking-wider text-[11px] block">Copilot Core Evaluation Feedback</span>
                    <span className="text-[10px] text-zinc-500 font-mono font-bold">REAL-TIME GRADER</span>
                  </div>
                  <p className="text-slate-350 italic pl-3 leading-relaxed">
                    {demoFeedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* 6. PRICING SECTION EXCLUDED */}


      {/* 7. TESTIMONIALS SECTION EXCLUDED */}

      {/* 8. HELPFUL FAQ ACCORDION SECTION */}
      <section className="relative max-w-4xl mx-auto px-6 py-20 z-10 font-sans text-left" id="landing-faqs">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-[#A3FF3C] font-mono text-xs uppercase tracking-widest font-bold mb-3">// DETAILED TRANSPARENCY</h2>
          <h3 className="text-3xl font-extrabold font-display text-white">Frequently Asked Inquiries</h3>
          <p className="text-slate-400 mt-2 text-xs">Everything you need to know about parser behaviors and speech metrics.</p>
        </div>

        <div className="space-y-3.5">
          {FAQs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 transition-colors">
              <button 
                onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                className="w-full text-left flex justify-between items-center text-slate-200 font-bold text-sm tracking-wide font-display hover:text-white transition-colors"
                id={`faq-btn-${i}`}
              >
                <span>{faq.q}</span>
                {openFaqIdx === i ? <ChevronUp className="w-4 h-4 text-[#A3FF3C]" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              
              <AnimatePresence>
                {openFaqIdx === i && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-3"
                  >
                    <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-900">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 9. PREMIUM TECHNICAL FOOTER */}
      <footer className="relative border-t border-slate-900 bg-slate-950 py-12 px-6 z-10 text-slate-400 text-xs font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900/80">
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-[#A3FF3C] font-bold text-base font-display">
              <div className="w-7 h-7 bg-[#A3FF3C]/10 border border-[#A3FF3C]/20 rounded-lg flex items-center justify-center text-[#A3FF3C]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-white">AI Career Copilot</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              Premium SaaS platform designed for ambitious developers seeking to pass Applicant Tracking Systems and master structural technical interviews.
            </p>
          </div>

          <div className="text-left">
            <h5 className="text-white uppercase font-mono tracking-wider font-extrabold text-[10px] mb-4">Core Modules</h5>
            <ul className="space-y-2.5 text-slate-500 font-semibold text-xs">
              <li><a href="#landing-features" className="hover:text-[#A3FF3C] transition-colors">ATS Keyword Search Matrix</a></li>
              <li><a href="#landing-interview-demo" className="hover:text-[#A3FF3C] transition-colors">Speaking Simulation Room</a></li>
              <li><a href="#landing-ats-demo" className="hover:text-[#A3FF3C] transition-colors">Tailored PDF Formatter</a></li>
              <li><a href="#landing-pricing" className="hover:text-[#A3FF3C] transition-colors">Corporate Tiers</a></li>
            </ul>
          </div>

          <div className="text-left">
            <h5 className="text-white uppercase font-mono tracking-wider font-extrabold text-[10px] mb-4">API Systems</h5>
            <ul className="space-y-2.5 text-slate-500 font-semibold text-xs">
              <li><span className="text-slate-500">Google Gemini Flash SDK</span></li>
              <li><span className="text-slate-500"> SpeechRecognizer</span></li>
              <li><span className="text-slate-500">Persistent Local Storage</span></li>
              <li><span className="text-slate-500">Node JS Standalone Express Router</span></li>
            </ul>
          </div>

          <div className="text-left">
            <h5 className="text-white uppercase font-mono tracking-wider font-extrabold text-[10px] mb-4">Security Policies</h5>
            <div className="p-3 bg-slate-900/60 border border-slate-805 rounded-xl space-y-2 text-[10px] leading-relaxed">
              <div className="flex items-center gap-1.5 text-emerald-500 font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DATA SECURITY SECURE</span>
              </div>
              <p className="text-slate-600 font-medium">Any resume pastes and spoken history remain locked to candidate profiles or local guest containers securely.</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-mono font-bold uppercase tracking-wider select-none">
          <div>© 2026 AI Career Copilot Inc. All Rights Reserved.</div>
        </div>
      </footer>

    </div>
  );
}
