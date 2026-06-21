/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  Keyboard, 
  AlertCircle,
  Clock,
  Send,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkle,
  MessageSquare,
  Lightbulb,
  Zap,
  Award,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import { InterviewQuestion, InterviewAttempt } from "../types";
import { 
  getFallbackEvaluation, 
  getFallbackConsolidatedFeedback, 
  getFallbackContextTips 
} from "../utils/fallbacks";
import { motion, AnimatePresence } from "motion/react";

interface VoiceInterviewRoomProps {
  questions: InterviewQuestion[];
  jobTitle: string;
  companyName: string;
  onBackToDashboard: () => void;
  onInterviewFinished: (attempt: InterviewAttempt) => void;
}

const categoryTips: Record<string, {
  title: string;
  focus: string;
  pacing: string;
  framework: string;
  confidenceBooster: string;
  powerWords: string[];
  pitfalls: string[];
}> = {
  introduction: {
    title: "The Elevator Pitch Hook",
    focus: "Synthesize a 60-90 second narrative connecting past landmarks to this role's specific challenges.",
    pacing: "Moderate & Conversational (110-130 WPM). Pause briefly after introducing your flagship role.",
    framework: "Present (Current status) → Past (Landmark achievement) → Future (Why this specific company/team).",
    confidenceBooster: "Focus on 'contribution index' rather than generic duties. Stand tall and project your voice.",
    powerWords: ["Pioneered", "Leveraged", "Aligned with", "Core expertise", "Passionate about"],
    pitfalls: ["Reading your resume chronologically without passion", "Speaking for over 3 minutes without a cohesive story"]
  },
  technical: {
    title: "System & Architecture Precision",
    focus: "Explain architectural patterns, design trade-offs, and micro-decisions rather than just surface-level syntax.",
    pacing: "Deliberate & Analytical (90-110 WPM). Give extra vocal weight to core protocols and trade-offs.",
    framework: "Context (Scale / Volumetrics) → Trade-off Assessment (Option A vs B) → Choice & Reasoning → Outcomes.",
    confidenceBooster: "It is okay to pause for 5 seconds to structure thoughts. Say: 'Let me break down my architectural reasoning.'",
    powerWords: ["Scalability", "Latency overhead", "Throughput", "Optimization", "Trade-offs", "Write-through caching"],
    pitfalls: ["Saying 'I don't know' without offering a troubleshooting path", "Diving into unorganized code details first"]
  },
  behavioral: {
    title: "The STAR Action Force",
    focus: "Demonstrate high accountability, peer mentorship, and conflict resolution using quantifiable metrics.",
    pacing: "Empathetic & Narrative (100-120 WPM). Emphasize personal ownership over team-wide passive verbs.",
    framework: "Situation (Scope & Stakes) → Task (Your ownership) → Action (Code / Delivery steps) → Result (Metric impact).",
    confidenceBooster: "Own the challenges you faced. Overcoming friction is where true senior capability is proven.",
    powerWords: ["Orchestrated", "Spearheaded", "Mitigated", "Resolved", "Quantifiable impact", "Velocity"],
    pitfalls: ["Using 'We' too much instead of 'I'", "Omitting numeric metrics of your efforts"]
  },
  "problem-solving": {
    title: "Structured Critical Thinking",
    focus: "Showcase step-by-step diagnostic breakdown of ambiguous issues under production pressure.",
    pacing: "Measured & Structured (95-115 WPM). Enounce each numbered troubleshooting phase clearly.",
    framework: "Identify Symptom → Scope Blast Radius → Formulate Hypotheses → Run Isolation Tests → Establish Permanent Fix.",
    confidenceBooster: "Speak your internal monologue out loud. Interviewers care more about your debugger process than raw trivia.",
    powerWords: ["Blast radius", "Hypothesis", "Systematic isolation", "Root cause analysis", "Telemetry logs", "Fallback mechanism"],
    pitfalls: ["Guessing random solutions immediately", "Failing to evaluate risk or side-effects before applying changes"]
  },
  projects: {
    title: "Deep Project Mastery",
    focus: "Connect your specific engineering project to higher organizational business objectives.",
    pacing: "Engaging & Technical (100-120 WPM). Let your genuine passion and pride for the craft shine through your voice.",
    framework: "The Prompt (Requirement) → Technology Stack Choice → Complex Implementation Hurdle → Business Value Created.",
    confidenceBooster: "Cite real engineering metrics. Numbers act as bulletproof proof-of-work indicators for committees.",
    powerWords: ["Architected", "Production-grade", "E2E integration", "Performance latency", "Resource utilization", "Bottlenecks"],
    pitfalls: ["Underselling your involvement", "Providing a generic summary instead of specifying your unique engineering footprint"]
  },
  leadership: {
    title: "Influence & Task Mentorship",
    focus: "Demonstrate cross-team execution, architectural consensus building, and professional maturity.",
    pacing: "Calm, Patient & Visionary (100-110 WPM). Speak with high conversational maturity and low friction.",
    framework: "Empathy / Diverse Perspectives → Alignment Mechanism (Specs, RFCs, Prototypes) → Objective Resolution → Cultural Progress.",
    confidenceBooster: "Assertive yet inclusive posture. Speak about helping others grow as a victory for yourself and the team.",
    powerWords: ["Consensus", "Empowered", "Architectural RFC", "Mentored", "Collaborative direction", "Alignment"],
    pitfalls: ["Sounding defensive during disagreements", "Taking personal credit for team collaborative initiatives"]
  },
  "domain-knowledge": {
    title: "Industry Standards & Acumen",
    focus: "Assert comprehension of domain protocols, security compliance, clean standards, and high reliability.",
    pacing: "Authoritative & Secure (100-115 WPM). Pronounce specific industry jargon with absolute confidence.",
    framework: "Standard/Protocol Reference → Strategic Importance → Dynamic Application → Security & Compliance Guardrails.",
    confidenceBooster: "Cite modern standards like OWASP, SOC2, GDPR, or SLA target configurations to show enterprise-grade discipline.",
    powerWords: ["Postgres replication", "Security compliance", "Idempotency", "Rate limiting", "Zero-trust pattern", "SLA/SLO target"],
    pitfalls: ["Neglecting safety, unit tests, or edge-case reliability", "Confusing industry-level terminology"]
  }
};

