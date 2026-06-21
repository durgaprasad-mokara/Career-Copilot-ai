/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  getFallbackAnalysis,
  getFallbackAtsResume,
  getFallbackCoverLetter,
  getFallbackInterviewPrep,
  getFallbackEvaluation,
  getFallbackConsolidatedFeedback,
  getFallbackContextTips
} from "./src/utils/fallbacks";

dotenv.config();

function logFallbackWarning(context: string, error: any) {
  const errMsg = error?.message || (typeof error === "object" ? JSON.stringify(error) : String(error));
  if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota")) {
    console.log(`[Graceful Fallback API] Optimal local fallback activated for ${context} due to active API rate-limits.`);
  } else {
    console.log(`[Graceful Fallback API] ${context} resolved using local fallback engine.`);
  }
}

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json({ limit: "15mb" }));

// Lazy init Gemini SDK
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("[Warning] GEMINI_API_KEY is not defined in environments.");
    }
    ai = new GoogleGenAI({ 
      apiKey: key || "PLACEHOLDER_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return ai;
}

// Helper to query Gemini with JSON response requirement
async function askGeminiJSON(prompt: string, systemInstruction?: string) {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: systemInstruction || "You are an elite talent acquisition expert, senior career coach, and ATS parser. Output ONLY valid pure JSON conforming exactly to requested schemas.",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response received from AI model");
  }
  return JSON.parse(text);
}

// 1. Resume & JD Match Analysis endpoint
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing resume content or job description payload" });
    }

    const prompt = `
      [ROLE]
      You are an elite Applicant Tracking System (ATS) matching algorithm engineer, senior corporate headhunter, and expert resume auditor.

      [TASK]
      Analyze the candidate's resume and perform a thorough comparative audit against the provided target job description. 
      Estimate separate quantitative scores:
      1. Role Match Score (measures human/strategic alignment, project scope matching, and direct experience correlation)
      2. ATS Scan Score (measures keyword optimization density, standardized naming structures, and parser compatibility)
      Identify missing critical skills, absent keywords, specific tenure/experience gaps, and certifications. Suggest 3-5 immediate actionable formatting changes and 3-5 high-altitude career strategic adjustments.

      [INPUTS]
      <candidate_resume_text>
      """
      ${resumeText}
      """
      </candidate_resume_text>

      <target_job_description>
      """
      ${jobDescription}
      """
      </target_job_description>

      [OUTPUT_INSTRUCTIONS]
      Your output MUST conform exactly to the following JSON schema. Do not include markdown headers or extra conversational text outside of the JSON object.
      {
        "matchScore": 75, // Integer from 0 to 100 measuring true structural alignment
        "atsScore": 82, // Integer from 0 to 100 measuring search keyword optimization density
        "matchingSkills": ["Skill A", "Skill B"], // List of skills mentioned in both places
        "missingSkills": ["React 19", "Express Router"], // Hard skills mentioned in Job Description but absent in Resume
        "missingKeywords": ["Scale-to-zero", "Vite Config"], // High-value ATS search phrases from the JD that are missing
        "experienceGap": "High-fidelity analysis of candidate tenure, seniority, leadership requirements, and team-complexity vs target role expectations.",
        "educationGap": "Detailed audit of degree requirements, certifications, or regulatory credential deficits.",
        "strengthPoints": ["Strengths mentioned with specific focus, e.g., Extensive enterprise cloud database migrations"],
        "weaknessPoints": ["Critique of why the current bullet points lack quantifiable measures or fall short in architectural complexity"],
        "actionableFormattingTips": ["Formatting tip 1", "Formatting tip 2"], // Simple layout updates (e.g. standardizing fonts)
        "recommendations": ["Recommendation 1", "Recommendation 2"] // Strategic adjustments (e.g. rewriting senior titles or taking certifications)
      }
    `;

    const result = await askGeminiJSON(
      prompt,
      "You are a rigorous, highly-experienced chief talent scout and corporate ATS engineer. Evaluate precisely and provide candid, highly detailed assessments. Do not sugarcoat flaws."
    );
    res.json(result);
  } catch (error: any) {
    logFallbackWarning("AI Analysis error", error);
    try {
      const fallbackResult = getFallbackAnalysis(req.body.resumeText || "", req.body.jobDescription || "");
      res.json(fallbackResult);
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || "Failed to analyze resume match" });
    }
  }
});

