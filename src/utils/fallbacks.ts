/**
 * Dynamic Context-Aware Fallback Generators
 * Designed to provide highly realistic and structurally conforming data
 * in the event of Gemini API quota limit (429) or other request issues.
 */

// Helper to extract a job title or company name from inputs
function cleanInputString(input: string, fallback: string): string {
  if (!input) return fallback;
  const cleaned = input.replace(/[\\"']/g, '').trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

// Simple heuristic keyword extractor
function extractPotentialKeywords(text: string): string[] {
  if (!text) return [];
  const words = text.match(/[A-Z][a-zA-Z0-9+#]+/g) || [];
  const uniqueWords = Array.from(new Set(words))
    .filter(w => w.length > 2 && w.length < 15 && !["The", "And", "For", "This", "With", "That", "From"].includes(w));
  return uniqueWords.slice(0, 8);
}

// 1. Fallback for Resume & Job Match Analysis
export function getFallbackAnalysis(resumeText: string, jobDescription: string) {
  const keywords = extractPotentialKeywords(jobDescription);
  const matched = keywords.slice(0, Math.min(keywords.length, 3));
  const missing = keywords.filter(k => !matched.includes(k)).slice(0, 4);
  
  const skills = matched.length > 0 ? matched : ["TypeScript", "React", "REST APIs"];
  const missingSkills = missing.length > 0 ? missing : ["CI/CD pipelines", "System Architecture", "GraphQL Query Tuning"];
  const missingKeywords = missingSkills.map(s => `${s} Implementation`);

  return {
    _isFallback: true,
    matchScore: 78,
    atsScore: 74,
    matchingSkills: skills,
    missingSkills: missingSkills,
    missingKeywords: missingKeywords,
    experienceGap: "Candidate exhibits excellent core technical delivery but lacks explicit coverage of architectural ownership and large-scale deployment orchestration requested in the JD description.",
    educationGap: "No severe institutional credentials deficit detected, though alignment can be strengthened with cloud-provider professional certifications.",
    strengthPoints: [
      "Demonstrates solid execution in feature level implementation and source code health patterns.",
      "Hands-on expertise utilizing modern front-end layout configurations and structured schemas."
    ],
    weaknessPoints: [
      "Bullet points currently skew heavily toward descriptive task list reporting instead of quantifying specific engineering scale.",
      "Absence of metrics detailing direct application performance improvements, cloud savings, or team development velocity."
    ],
    actionableFormattingTips: [
      "Standardize font-hierarchy sizes across section titles to ensure visual consistency for ATS parsers.",
      "Transition work histories strictly into a clean chronological list using bulleted entries.",
      "Ensure phone numbers and profile links are placed in the header zone without being embedded inside styling frames."
    ],
    recommendations: [
      "Reformulate technical bullet points utilizing the STAR formula combined with quantifiable numbers.",
      "Integrate missing system engineering buzzwords naturally into your skills section.",
      "Emphasize technical leadership, mentoring, or architecture definition to align with the seniority criteria."
    ]
  };
}

// 2. Fallback for ATS Resume Builder
export function getFallbackAtsResume(resumeText: string, jobDescription: string) {
  return {
    _isFallback: true,
    fullName: "Alex Rivera",
    email: "alex.rivera@careermail.com",
    phone: "+1 (555) 342-9081",
    linkedin: "linkedin.com/in/alex-rivera-dev",
    portfolio: "github.com/alex-rivera-dev",
    summary: "Accomplished systems engineer with hands-on experience designing, optimization, and scaling responsive distributed applications. Specialized in TypeScript, enterprise React components, and cloud runtime engines. Outlined proven track record of elevating application load speed, automating deployment pipelines, and collaborating with cross-functional talent.",
    skills: {
      technical: ["TypeScript", "React 18", "Express.js", "PostgreSQL", "Tailwind CSS", "RESTful APIs", "Docker", "Git/GitLab"],
      soft: ["Behavioral Dialogue", "Technical Mentorship", "Interactive Prototyping", "Agile Standups"]
    },
    experience: [
      {
        company: "Apex Tech Cloud Services",
        role: "Senior Full-Stack Engineer",
        location: "San Francisco, CA (Remote)",
        startDate: "Jan 2024",
        endDate: "Present",
        bulletPoints: [
          "Spearheaded database query optimization project, implementing efficient indexing on PostgreSQL target nodes, reducing slow queries by 34% and cutting API response times from 340ms to 210ms.",
          "Orchestrated responsive portal layouts with micro-interaction states, boosting user retention metrics by 18% and decreasing initial bundle size by 450KB through lazy loading and code splitting.",
          "Fostered collaborative engineering practices, conducting constructive source code reviews and aligning junior personnel on standard TypeScript rules to decrease regression incidents by 15%."
        ]
      },
      {
        company: "Stellar Core Labs",
        role: "Software Developer",
        location: "Boston, MA",
        startDate: "Mar 2022",
        endDate: "Dec 2023",
        bulletPoints: [
          "Developed and launched 8 major dashboard features using React and Tailwind CSS, increasing platform engagement indicators by 24% over a 6-month product cycle.",
          "Created automated containerized workflows with custom Docker environments, streamlining internal local setups and saving an estimated 5 developer-hours per week."
        ]
      }
    ],
    education: [
      {
        institution: "State University of Technology",
        degree: "Bachelor of Science in Computer Science",
        location: "Austin, TX",
        graduationYear: "2021"
      }
    ],
    projects: [
      {
        name: "Enterprise Inventory Portal",
        description: "Engineered scalable real-time inventory management dashboard with state synchronization and custom canvas rendering systems, improving processing capacity by 50%.",
        techStack: ["React", "TypeScript", "D3.js", "Vite"]
      }
    ]
  };
}

// 3. Fallback for Cover Letter Generator
export function getFallbackCoverLetter(resumeText: string, jobTitle: string, companyName: string, jobDescription: string) {
  const company = cleanInputString(companyName, "Your Company");
  const job = cleanInputString(jobTitle, "Software Engineer");

  return {
    _isFallback: true,
    letterContent: `Dear Hiring Manager,

I am writing to express my enthusiasm for the ${job} position at ${company}. Having reviewed your current product objectives and operational scale, I am incredibly excited about the alignment between your engineering puzzles and my record of constructing scalable, performant systems.

In my recent roles, I have focused heavily on elevating core product stability and engineering metrics. For example, I recently led a systems indexing optimization that successfully improved API latency profiles by 34% and lowered monthly server overhead costs. I approach design with the same focus on user-centric layouts and high-fidelity interfaces that ${company} is known for.

What draws me specifically to ${company} is your commitment to technical craftsmanship and your progressive technology stack. I thrive in collaborative environments where performance, accessibility, and clean abstractions are native standards rather than afterthoughts. My toolkit—covering React, TypeScript, and modern backend architectures—equips me to build direct solutions for your team on day one.

Thank you for your time, consideration, and dedication to raising the bar for modern digital solutions. I am eager to share how my background in structural alignment can support your goals in this role. I look forward to our conversation.

Sincerely,
Alex Rivera`
  };
}

// 4. Fallback for Interview Questions Prep
export function getFallbackInterviewPrep(resumeText: string, jobDescription: string, jobTitle: string, companyName: string) {
  const company = cleanInputString(companyName, "Target Company");
  const job = cleanInputString(jobTitle, "Systems Architect");

  return {
    _isFallback: true,
    questions: [
      {
        id: "q1",
        question: `Could you walk us through your background and discuss what specifically inspired your decision to interview for the ${job} role at ${company}?`,
        type: "introduction",
        contextTip: "The committee is checking your career trajectory and looking for genuine alignment with their work ethics. Map your experience directly to their team structure.",
        idealKeywords: ["growth", "collaboration", "scaling", "problem-solving"]
      },
      {
        id: "q2",
        question: `How do you analyze and resolve runtime memory bottlenecks or slow API response rates in high-traffic TypeScript environments?`,
        type: "technical",
        contextTip: "They want to test your hands-on profile. Discuss garbage collection, CPU profile tracing, lazy imports, database index alignment, and query diagnostic tooling.",
        idealKeywords: ["indexing", "latency", "profiling", "caching", "query-optimization"]
      },
      {
        id: "q3",
        question: `Tell me about a challenging instance where you and a product designer or stakeholder held conflicting technical directions. How did you resolve the deadlock?`,
        type: "behavioral",
        contextTip: "This targets your cross-functional capability. Focus on active listening, quantitative compromise, quick prototyping, and putting customer value first.",
        idealKeywords: ["active-listening", "compromise", "user-metric", "STAR-framework"]
      },
      {
        id: "q4",
        question: `Imagine our live production database experiences a sudden spike in deadlocks due to competing write transactions. Detail your process to isolate and resolve this issue.`,
        type: "problem-solving",
        contextTip: "Isolate transaction levels, inspect lock durations, trace resource constraints, and discuss read replicas vs. optimistic locking paradigms.",
        idealKeywords: ["deadlocks", "isolation-levels", "read-replicas", "optimistic-concurrency"]
      },
      {
        id: "q5",
        question: `Select a primary technical project from your career that you are exceptionally proud of. What was its core architectural stack, and what would you design differently today?`,
        type: "projects",
        contextTip: "Demonstrate deep pride in your engineering decisions. Honestly critique your own abstractions, noting constraints like tight budgets or time-to-market trade-offs.",
        idealKeywords: ["components", "abstractions", "technical-debt", "monolithic-to-micro"]
      },
      {
        id: "q6",
        question: `As an engineer, how do you handle bringing standard, rigorous patterns to a legacy codebase without breaking existing business flows or frustrating colleagues?`,
        type: "leadership",
        contextTip: "They are tracking your influence map. Use incremental documentation, pair programming, and demonstration of quality benefits rather than imposing top-down mandates.",
        idealKeywords: ["documentation", "mentorship", "incremental-migration", "team-trust"]
      },
      {
        id: "q7",
        question: `In modern development, how do you ensure that security standards, CORS considerations, and user-privacy constraints are integrated into daily feature code?`,
        type: "domain-knowledge",
        contextTip: "Hiring committees expect mature compliance. Speak on encryption, secure storage, rate-limiting APIs, and protecting authorization tokens from browser leaks.",
        idealKeywords: ["authorization", "sanitization", "OWASP", "secret-management"]
      }
    ]
  };
}

// 5. Fallback for Single Response Evaluation
export function getFallbackEvaluation(question: string, candidateResponse: string, idealKeywords: string[]) {
  const wordCount = (candidateResponse || "").trim().split(/\s+/).length;
  
  let communication = 75;
  let confidence = 75;
  let relevance = 75;
  let technicalKnowledge = 75;
  let problemSolving = 75;

  if (wordCount > 50) {
    communication += 8;
    confidence += 5;
    relevance += 10;
    problemSolving += 10;
  }
  if (wordCount > 100) {
    technicalKnowledge += 10;
    confidence += 8;
  }
  if (wordCount < 10) {
    communication = 40;
    confidence = 50;
    relevance = 45;
    technicalKnowledge = 30;
    problemSolving = 30;
  }

  // Ensure bounds
  const limitValue = (val: number) => Math.min(100, Math.max(0, val));

  const finalCommunication = limitValue(communication);
  const finalConfidence = limitValue(confidence);
  const finalRelevance = limitValue(relevance);
  const finalTechnical = limitValue(technicalKnowledge);
  const finalProblem = limitValue(problemSolving);

  return {
    _isFallback: true,
    score: {
      communication: finalCommunication,
      confidence: finalConfidence,
      relevance: finalRelevance,
      technicalKnowledge: finalTechnical,
      problemSolving: finalProblem
    },
    feedback: "Your response covers the core elements of the question and details specific technical workflows. You avoided long hesitations and maintained high pacing consistency.",
    improvementSuggestions: "Incorporate more specific quantifiable metrics using the STAR structure. Stating clear numbers (e.g., 'scaled performance to save 12 hours of dev effort') will increase overall impact."
  };
}

// 6. Fallback for Final Consolidated Interview Report
export function getFallbackConsolidatedFeedback(jobTitle: string, companyName: string, QAHistory: any[]) {
  const company = cleanInputString(companyName, "Target Company");
  const job = cleanInputString(jobTitle, "Target Professional");

  let sumComm = 0, sumConf = 0, sumRel = 0, sumTech = 0, sumProb = 0;
  
  if (QAHistory && QAHistory.length > 0) {
    QAHistory.forEach(item => {
      const s = item.score || {};
      sumComm += s.communication || 78;
      sumConf += s.confidence || 75;
      sumRel += s.relevance || 80;
      sumTech += s.technicalKnowledge || 75;
      sumProb += s.problemSolving || 78;
    });
    const count = QAHistory.length;
    sumComm = Math.round(sumComm / count);
    sumConf = Math.round(sumConf / count);
    sumRel = Math.round(sumRel / count);
    sumTech = Math.round(sumTech / count);
    sumProb = Math.round(sumProb / count);
  } else {
    sumComm = 80; sumConf = 77; sumRel = 82; sumTech = 75; sumProb = 78;
  }

  const composite = Math.round((sumComm + sumConf + sumRel + sumTech + sumProb) / 5);
  let hiringRecommendation = "Hire";
  if (composite >= 85) hiringRecommendation = "Strong Hire";
  else if (composite < 65) hiringRecommendation = "Review Needed";

  return {
    _isFallback: true,
    overallScore: {
      communication: sumComm,
      confidence: sumConf,
      relevance: sumRel,
      technicalKnowledge: sumTech,
      problemSolving: sumProb,
      composite: composite
    },
    overallFeedback: {
      strengths: [
        "Consistent conceptual approach when describing architectural structures.",
        "Articulate sentence structures with minimal usage of corporate buzzwords.",
        "Coherent answers that map expectations accurately to practical milestones."
      ],
      weaknesses: [
        "Slightly generalized metrics, lacking exact project duration metrics.",
        "Minor pacing acceleration when responding to complex domain scenarios under pressure."
      ],
      actionableSuggestions: [
        "Incorporate a dedicated 'What I would do differently' section to show high design maturity.",
        "Pause for 2 seconds before answering complex queries to structure your thoughts using the STAR framework.",
        "Actively reference the specific tools, libraries, or diagnostic instruments you used to debug errors."
      ],
      hiringRecommendation: hiringRecommendation
    }
  };
}

// 7. Fallback for Context-Aware Speech Pro-Tips
export function getFallbackContextTips(questionText: string, questionType: string, jobTitle: string, companyName: string) {
  const cleanType = (questionType || "general").toLowerCase();

  const tipsMap: Record<string, any> = {
    introduction: {
      title: "Hooking with Authentic Career Transitions",
      focus: "The hiring manager is seeking to synthesize a coherent career narrative that directly anchors your goals to their current challenges.",
      pacing: "Moderate and enthusiastic. Begin with an open posture, maintain soft eye line breaks, and pause after transitions.",
      framework: "Present Success -> Past Transition Spark -> Future Value Anchor",
      confidenceBooster: "Your experience is valid. Think of yourself as a collaborator entering a technical design forum, not a supplier being audited.",
      powerWords: ["evolution", "strategic-focus", "scaling-goals", "collaborative-rhythm", "value-add"],
      pitfalls: [
        "Spending 10 minutes recounting chronological resume lines step-by-step.",
        "Vaguely stating you want the job only because the company is prestigious."
      ]
    },
    technical: {
      title: "Isolating Complexity & Architecture Prowess",
      focus: "Demonstrate structured isolation of technical constraints, trade-off tradeables, and hands-on system constraints.",
      pacing: "Deliberate, systematic, and slower. Use precise structural vocabulary and articulate file paths cleanly.",
      framework: "Identify Constraint -> Propose Alternative -> Isolate Specific Solution Node",
      confidenceBooster: "No developer knows everything. Emphasize your systematic research and problem-isolation methods.",
      powerWords: ["bottlenecks", "complexity", "lazy-loading", "memoization", "indexing"],
      pitfalls: [
        "Bluffing your way through a theoretical framework you haven't worked with.",
        "Suggesting massive, unrequested migrations as a cure for minor performance details."
      ]
    },
    behavioral: {
      title: "Unfolding Actions with High Strategic STARs",
      focus: "They are tracking your conflict resolution, cross-functional standard creation, and alignment vectors.",
      pacing: "Conversational, human, and objective. Avoid defensive phrasing; describe problems as structural conditions.",
      framework: "Context Specification -> Collaborative Action -> Dynamic Quantitative Result",
      confidenceBooster: "Halsey conflicts arise on every real development team. Resolving them positively proves senior leadership.",
      powerWords: ["alignment", "compromise", "retrospective", "empathy", "quantifiable"],
      pitfalls: [
        "Vaguely speaking about 'we' instead of highlighting your personal action.",
        "Portraying colleagues or designers in a critical or negative light."
      ]
    }
  };

  // Default fallback for any other question category
  const defaultTip = {
    title: "Structuring Persuasive System Responses",
    focus: "They are auditing your structural critical thinking and your ability to map solutions directly to user metrics.",
    pacing: "Sustained, structured, and collaborative. Emphasize key outcomes with clear pause breaks.",
    framework: "Scenario Brief -> Structural Execution -> High-Altitude Resolution",
    confidenceBooster: "Focus on your structured approach. A structured developer is always a hireable asset.",
    powerWords: ["architecture", "standardization", "collaboration", "quantified", "efficiency"],
    pitfalls: [
      "Going on long run-on sentences without structural pause breaks.",
      "Answering with generic dictionary definitions instead of active past experiences."
    ]
  };

  const chosenTip = tipsMap[cleanType] || defaultTip;
  return { ...chosenTip, _isFallback: true };
}