const fallbackTip = {
  title: "Delivery Masterclass",
  focus: "Aim for direct engagement of the prompt. State a solid summary, provide deep details, and conclude cleanly.",
  pacing: "Balanced & Conversational (110-120 WPM). Pace yourself using active pauses.",
  framework: "Intro → Evidence / Proof of execution → Metric Result → Actionable Takeaway.",
  confidenceBooster: "Keep your breathing steady. Settle into a rhythm and keep your voice clear and positive.",
  powerWords: ["Pioneered", "Leveraged", "Mitigated", "Spearheaded", "Transferred"],
  pitfalls: ["Rushing to fill natural pauses with filler sounds", "Rambling without stating the business outcome"]
};

export default function VoiceInterviewRoom({
  questions,
  jobTitle,
  companyName,
  onBackToDashboard,
  onInterviewFinished
}: VoiceInterviewRoomProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responseText, setResponseText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showProTips, setShowProTips] = useState(false);
  const [dynamicTip, setDynamicTip] = useState<{
    title: string;
    focus: string;
    pacing: string;
    framework: string;
    confidenceBooster: string;
    powerWords: string[];
    pitfalls: string[];
  } | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  
  // Accumulated history for evaluation
  const [qaHistory, setQaHistory] = useState<Array<{
    questionId: string;
    questionText: string;
    candidateResponse: string;
    score?: any;
    feedback?: string;
  }>>([]);

  const currentQuestion = questions[currentIndex];
  const recognitionRef = useRef<any>(null);

  // Dynamic Gemini Context-Aware Pro-Tips
  useEffect(() => {
    if (!currentQuestion) return;
    
    let isMounted = true;
    setIsLoadingTip(true);
    setDynamicTip(null); // Reset to show static fallback while fetching

    fetch("/api/generate-context-tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionText: currentQuestion.question,
        questionType: currentQuestion.type,
        jobTitle,
        companyName
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load custom tips");
        return res.json();
      })
      .then(data => {
        if (isMounted && data && data.title) {
          setDynamicTip(data);
        }
      })
      .catch(err => {
        console.warn("Could not retrieve AI-customized pro tips, using robust local analyzer:", err);
        if (isMounted) {
          const fallbackTips = getFallbackContextTips(currentQuestion.question, currentQuestion.type, jobTitle, companyName);
          setDynamicTip(fallbackTips);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTip(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentIndex, currentQuestion, jobTitle, companyName]);

  // Auto-speak question on index change
  useEffect(() => {
    if (currentQuestion) {
      const tm = setTimeout(() => {
        handleSpeakQuestion();
      }, 500);
      return () => clearTimeout(tm);
    }
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  // Text to Speech
  const handleSpeakQuestion = () => {
    if (!currentQuestion) return;
    setErrorMsg("");

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `Question ${currentIndex + 1}. ${currentQuestion.question}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => {
        setIsSpeaking(true);
        if (isListening) handleStopListening();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        // Prompt auto start micro listen
        handleStartListening();
      };
      utterance.onerror = (e) => {
        console.error("Utterance Error:", e);
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setErrorMsg("Web Speech API synthesizer is not supported in this frame environment. Please review prompts and type details manually.");
    }
  };

  const handleMuteSpeaker = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speech to Text (Microphone listener)
  const handleStartListening = () => {
    setErrorMsg("");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMsg("Voice capture is sandbox restricted. Please type your answer directly into the interactive transcript area below.");
      return;
    }

    try {
      if (isSpeaking) handleMuteSpeaker();

      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = "en-US";

      recognizer.onstart = () => {
        setIsListening(true);
      };

      recognizer.onresult = (e: any) => {
        let currentDraft = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            currentDraft += e.results[i][0].transcript + " ";
          }
        }
        if (currentDraft) {
          setResponseText(prev => prev + currentDraft);
        }
      };

      recognizer.onerror = (e: any) => {
        console.error("Speech Listen Error:", e);
        if (e.error !== "no-speech") {
          setErrorMsg(`Microphone input capture warning (${e.error}). Use the manual transcript panel to reply instead.`);
        }
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
      recognizer.start();
    } catch (exp: any) {
      console.error(exp);
      setErrorMsg("Microphone initialization error. Please compose your answer manually.");
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsListening(false);
  };

  const handleAnswerSubmit = async () => {
    if (!responseText.trim()) {
      setErrorMsg("Please formulate and input some transcript text before locking down responses.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    handleStopListening();
    handleMuteSpeaker();

    try {
      let evalData;
      try {
        const response = await fetch("/api/evaluate-interview-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: currentQuestion.question,
            candidateResponse: responseText,
            idealKeywords: currentQuestion.idealKeywords
          })
        });

        if (!response.ok) {
          throw new Error("Local proxy server is offline or returned an error status.");
        }

        evalData = await response.json();
      } catch (fetchErr) {
        console.warn("[Standalone Client Mode] Falling back to offline question grading engine:", fetchErr);
        evalData = getFallbackEvaluation(currentQuestion.question, responseText, currentQuestion.idealKeywords || []);
      }

      const newQaItem = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        candidateResponse: responseText,
        score: evalData.score || { 
          communication: 80, 
          confidence: 80,
          relevance: 80,
          technicalKnowledge: 80,
          problemSolving: 80
        },
        feedback: evalData.feedback || "STAR components present. Solid phrasing delivery.",
        improvementSuggestions: evalData.improvementSuggestions || evalData.feedback || "Continue using active achievements verbs in your scenarios."
      };

      const updatedHistory = [...qaHistory, newQaItem];
      setQaHistory(updatedHistory);
      setResponseText("");

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        await handleCompileFinalReport(updatedHistory);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process interview grades. Please retry submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompileFinalReport = async (fullHistory: typeof qaHistory) => {
    try {
      let finalReport;
      try {
        const response = await fetch("/api/generate-final-interview-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobTitle,
            companyName,
            QAHistory: fullHistory
          })
        });

        if (!response.ok) {
          throw new Error("Local proxy server is offline or returned an error status.");
        }

        finalReport = await response.json();
      } catch (fetchErr) {
        console.warn("[Standalone Client Mode] Falling back to offline feedback consolidator engine:", fetchErr);
        finalReport = getFallbackConsolidatedFeedback(jobTitle, companyName, fullHistory);
      }

      const finalResult: InterviewAttempt = {
        id: `interview_${Date.now()}`,
        userId: "guest",
        jobTitle,
        companyName,
        questions,
        responses: fullHistory.map(item => ({
          questionId: item.questionId,
          questionText: item.questionText,
          candidateResponse: item.candidateResponse,
          score: item.score,
          feedback: item.feedback
        })),
        currentQuestionIndex: currentIndex,
        isCompleted: true,
        overallScore: finalReport.overallScore,
        overallFeedback: finalReport.overallFeedback,
        createdAt: new Date().toISOString(),
        _isFallback: true
      };

      onInterviewFinished(finalResult);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to finalize evaluation. Try again.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto min-h-0 text-gray-100 font-sans relative py-6">
      
      {/* 1. TOP STATUS PANEL & PROGRESS HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-slate-900 pb-6">
        <div className="flex items-center gap-4">
          {/* <button
            onClick={onBackToDashboard}
            className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white transition-all shadow-sm cursor-pointer"
            title="Return to desktop workspace"
          >
            <ArrowLeft className="w-5 h-5 text-[#14B8A6]" />
          </button> */}
          <div>
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
              <span>{companyName}</span>
              <span className="text-slate-600 font-light">/</span>
              <span className="text-[#A3FF3C]">{jobTitle}</span>
            </h1>
            <p className="text-slate-400 text-xs font-mono font-bold mt-1">SIMULATED INTERVIEW BOARD LABACTIVE</p>
          </div>
        </div>

        {/* Progress & Copilot Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowProTips(!showProTips)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-md ${
              showProTips 
                ? "bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#14B8A6] hover:bg-[#14B8A6]/20" 
                : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${showProTips ? "text-[#A3FF3C] animate-pulse" : "text-slate-400"}`} />
            <span>PRO-TIPS COPILOT: {showProTips ? "ON" : "OFF"}</span>
          </button>

          <div className="flex items-center gap-4 bg-[#111827] border border-slate-900 px-5 py-2.5 rounded-2xl text-xs font-mono font-bold">
            <Clock className="w-4.5 h-4.5 text-[#14B8A6]" />
            <span>SIMULATION: QUESTION {currentIndex + 1} OF {questions.length}</span>
          </div>
        </div>
      </div>

      {isSubmitting ? (
        <div className="py-24 text-center space-y-6 max-w-md mx-auto">
          {/* Animated orbital ring indicator */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#14B8A6]/10 border-t-[#14B8A6] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-[#A3FF3C]/10 border-b-[#A3FF3C] animate-spin-reverse"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold font-display text-white">Aggregating Cognitive Star Ratings</h3>
            <p className="text-slate-450 text-xs leading-relaxed font-semibold">Gemini is evaluating your Star phrasing, vocabulary clarity, and technical matrices against OpenAI parameters...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* 2. THE AI AVATAR INTERACTIVE SPEAKER (lg:col-span-12 xl:col-span-4 or xl:col-span-5) */}
          <motion.div 
            layout="position"
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className={`lg:col-span-12 ${showProTips ? "xl:col-span-4" : "xl:col-span-5"} p-8 rounded-3xl bg-[#111827] border border-slate-800 flex flex-col justify-between min-h-[550px] relative shadow-2xl transition-all duration-300`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-[#A3FF3C]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center font-mono text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
              <span className="text-[#A3FF3C]">VOICE COGNITIVE STREAM</span>
              <span className="bg-slate-950 px-3 py-1 rounded-full border border-slate-900 text-slate-400">HOST STATE</span>
            </div>

            {/* AI Avatar Canvas area with pulsing high-intensity concentric waves */}
            <div className="flex flex-col items-center justify-center py-10 relative">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Ring wave 1 */}
                <span className={`absolute inset-0 rounded-full border border-[#14B8A6]/20 transition-all duration-700 ${
                  isSpeaking ? 'scale-125 opacity-100 animate-ping' : isListening ? 'scale-110 border-[#A3FF3C]/20 animate-pulse' : 'scale-100 opacity-20'
                }`} />
                {/* Ring wave 2 */}
                <span className={`absolute inset-2 rounded-full border border-dashed border-[#A3FF3C]/10 transition-all duration-700 ${
                  isSpeaking ? 'scale-110 opacity-70 animate-pulse' : isListening ? 'scale-120 border-[#14B8A6]/10 animate-ping' : 'scale-90 opacity-10'
                }`} />

                {/* Core animated pulsing Avatar dome */}
                <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center relative transition-all duration-450 pointer-events-none ${
                  isSpeaking ? 'bg-[#14B8A6]/15 border-2 border-[#14B8A6] text-[#14B8A6] shadow-[0_0_30px_rgba(20,184,166,0.3)]' :
                  isListening ? 'bg-[#A3FF3C]/15 border-2 border-[#A3FF3C] text-[#A3FF3C] shadow-[0_0_30px_rgba(163,255,60,0.3)] animate-pulse' :
                  'bg-slate-950 border-2 border-slate-850 text-slate-500 shadow-inner'
                }`}>
                  {isSpeaking ? (
                    <div className="text-center space-y-1">
                      <Volume2 className="w-8 h-8 mx-auto animate-bounce" />
                      <span className="text-[9px] uppercase font-mono tracking-widest font-black">SPEAKING</span>
                    </div>
                  ) : isListening ? (
                    <div className="text-center space-y-1">
                      <Mic className="w-8 h-8 mx-auto animate-pulse" />
                      <span className="text-[9px] uppercase font-mono tracking-widest font-black">LISTENING</span>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-655" />
                      <span className="text-[9px] uppercase font-mono tracking-widest font-black text-slate-600">STANDBY</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transcript & Host Action summary */}
            <div className="text-center space-y-2">
              <h4 className="text-sm font-black font-display text-white">
                {isSpeaking ? "AI Lead Host is stating the prompt..." :
                 isListening ? "Convey STAR patterns now..." :
                 "Cognitive Simulator Standby"}
              </h4>
              <p className="text-slate-450 text-xs max-w-sm mx-auto leading-relaxed font-semibold">
                {isListening ? "Formulate points clearly using Situation, Task, Action, and Result formats. Stream remains active." : "Press Trigger Host to prompt the audio synthesis system."}
              </p>
            </div>

            {/* Sound Controls Row */}
            <div className="flex gap-3 justify-center text-xs pt-4 border-t border-slate-900">
              <button
                onClick={handleSpeakQuestion}
                className="px-4 py-2.5 rounded-xl bg-slate-955 hover:bg-slate-900 border border-slate-850 text-slate-350 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-[#14B8A6]" />
                Repeat Audio
              </button>

              {isListening ? (
                <button
                  onClick={handleStopListening}
                  className="px-4 py-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MicOff className="w-4 h-4 text-red-500" />
                  Close Mic
                </button>
              ) : (
                <button
                  onClick={handleStartListening}
                  className="px-4 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                  id="start-mic-btn"
                >
                  <Mic className="w-4 h-4 text-white" />
                  Capture Wave
                </button>
              )}
            </div>

          </motion.div>

          {/* 3. DOCK & TRANSCRIPT WORKSPACE (lg:col-span-12 xl:col-span-5 or xl:col-span-7 depending on showProTips) */}
          <motion.div 
            layout="position"
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className={`lg:col-span-12 ${showProTips ? "xl:col-span-5" : "xl:col-span-7"} flex flex-col justify-between space-y-6 transition-all duration-300`}
          >
            
            {/* Active question prompt container */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-[#14B8A6]/5 to-transparent rounded-full blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-[10px] font-mono uppercase bg-[#14B8A6]/10 border border-[#14B8A6]/15 text-[#14B8A6] px-3 py-1 rounded-full font-bold">
                  Active {currentQuestion?.type || "Target Criteria"} Prompt
                </span>
                <span className="text-[10px] font-mono text-slate-550 font-bold uppercase">Copilot Node: Active</span>
              </div>

              <h3 className="text-lg md:text-xl font-extrabold text-white leading-relaxed font-display">
                "{currentQuestion?.question}"
              </h3>

              <div className="mt-5 pt-4 border-t border-slate-900 flex items-start gap-3 text-xs text-slate-400 leading-relaxed font-semibold">
                <HelpCircle className="w-4.5 h-4.5 text-[#A3FF3C] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-300 font-bold">Structural Concept Tip:</strong>{" "}
                  {currentQuestion?.contextTip}
                </p>
              </div>
            </div>

            {/* Answer composition writing deck */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline text-xs font-mono font-bold">
                <label className="text-slate-400 flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-[#14B8A6]" />
                  Active Verbal Answer Transcript
                </label>
                <span className="text-slate-550 uppercase text-[10px]">Dual Speech Text Engine</span>
              </div>

              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Microphone results are streamed here automatically. Feel free to type or edit details directly in this workspace block to build a perfect answer..."
                className="w-full h-76 bg-slate-950 border border-slate-905 focus:outline-none focus:border-[#A3FF3C]/40 p-5 rounded-3xl text-slate-200 text-xs md:text-sm leading-relaxed font-mono focus:bg-slate-955"
                id="voice-response-textarea"
              />

              {errorMsg && (
                <div className="p-4 bg-red-955/20 border border-red-900/30 rounded-2xl text-red-400 text-xs flex items-start gap-2.5 font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-500 font-mono font-bold uppercase">
                  {responseText.trim().length > 0 ? `${responseText.trim().split(/\s+/).length} Words parsed` : "0 Words composed"}
                </span>

                <button
                  onClick={handleAnswerSubmit}
                  disabled={isSubmitting || !responseText.trim()}
                  className="px-6 py-3.5 rounded-2xl bg-[#14B8A6] hover:bg-[#0d9488] disabled:bg-slate-900 disabled:text-slate-500 text-white text-xs font-extrabold uppercase tracking-wider font-display flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  id="submit-answer-btn"
                >
                  {currentIndex + 1 === questions.length ? "Finish & Compute Grades" : "Submit STAR reply"}
                  <ArrowRight className="w-4.5 h-4.5 text-white" />
                </button>
              </div>
            </div>

          </motion.div>

          {/* 4. CONTEXT-AWARE PRO-TIPS SIDEBAR */}
          <AnimatePresence mode="popLayout">
            {showProTips && (
              <motion.div
                layout
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.98 }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className="lg:col-span-12 xl:col-span-3 flex flex-col space-y-5"
              >
                <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-2xl flex flex-col justify-between h-full relative overflow-y-auto max-h-[720px] scrollbar-none">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#A3FF3C]/5 to-transparent rounded-full blur-xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#A3FF3C] animate-pulse" />
                        <span className="text-xs font-black font-display text-white uppercase tracking-widest">PRO-TIPS COPILOT</span>
                      </div>
                      <button 
                        onClick={() => setShowProTips(false)}
                        className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-350 transition-colors uppercase bg-slate-950/40 px-2 py-0.5 rounded border border-slate-900"
                      >
                        Hide
                      </button>
                    </div>

                    {/* Active Question Type Dynamic Card */}
                    {(() => {
                      const baseTip = categoryTips[currentQuestion?.type || ""] || fallbackTip;
                      const tip = dynamicTip || baseTip;
                      return (
                        <div className="space-y-4">
                          {/* Insight Mode Status Badge */}
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                              Insight Engine
                            </span>
                            {isLoadingTip ? (
                              <span className="text-[9px] font-mono font-bold text-[#A3FF3C] animate-pulse flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#A3FF3C] rounded-full animate-ping" />
                                Analyzing Question...
                              </span>
                            ) : dynamicTip ? (
                              (dynamicTip as any)._isFallback ? (
                                <span className="text-[9px] font-mono font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20" title="Gemini rate limit fallback activated">
                                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                                  Fallback Blueprint
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono font-bold text-[#14B8A6] flex items-center gap-1.5 bg-[#14B8A6]/10 px-2 py-0.5 rounded-full border border-[#14B8A6]/20">
                                  <span className="w-1.5 h-1.5 bg-[#14B8A6] rounded-full animate-pulse" />
                                  AI Personalized
                                </span>
                              )
                            ) : (
                              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                                Default Blueprint
                              </span>
                            )}
                          </div>

                          {/* Banner Info */}
                          <div className="bg-[#14B8A6]/5 border border-[#14B8A6]/20 p-3.5 rounded-2xl relative overflow-hidden transition-all">
                            <div className="flex items-center gap-2 text-[#14B8A6] font-mono text-[10px] uppercase font-bold tracking-wider">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{currentQuestion?.type?.replace("-", " ") || "Core Strategy"} Alignment</span>
                            </div>
                            <h4 className="text-xs font-black text-white mt-1.5 leading-snug">{tip.title}</h4>
                            <p className="text-slate-400 text-[11px] leading-relaxed mt-1 font-semibold">
                              {tip.focus}
                            </p>
                          </div>

                          {/* Speech Pacing & Delivery */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-[#A3FF3C]" />
                              Vocal Tempo & Meter
                            </span>
                            <p className="text-slate-355 text-[11px] leading-relaxed font-semibold bg-slate-950/40 p-3 rounded-2xl border border-slate-905">
                              {tip.pacing}
                            </p>
                          </div>

                          {/* Structuring Framework Blueprint */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-[#14B8A6]" />
                              Answering Scaffold
                            </span>
                            <div className="p-3 bg-slate-950/40 border border-slate-905 rounded-2xl text-[11px]">
                              <p className="text-[#A3FF3C] font-mono font-bold uppercase text-[9px] mb-1">Target Flow Pattern:</p>
                              <p className="text-slate-300 leading-relaxed font-semibold font-sans">{tip.framework}</p>
                            </div>
                          </div>

                          {/* Power Phrasing */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-[#A3FF3C]" />
                              Power Words to Sprinkle
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {tip.powerWords?.map((word, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-[10px] font-mono bg-[#A3FF3C]/5 border border-[#A3FF3C]/10 hover:border-[#A3FF3C]/30 text-white rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer select-none"
                                  onClick={() => setResponseText(prev => prev ? `${prev.trim()} ${word}` : word)}
                                  title="Click to insert into answer transcript"
                                >
                                  +{word}
                                </span>
                              ))}
                            </div>
                            <p className="text-[9px] font-mono text-slate-600 font-bold mt-1 uppercase">// Tip: Click a word to add to your workspace</p>
                          </div>

                          {/* Verbal Pitfalls */}
                          <div className="space-y-2 pt-2 border-t border-slate-900">
                            <span className="text-[10px] uppercase tracking-wider font-mono text-red-500 font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                              Critical Verbal Traps
                            </span>
                            <ul className="space-y-1.5 text-[11px] text-slate-400 font-semibold leading-relaxed">
                              {tip.pitfalls?.map((pitfall, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-red-500 font-bold leading-none mt-0.5">•</span>
                                  <span>{pitfall}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Confidence Booster */}
                          <div className="p-3.5 bg-slate-950 border border-slate-905 rounded-2xl mt-2">
                            <span className="text-[9px] font-mono font-black uppercase text-[#14B8A6] tracking-widest block mb-1">🔥 Confidence Booster</span>
                            <p className="text-slate-350 text-[10px] font-semibold leading-relaxed">{tip.confidenceBooster}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