// 2. ATS Resume Builder endpoint
app.post("/api/generate-ats-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "Missing resume text" });
    }

    const prompt = `
      [ROLE]
      You are an elite, Certified Master Resume Writer (CMRW) and principal design expert on Applicant Tracking Systems (ATS) parsing rules.

      [TASK]
      Optimize the candidate's core resume details to be fully search-friendly, parsing-compatible, and highly persuasive.
       
      [RULES]
      1. CRITICAL: Do NOT invent fictional companies, dates, universities, or achievements. Translate the real experience into a superior design format.
      2. BULLET OPTIMIZATION FORMULA: Every generated work experience bullet point MUST adhere strictly to the **STAR Approach with Quantitative Multi-Metrics**:
         [Impact Verb] + [Engineered Actions/Situation/Tools] + [Verifiable Numeric Metric: %, $, Saved Hours, scaled metrics].
         - Bad: "Helped clean up database and make queries faster."
         - Good: "Orchestrated PostgreSQL engine indexing overhaul across 4 major high-write microservices, resulting in a 42% reduction in query latencies and saving $14K in monthly hosting overhead."
      3. Incorporate missing search keywords naturally so they pass automated scanner indexes.

      [INPUTS]
      <candidate_current_resume>
      """
      ${resumeText}
      """
      </candidate_current_resume>

      <target_job_description_context>
      """
      ${jobDescription || "Standard senior industry requirements"}
      """
      </target_job_description_context>

      [OUTPUT_INSTRUCTIONS]
      Your output MUST conform exactly to the following JSON schema:
      {
        "fullName": "Full Student or Professional Name",
        "email": "Email address",
        "phone": "Phone contact",
        "linkedin": "LinkedIn profile URL or empty string",
        "portfolio": "Portfolio or GitHub URL or empty string",
        "summary": "Cohesive, high-impact professional narrative anchoring candidate specialization to target job description demands.",
        "skills": {
          "technical": ["Skill 1", "Skill 2"], // Programming languages, databases, architectural systems, frameworks
          "soft": ["Skill A", "Skill B"] // Key collaborative and professional abilities
        },
        "experience": [
          {
            "company": "Company Name",
            "role": "Optimized, accurate role title",
            "location": "City, ST or Remote",
            "startDate": "Month Year",
            "endDate": "Month Year or Present",
            "bulletPoints": [
              "Bullet point 1 using STAR + metrics + high impact action verb",
              "Bullet point 2 using STAR + metrics + high impact action verb"
            ]
          }
        ],
        "education": [
          {
            "institution": "University / College",
            "degree": "E.g., Bachelor of Science in Computer Science",
            "location": "City, State",
            "graduationYear": "Year"
          }
        ],
        "projects": [
          {
            "name": "Project Title",
            "description": "Short explanation showcasing architecture, technologies, and measurable outcomes.",
            "techStack": ["React", "TypeScript", "Vite"]
          }
        ]
      }
    `;

    const result = await askGeminiJSON(
      prompt,
      "You are a master professional resume designer. Write crisp, punchy, achievements-oriented bullets using strong action verbs and quantitative metrics. Avoid buzzwords and empty fluff."
    );
    res.json(result);
  } catch (error: any) {
    logFallbackWarning("ATS Resume Builder error", error);
    try {
      const fallbackResult = getFallbackAtsResume(req.body.resumeText || "", req.body.jobDescription || "");
      res.json(fallbackResult);
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || "Failed to generate optimized resume" });
    }
  }
});

