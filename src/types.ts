/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface ResumeData {
  id: string;
  userId: string;
  fileName: string;
  extractedText: string;
  createdAt: string;
  parsedProfile?: {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    experience: Array<{
      company: string;
      role: string;
      startDate: string;
      endDate: string;
      description: string[];
    }>;
    education: Array<{
      institution: string;
      degree: string;
      graduationYear: string;
    }>;
  };
}

export interface JobDescriptionData {
  id: string;
  userId: string;
  title: string;
  companyName: string;
  text: string;
  createdAt: string;
}

export interface AnalysisResult {
  id: string;
  userId: string;
  resumeId: string;
  jobId: string;
  matchScore: number;
  atsScore?: number;
  matchingSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  experienceGap: string;
  educationGap: string;
  strengthPoints: string[];
  weaknessPoints: string[];
  actionableFormattingTips: string[];
  recommendations?: string[];
  createdAt: string;
  _isFallback?: boolean;
}

export interface ATSResume {
  id: string;
  userId: string;
  resumeId: string;
  optimizedContent: {
    fullName: string;
    email: string;
    phone: string;
    linkedin?: string;
    portfolio?: string;
    summary: string;
    skills: {
      technical: string[];
      soft: string[];
    };
    experience: Array<{
      company: string;
      role: string;
      location: string;
      startDate: string;
      endDate: string;
      bulletPoints: string[];
    }>;
    education: Array<{
      institution: string;
      degree: string;
      location: string;
      graduationYear: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
      techStack: string[];
    }>;
    _isFallback?: boolean;
  };
  createdAt: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  resumeId: string;
  companyName: string;
  jobTitle: string;
  letterContent: string;
  createdAt: string;
  _isFallback?: boolean;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'introduction' | 'technical' | 'behavioral' | 'problem-solving' | 'projects' | 'leadership' | 'domain-knowledge';
  contextTip: string;
  idealKeywords: string[];
}

export interface InterviewAttempt {
  id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  questions: InterviewQuestion[];
  responses: Array<{
    questionId: string;
    questionText: string;
    candidateResponse: string;
    audioDurationSec?: number;
    score?: {
      communication: number; // Communication
      confidence: number; // Confidence
      relevance: number; // Relevance
      technicalKnowledge: number; // Technical Knowledge
      problemSolving: number; // Problem Solving
    };
    feedback?: string;
    improvementSuggestions?: string;
  }>;
  currentQuestionIndex: number;
  isCompleted: boolean;
  overallScore?: {
    communication: number;
    confidence: number;
    relevance: number;
    technicalKnowledge: number;
    problemSolving: number;
    composite: number;
  };
  overallFeedback?: {
    strengths: string[];
    weaknesses: string[];
    actionableSuggestions: string[];
    hiringRecommendation: 'Hire' | 'Strong Hire' | 'Review Needed' | 'No Hire';
  };
  createdAt: string;
  _isFallback?: boolean;
}
