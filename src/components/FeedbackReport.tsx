/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Compass, 
  Smile, 
  UserCheck, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkle
} from "lucide-react";
import { InterviewAttempt } from "../types";
import { motion } from "motion/react";

interface FeedbackReportProps {
  attempt: InterviewAttempt;
  onBackToDashboard: () => void;
  onRestartPractice: () => void;
}

export default function FeedbackReport({
  attempt,
  onBackToDashboard,
  onRestartPractice
}: FeedbackReportProps) {
  const score = attempt.overallScore || {
    communication: 75,
    confidence: 75,
    relevance: 75,
    technicalKnowledge: 75,
    problemSolving: 75,
    composite: 75
  };
  const feedback = attempt.overallFeedback || {
    strengths: ["Strong introduction"],
    weaknesses: ["Add metrics details"],
    actionableSuggestions: ["STAR templates checks"],
    hiringRecommendation: "Review Needed"
  };

  // Web Speech API Text-to-Speech State and Logic
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [activeText, setActiveText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Default prefer an English voice, ideally premium/natural ones if available
      const defaultVoice = availableVoices.find(v => 
        v.lang.startsWith("en-") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium") || v.name.includes("Microsoft"))
      ) || availableVoices.find(v => v.lang.startsWith("en-")) || availableVoices[0];
      
      if (defaultVoice) {
        setSelectedVoiceURI(defaultVoice.voiceURI);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (textToSpeak: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    // Toggle pause and resume if it is the active text
    if (activeText === textToSpeak) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsSpeaking(true);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setIsSpeaking(false);
      }
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown debris, stars, and symbols for clearer audio
    const cleanText = textToSpeak
      .replace(/["'*•\-\[\]\(\)]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (selectedVoiceURI) {
      const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setActiveText(textToSpeak);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveText(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveText(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveText(null);
  };

  return (
    <div className="max-w-[1500px] mx-auto min-h-0 text-gray-150 font-sans p-6 leading-relaxed">
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-900">
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
              Feedback Diagnostics Index
            </h1>
            <p className="text-slate-405 text-xs font-semibold mt-1">Diagnostic alignment summary parsed directly from your spoken mock transcript history.</p>
          </div>
        </div>

        <button
          onClick={onRestartPractice}
          className="px-5 py-3 rounded-2xl bg-[#14B8A6] hover:bg-[#0d9488] text-white text-xs font-extrabold uppercase tracking-wider font-display flex items-center gap-2 transition-all cursor-pointer shadow-md"
          id="retry-interview-btn"
        >
          <RotateCcw className="w-4 h-4 text-white" />
          Simulate New Session
        </button>
      </div>

      {attempt._isFallback && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-semibold flex items-start gap-3 max-w-4xl mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        
        {/* 2. LEFT COLUMN: COMPOSITE RECOMMENDATION METRIC */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          
          <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 relative overflow-hidden shadow-xl text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3FF3C]/5 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#14B8A6] mb-6">INTELLIGENT HIRING TONE</h3>
            
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 border border-slate-900 text-[#A3FF3C] font-display text-xs uppercase font-extrabold tracking-widest mb-6">
              {feedback.hiringRecommendation === 'Strong Hire' && <UserCheck className="w-4.5 h-4.5 text-[#A3FF3C]" />}
              {feedback.hiringRecommendation === 'Hire' && <CheckCircle2 className="w-4.5 h-4.5 text-[#14B8A6]" />}
              {feedback.hiringRecommendation === 'Review Needed' && <Compass className="w-4.5 h-4.5 text-amber-450" />}
              {feedback.hiringRecommendation === 'No Hire' && <XCircle className="w-4.5 h-4.5 text-red-500" />}
              <span>{feedback.hiringRecommendation}</span>
            </div>

            <div className="text-center space-y-1">
              <span className="text-4xl font-black font-display text-white block">
                {score.composite}%
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
                COMPOSITE PERFORMANCE GRADE
              </span>
            </div>

            <p className="text-slate-450 text-xs mt-4 leading-relaxed font-semibold max-w-xs mx-auto">
              Computed alignment balances across technical relevance, key behavioral STAR structure progression, and voice tone delivery metrics.
            </p>
          </div>

          {/* Bar Chart sliders */}
          <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-5 shadow-xl">
            <h4 className="text-[10px] font-mono tracking-wider uppercase text-slate-500 font-extrabold mb-2 block">// CORE METRICS HIGHLIGHTS</h4>
            
            {/* Metric 1: Communication */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold leading-none">
                <span className="text-slate-200">Communication Pacing</span>
                <span className="text-[#A3FF3C] font-mono">{score.communication}%</span>
              </div>
              <div className="bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-905">
                <div 
                  className="bg-[#A3FF3C] h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${score.communication}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 2: Confidence */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold leading-none">
                <span className="text-slate-200">Confidence & Delivery</span>
                <span className="text-[#14B8A6] font-mono">{score.confidence}%</span>
              </div>
              <div className="bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-905">
                <div 
                  className="bg-[#14B8A6] h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${score.confidence}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 3: Relevance */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold leading-none">
                <span className="text-slate-200">Context/Role Relevance</span>
                <span className="text-blue-400 font-mono">{score.relevance}%</span>
              </div>
              <div className="bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-905">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${score.relevance}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 4: Technical Knowledge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold leading-none">
                <span className="text-slate-200">Technical Knowledge</span>
                <span className="text-purple-400 font-mono">{score.technicalKnowledge}%</span>
              </div>
              <div className="bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-905">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${score.technicalKnowledge}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 5: Problem Solving */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold leading-none">
                <span className="text-slate-200">Problem Solving & STAR Match</span>
                <span className="text-orange-400 font-mono">{score.problemSolving}%</span>
              </div>
              <div className="bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-905">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${score.problemSolving}%` }}
                ></div>
              </div>
            </div>

          </div>

        </div>

        {/* 3. RIGHT COLUMN: INSIGHT CHIPS & DIALOGUE TRANSCRIPTS */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          
          {/* Dual blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl">
              <h4 className="text-xs uppercase font-mono tracking-widest text-[#14B8A6] font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-[#14B8A6]" />
                Demonstrated Strengths
              </h4>
              <ul className="space-y-3 font-semibold text-xs leading-relaxed text-slate-400 max-h-[180px] overflow-y-auto">
                {feedback.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#14B8A6] font-bold leading-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl">
              <h4 className="text-xs uppercase font-mono tracking-widest text-red-400 font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-red-505" />
                Opportunities to Improve
              </h4>
              <ul className="space-y-3 font-semibold text-xs leading-relaxed text-slate-400 max-h-[180px] overflow-y-auto">
                {feedback.weaknesses.map((wk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold leading-none">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Coaching milestones */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-5">
              <div>
                <h4 className="text-sm font-extrabold font-display text-white">Target Coaching Milestones</h4>
                <p className="text-[11px] text-slate-450 font-semibold mt-0.5">Narrate performance critiques and core feedback items utilising voice simulation.</p>
              </div>

              {/* Speech Controls & Custom Voice Selector */}
              {voices.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-900">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-extrabold">Voice:</span>
                    <select
                      value={selectedVoiceURI}
                      onChange={(e) => setSelectedVoiceURI(e.target.value)}
                      className="bg-transparent border-none text-[10px] text-white font-mono focus:outline-none cursor-pointer max-w-[130px] pt-0 pb-0"
                    >
                      {voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI} className="bg-[#111827] text-white text-[10px] font-semibold">
                          {v.name.replace("Microsoft", "").replace("Google", "").replace("English", "").trim()} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="h-4 w-[1px] bg-slate-800 shrink-0" />

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-extrabold">Speed:</span>
                    <select
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="bg-transparent border-none text-[10px] text-[#A3FF3C] font-mono focus:outline-none cursor-pointer pt-0 pb-0"
                    >
                      <option value="0.75" className="bg-[#111827] text-white text-xs">0.75x</option>
                      <option value="1.0" className="bg-[#111827] text-white text-xs">1.0x (Normal)</option>
                      <option value="1.2" className="bg-[#111827] text-white text-xs">1.2x</option>
                      <option value="1.5" className="bg-[#111827] text-white text-xs">1.5x</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Global Milestones Speech Playback Panel */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-[#14B8A6]/10 border border-[#14B8A6]/20 flex items-center justify-center relative shrink-0 text-[#14B8A6] ${isSpeaking && activeText?.includes("milestones") ? "animate-pulse" : ""}`}>
                  {isSpeaking && activeText?.includes("milestones") ? (
                    <Volume2 className="w-5 h-5 text-[#A3FF3C]" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                  {isSpeaking && activeText?.includes("milestones") && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3FF3C] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A3FF3C]"></span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Oral Critiques Facilitator</span>
                  <span className="text-[11px] font-black text-slate-200 block">
                    {isSpeaking && activeText?.includes("milestones") ? (isPaused ? "Critique Paused" : "Speaking Milestones Sequentially...") : "Listen to all your suggestions as an audio briefing"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto justify-end">
                <button
                  onClick={() => {
                    const milestonesText = `Here are your target coaching milestones. ` + feedback.actionableSuggestions.map((s, idx) => `Suggestion ${idx + 1}: ${s}`).join(". ");
                    handleSpeak(milestonesText + ". This concludes your key feedback suggestions analysis summary.");
                  }}
                  className={`px-4 py-2 rounded-xl text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 select-none cursor-pointer transition-all ${
                    isSpeaking && activeText?.includes("milestones")
                      ? "bg-amber-600 border border-amber-700 text-amber-50"
                      : "bg-[#14B8A6] hover:bg-[#0d9488] text-white"
                  }`}
                  id="narrate-all-milestones-btn"
                >
                  {isSpeaking && activeText?.includes("milestones") ? (
                    isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Resume Playback
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        Pause Playback
                      </>
                    )
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      Play All Suggestions
                    </>
                  )}
                </button>

                {isSpeaking && activeText?.includes("milestones") && (
                  <button
                    onClick={handleStop}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-red-500 hover:text-red-400 transition-all cursor-pointer"
                    id="stop-milestones-btn"
                    title="Stop audio briefing"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Individual Action Cards with inline player buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feedback.actionableSuggestions.map((sug, i) => {
                const isItemSpeaking = activeText === sug;
                return (
                  <div 
                    key={i} 
                    className={`feedback-suggestion-item p-4 rounded-xl border text-xs leading-relaxed flex flex-col justify-between font-semibold transition-all relative group ${
                      isItemSpeaking 
                        ? "bg-[#14B8A6]/10 border-[#14B8A6]/40 text-white" 
                        : "bg-slate-950 border-slate-905 text-slate-350 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="w-5 h-5 rounded-lg bg-[#A3FF3C]/10 border border-[#A3FF3C]/15 text-[#A3FF3C] font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        0{i + 1}
                      </span>
                      <span className="flex-1 text-slate-200">{sug}</span>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleSpeak(sug)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isItemSpeaking
                            ? "bg-[#A3FF3C]/20 border-[#A3FF3C]/30 text-[#A3FF3C]"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                        title="Listen to suggestion"
                        id={`speak-sug-${i}`}
                      >
                        {isItemSpeaking && !isPaused ? (
                          <>
                            <Pause className="w-3 h-3 animate-pulse text-[#A3FF3C]" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-[#14B8A6]" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dialogue Transcript stream */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest flex items-center gap-2 mb-4">
              <Clock className="w-4 text-[#14B8A6]" />
              Dialogue Transcription Audit ({attempt.responses.length} responses)
            </h3>

            <div className="space-y-4">
              {attempt.responses.map((resItem, i) => (
                <div key={resItem.questionId} className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-baseline border-b border-slate-900 pb-3">
                    <span className="text-xs font-black font-mono text-zinc-300">QUESTION INDEX 0{i + 1}</span>
                    <div className="text-[10px] text-[#A3FF3C] font-mono font-bold bg-[#A3FF3C]/10 px-2.5 py-1 border border-[#A3FF3C]/15 rounded-lg flex flex-wrap gap-x-2 gap-y-1">
                      <span>Comm: {resItem.score?.communication ?? 0}%</span>
                      <span>|</span>
                      <span>Conf: {resItem.score?.confidence ?? 0}%</span>
                      <span>|</span>
                      <span>Rel: {resItem.score?.relevance ?? 0}%</span>
                      <span>|</span>
                      <span>Tech: {resItem.score?.technicalKnowledge ?? 0}%</span>
                      <span>|</span>
                      <span>Crit: {resItem.score?.problemSolving ?? 0}%</span>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm font-black text-[#14B8A6] italic leading-relaxed">
                    Q: "{resItem.questionText}"
                  </p>
                  
                  <div className="pt-2 leading-relaxed text-xs space-y-3">
                    <div className="text-slate-350 text-xs leading-relaxed font-semibold">
                      <strong className="text-white block mb-1 font-mono uppercase text-[10px] text-slate-500">Candidate Spoken response:</strong>
                      <span className="italic block pl-3 border-l-2 border-slate-800 text-slate-200">"{resItem.candidateResponse || "[No audible response captured]"}"</span>
                    </div>

                    {resItem.feedback && (
                      <div className="p-3.5 border border-[#14B8A6]/15 rounded-2xl bg-[#14B8A6]/5 text-slate-300 text-xs leading-relaxed font-semibold">
                        <strong className="text-[#14B8A6] font-mono font-bold uppercase block tracking-wider text-[9px] mb-1.5">// DYNAMIC FEEDBACK EVALUATION:</strong>
                        {resItem.feedback}
                      </div>
                    )}

                    {(resItem.improvementSuggestions || resItem.feedback) && (() => {
                      const textToRead = resItem.improvementSuggestions || "Keep practicing using quantifiable metrics and the STAR method to state clearly how you engineered actions.";
                      const isItemSpeaking = activeText === textToRead;
                      return (
                        <div className={`p-3.5 border rounded-2xl text-slate-300 text-xs leading-relaxed font-semibold transition-all relative ${
                          isItemSpeaking 
                            ? "bg-[#14B8A6]/10 border-[#14B8A6]/30 text-white" 
                            : "bg-indigo-950/15 border-indigo-950/45 text-slate-300"
                        }`}>
                          <div className="flex justify-between items-center mb-1.5">
                            <strong className="text-indigo-400 font-mono font-bold uppercase block tracking-wider text-[9px]">
                              // TARGET IMPROVEMENT SUGGESTIONS:
                            </strong>
                            
                            <button
                              onClick={() => handleSpeak(textToRead)}
                              className={`p-1 px-2.5 rounded-lg border text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                isItemSpeaking
                                  ? "bg-[#A3FF3C]/20 border-[#A3FF3C]/30 text-[#A3FF3C]"
                                  : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
                              }`}
                            >
                              {isItemSpeaking && !isPaused ? (
                                <>
                                  <Pause className="w-2.5 h-2.5 animate-pulse" />
                                  <span>Now Reading</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-2.5 h-2.5" />
                                  <span>Speak Critique</span>
                                </>
                              )}
                            </button>
                          </div>
                          <span className="block italic">{textToRead}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