// 3. Cover Letter Generator endpoint
app.post("/api/generate-cover-letter", async (req, res) => {
  try {
    const { resumeText, jobTitle, companyName, jobDescription } = req.body;
    if (!resumeText || !jobTitle || !companyName) {
      return res.status(400).json({ error: "Requires candidate resume text, target job title, and company name" });
    }

    const prompt = `
      [ROLE]
      You are an elite, senior persuasive copywriter and career storytelling consultant.

      [TASK]
      Draft a highly tailored, compelling cover letter from the candidate to the hiring manager at '${companyName}' for the role of '${jobTitle}'.
      
      [STRATEGY]
      1. HOOK: Create a mature, custom hook stating immediate interest without cliches.
      2. COMPANY-SPECIFIC CONTENT: Research (or simulate based on industry patterns) '${companyName}'s current status, product lineup, or culture, and state why the candidate aligns with these values.
      3. ROLE-SPECIFIC CONTENT: Interweave 1-2 powerful, real achievements and metrics from the candidate's resume that address the challenges '${companyName}' is solving in this domain.
      4. TONE: Confident, polished, mature, authentic, and professionally warm. No robotic hyperbole or empty fluff.

      [INPUTS]
      <candidate_resume_dataset>
      """
      ${resumeText}
      """
      </candidate_resume_dataset>

      <job_description_context>
      """
      ${jobDescription || ""}
      """
      </job_description_context>

      [OUTPUT_INSTRUCTIONS]
      Your output MUST be a JSON object containing the letter content. Use \\n for paragraph spacing inside the string. Keep text professional and clean.
      {
        "letterContent": "Dear Hiring Manager,\\n\\n[Paragraph 1: Compelling hook + role alignment]\\n\\n[Paragraph 2: Deep technical match showcasing 1-2 quantifiable projects from resume]\\n\\n[Paragraph 3: Company-Specific alignment with '${companyName}' goals and culture]\\n\\n[Paragraph 4: Call to action, formal availability, and signature]\\n\\nSincerely,\\n[Candidate Name]"
      }
    `;

    const result = await askGeminiJSON(
      prompt,
      "You are an executive business writer. Deliver a cover letter that reads like a human authored it with deep intentionality and pride. Never sound boilerplate."
    );
    res.json(result);
  } catch (error: any) {
    logFallbackWarning("Cover Letter error", error);
    try {
      const fallbackResult = getFallbackCoverLetter(
        req.body.resumeText || "",
        req.body.jobTitle || "",
        req.body.companyName || "",
        req.body.jobDescription || ""
      );
      res.json(fallbackResult);
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || "Failed to generate cover letter" });
    }
  }
});

// 4. Generate Interview Questions endpoint
app.post("/api/generate-interview-prep", async (req, res) => {
  try {
    const { resumeText, jobDescription, jobTitle, companyName } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Context resume text and job description are necessary" });
    }

    const prompt = `
      [ROLE]
      You are a Chief Technology Officer (CTO) and VP of Human Capital at a major global enterprise.

      [TASK]
      Create exactly 7 highly relevant, deeply diagnostic interview questions tailored for a candidate interviewing for the '${jobTitle || "Target Role"}' role at '${companyName || "Target Company"}'.

      [QUESTION PROFILE DISTRIBUTION]
      You MUST formulate exactly 7 questions—one question for each of the following 7 categories:
      - 'introduction': Warm startup question mapping their career highlights or background summary to the role.
      - 'technical': Targeted technical query about frameworks, architectural system patterns, memory constraints, or language specifics from the job description.
      - 'behavioral': Challenging behavioral scenario seeking a past breakdown of teamwork, conflict, or high-urgency milestone execution under structural constraints.
      - 'problem-solving': Analytical hypothetical challenge checking logical troubleshooting, system diagnostic capability, or code optimization trade-offs under scale.
      - 'projects': Deep architectural inspection of any prominent project mentioned in the candidate's resume, asking why they chose that specific design or how they ran its delivery.
      - 'leadership': Question on mentoring, guiding peer developers, handling task delegation disputes, or influencing technical direction without direct authority.
      - 'domain-knowledge': Industry-specific challenge examining standards, practices, security posture, compliance patterns, or business-domain acumen.

      [INPUTS]
      <candidate_resume>
      """
      ${resumeText}
      """
      </candidate_resume>

      <target_job_description>
      """
      ${jobDescription}
      """
      </target_job_description>

      [OUTPUT_INSTRUCTIONS]
      Your output MUST match this exact JSON schema:
      {
        "questions": [
          {
            "id": "q1",
            "question": "Full formulation of the question.",
            "type": "introduction", // Must be exactly one of: 'introduction', 'technical', 'behavioral', 'problem-solving', 'projects', 'leadership', 'domain-knowledge'
            "contextTip": "Explicit guide on what the hiring committee expects, which core competencies are being tested, and potential traps to avoid.",
            "idealKeywords": ["term1", "term2", "term3"] // Critical keywords standard to a top-tier answer
          }
        ]
      }
    `;

    const result = await askGeminiJSON(
      prompt,
      "You are a seasoned hiring manager who asks highly analytical, tailored questions checking actual experience. Throw out generic, trivia questions."
    );
    res.json(result);
  } catch (error: any) {
    logFallbackWarning("Interview questions error", error);
    try {
      const fallbackResult = getFallbackInterviewPrep(
        req.body.resumeText || "",
        req.body.jobDescription || "",
        req.body.jobTitle || "",
        req.body.companyName || ""
      );
      res.json(fallbackResult);
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || "Failed to generate interview questions" });
    }
  }
});

// 5. Evaluate Interview Response endpoint (Micro-eval for voice loop)
app.post("/api/evaluate-interview-response", async (req, res) => {
  try {
    const { question, candidateResponse, idealKeywords } = req.body;
    if (!question || !candidateResponse) {
      return res.status(400).json({ error: "Question and candidate's response are required" });
    }

    const prompt = `
      [ROLE]
      You are an expert technical interviewer, speech coach, and professional leadership evaluator.

      [TASK]
      Evaluate the candidate's spoken answer to the following interview question. Estimate performance indicators across 5 rigorous diagnostic matrices:
      1. Communication: Rate 0 to 100 on narrative progression, structured pacing, avoidance of filler words, and professional clarity.
      2. Confidence: Rate 0 to 100 on tone assertiveness, conviction, directness of delivery, and absence of apologetic hedging.
      3. Relevance: Rate 0 to 100 on how directly the candidate answers the exact query without trailing off or rambling.
      4. Technical Knowledge: Rate 0 to 100 on correctness of factual, conceptual, or domain/architectural frameworks mentioned.
      5. Problem Solving: Rate 0 to 100 on structured critical thinking, trade-offs assessment, and application of systematic STAR approach (Situation, Task, Action, Result).

      [INPUTS]
      <assessed_question>
      "${question}"
      </assessed_question>

      <ideal_keywords>
      ${JSON.stringify(idealKeywords || [])}
      </ideal_keywords>

      <candidate_answer_transcript>
      "${candidateResponse}"
      </candidate_answer_transcript>

      [OUTPUT_INSTRUCTIONS]
      Your output MUST be a JSON object returning the EXACT scores and constructive evaluation:
      {
        "score": {
          "communication": 85, // Integer from 0 to 100
          "confidence": 80, // Integer from 0 to 100
          "relevance": 90, // Integer from 0 to 100
          "technicalKnowledge": 75, // Integer from 0 to 100
          "problemSolving": 88 // Integer from 0 to 100
        },
        "feedback": "Deep, structured evaluation highlighting candidate strength in STAR progression, structure, and keyword overlap.",
        "improvementSuggestions": "Actionable, clear suggestions on how they could structure the explanation better, introduce missing keywords, or elevate pacing."
      }
    `;

    const result = await askGeminiJSON(
      prompt,
      "You are a strict, helpful mock interviewer. Check for real conversational competence, technical depth, and actionable communication advice."
    );
    res.json(result);
  } catch (error: any) {
    logFallbackWarning("Response evaluation error", error);
    try {
      const fallbackResult = getFallbackEvaluation(
        req.body.question || "",
        req.body.candidateResponse || "",
        req.body.idealKeywords || []
      );
      res.json(fallbackResult);
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || "Failed to evaluate response" });
    }
  }
});

// 6. Generate final consolidated interview feedback
app.post("/api/generate-final-interview-feedback", async (req, res) => {
  try {
    const { jobTitle, companyName, QAHistory } = req.body;
    if (!QAHistory || !Array.isArray(QAHistory) || QAHistory.length === 0) {
      return res.status(400).json({ error: "Missing interview QA transcripts history list" });
    }

    const prompt = `
      [ROLE]
      You are the Chairman of the Executive Talent Board and Senior Recruiter.

      [TASK]
      Synthesize a final, corporate-ready interview performance report checking the user's progression throughout their simulation interview.

      [INPUTS]
      <target_specs>
      Job: ${jobTitle || "Target Role"}
      Company: ${companyName || "Target Company"}
      </target_specs>

      <candidate_interview_history>
      ${JSON.stringify(QAHistory, null, 2)}
      </candidate_interview_history>

      [TASK INSTRUCTIONS]
      - Synthesize an overall average across all question scores for each of our 5 metrics: Communication, Confidence, Relevance, Technical Knowledge, and Problem Solving.
      - Extract specific behavioral patterns, strengths, technical gaps, and communication bottlenecks.
      - Choose a realistic corporate hiring recommendation.
      - Provide a prioritized dashboard checklist of corporate ready action next steps.

      [OUTPUT_INSTRUCTIONS]
      Your output MUST be a JSON object matching this exact schema:
      {
        "overallScore": {
          "communication": 82, // Average Communication score (0 to 100)
          "confidence": 80, // Average Confidence score (0 to 100)
          "relevance": 85, // Average Relevance score (0 to 100)
          "technicalKnowledge": 78, // Average Technical Knowledge score (0 to 100)
          "problemSolving": 80, // Average Problem Solving score (0 to 100)
          "composite": 81 // Weighted composite rating (0 to 100)
        },
        "overallFeedback": {
          "strengths": ["Strategic strength 1", "Strategic strength 2"],
          "weaknesses": ["Targeted gap or hesitation pattern 1", "Targeted gap or hesitation pattern 2"],
          "actionableSuggestions": ["Actionable next step checklist 1", "Actionable next step checklist 2", "Actionable next step checklist 3"],
          "hiringRecommendation": "Strong Hire" // MUST be exactly one of: 'Strong Hire', 'Hire', 'Review Needed', 'No Hire'
        }
      }
    `;

    const result = await askGeminiJSON(
      prompt,
      "You are a professional hiring board chairman. Provide detailed summaries and highly diagnostic suggestions to turn weaknesses into hireable strengths."
    );
    res.json(result);
  } catch (error: any) {
    logFallbackWarning("Consolidated feedback error", error);
    try {
      const fallbackResult = getFallbackConsolidatedFeedback(
        req.body.jobTitle || "",
        req.body.companyName || "",
        req.body.QAHistory || []
      );
      res.json(fallbackResult);
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || "Failed to compile corporate executive feedback report" });
    }
  }
});

// 7. Dynamic Context-Aware Pro-Tips Generator
app.post("/api/generate-context-tips", async (req, res) => {
  try {
    const { questionText, questionType, jobTitle, companyName } = req.body;
    if (!questionText) {
      return res.status(400).json({ error: "questionText is required" });
    }

    const prompt = `
      [ROLE]
      You are an elite talent coach, leading technical interview trainer, and professional public speaking expert.

      [TASK]
      Create personalized, context-aware "Pro-Tips" for a candidate trying to answer the following interview question.
      The candidate is interviewing for the role of '${jobTitle || "Software Engineer"}' at '${companyName || "Target Company"}'.

      [CONTEXT]
      Question Type: '${questionType || "general"}'
      Question Text: "${questionText}"

      [OUTPUT SCHEMA]
      You MUST return a JSON object representing structured advice for this exact question. It must match this schema exactly:
      {
        "title": "A short, engaging title specifically for this scenario (max 5-6 words), e.g., 'Mastering the STAR Core for Scaling' or 'Navigating High Latency Scenarios'",
        "focus": "A highly precise, single sentence coaching focus explaining what the interviewer is hunting for in this specific question.",
        "pacing": "Custom advice on tone, voice, and pacing (e.g. slow, deliberate, pause points, emphasis indices) specifically matching this topic.",
        "framework": "A custom step-by-step ANSWERING SCAFFOLD structure (arrow separated, e.g. Present -> Past -> Future or Situation -> Code Isolation -> Latency Metric) engineered for this precise question.",
        "confidenceBooster": "A short, motivational, bulletproof booster that validates the candidate's capability on this specific topic.",
        "powerWords": ["word1/phrase1", "word2/phrase2", "word3/phrase3", "word4/phrase4", "word5/phrase5"], // Exactly 5 high-impact vocabulary words or industry terms that would make an answer stand out
        "pitfalls": ["A critical verbal pitfall to avoid in this scenario", "Another common trap specific to this topic"] // Exactly 2 custom pitfalls
      }

      Output ONLY valid JSON matching this schema exactly. Do not wrap in markdown blocks, just return raw JSON text.
    `;

    const result = await askGeminiJSON(
      prompt,
      "You are an expert speech coach and tech recruiter. Output ONLY a valid JSON conforming exactly to the requested scheme."
    );
    res.json(result);
  } catch (error: any) {
    logFallbackWarning("Context tips generation error", error);
    try {
      const fallbackResult = getFallbackContextTips(
        req.body.questionText || "",
        req.body.questionType || "",
        req.body.jobTitle || "",
        req.body.companyName || ""
      );
      res.json(fallbackResult);
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || "Failed to generate context-aware tips" });
    }
  }
});



// Vite middleware for client-side routing & hot-loading in development
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Career Copilot Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error("Critical server boot error:", err);
});
