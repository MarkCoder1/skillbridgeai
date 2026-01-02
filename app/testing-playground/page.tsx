"use client";

import { useState, useCallback } from "react";
import { Button, Card, Badge, ProgressBar } from "@/components/ui";

// =============================================================================
// INTERNAL TESTING PLAYGROUND
// =============================================================================
// PURPOSE: This page exists ONLY for internal validation of SkillBridge AI outputs.
// It is NOT user-facing and is designed to support validation claims for competition.
// =============================================================================

// Types for the testing playground
interface StudentProfile {
  grade: number;
  interests_free_text: string;
  interests_by_category: {
    academic: boolean;
    creative: boolean;
    social: boolean;
    technical: boolean;
    sports: boolean;
    music: boolean;
    business: boolean;
    health_wellness: boolean;
    other: boolean;
  };
  goals_selected: string[];
  goals_free_text: string;
  time_availability_hours_per_week: number;
  learning_preferences: string[];
  past_activities: string;
  past_achievements: string;
}

interface SkillSignal {
  evidence_found: boolean;
  evidence_phrases: string[];
  evidence_sources: string[];
  confidence: number;
  reasoning: string;
}

interface AIAnalysisResult {
  problem_solving: SkillSignal;
  communication: SkillSignal;
  technical_skills: SkillSignal;
  creativity: SkillSignal;
  leadership: SkillSignal;
  self_management: SkillSignal;
}

// Skill Gap Analysis Types
interface ActionableStep {
  step: string;
  time_required: string;
  expected_impact: string;
  priority: "high" | "medium" | "low";
  why: string;
}

interface SkillGapResult {
  skill: string;
  current_level: number;
  goal_level: number;
  gap: number;
  expected_level_after: number;
  timeline: string;
  why_it_matters: string;
  actionable_steps: ActionableStep[];
  reasoning: string;
}

interface SkillGapAnalysisResult {
  skill_gaps: SkillGapResult[];
  overall_summary: string;
  priority_skills: string[];
  total_weekly_time_recommended: string;
  skills_without_evidence?: {
    skill: string;
    display_name: string;
    goal_relevance: string;
    suggestion: string;
  }[];
}

// Personalized Recommendations Types
interface SkillAlignment {
  skill: string;
  expected_improvement: number;
}

interface BaseRecommendation {
  title: string;
  platform_or_provider: string;
  match_score: number;
  skill_alignment: SkillAlignment[];
  duration_weeks: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  reasoning: string;
}

interface CourseRecommendation extends BaseRecommendation {
  type: "course";
  format?: "online" | "in-person" | "hybrid";
}

interface ProjectRecommendation extends BaseRecommendation {
  type: "project";
  project_type?: "solo" | "team" | "open-source";
  skills_used?: string[];
}

interface CompetitionRecommendation extends BaseRecommendation {
  type: "competition";
  deadline?: string;
  prize?: string;
}

interface PersonalizedRecommendationsResult {
  courses: CourseRecommendation[];
  projects: ProjectRecommendation[];
  competitions: CompetitionRecommendation[];
  summary: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hallucinationFlags: string[];
}

interface TestRun {
  id: string;
  timestamp: Date;
  profile: StudentProfile;
  aiResult: AIAnalysisResult | null;
  validation: ValidationResult;
  matchesExpected: boolean | null; // null = not yet evaluated
  rawResponse: string;
}

interface SkillGapTestRun {
  id: string;
  timestamp: Date;
  skillSnapshot: AIAnalysisResult;
  studentContext: {
    grade: number;
    interests_free_text?: string;
    interests_categories?: string[];
    goals_selected: string[];
    goals_free_text?: string;
    time_availability_hours_per_week: number;
    learning_preferences?: string[];
  };
  result: SkillGapAnalysisResult | null;
  validation: ValidationResult;
  rawResponse: string;
}

interface RecommendationsTestRun {
  id: string;
  timestamp: Date;
  studentProfile: {
    grade: number;
    interests?: string;
    interest_categories?: string[];
    goals: string[];
    goals_free_text?: string;
    time_availability_hours_per_week: number;
    learning_preferences?: string[];
  };
  skillSnapshot: AIAnalysisResult;
  skillGapAnalysis?: {
    skill_gaps?: { skill: string; current_level: number; goal_level: number; gap: number }[];
    priority_skills?: string[];
    overall_summary?: string;
  };
  result: PersonalizedRecommendationsResult | null;
  validation: ValidationResult;
  rawResponse: string;
}

interface TestMetrics {
  totalProfilesTested: number;
  alignmentRatePercent: number;
  hallucinationCount: number;
  validOutputCount: number;
  invalidOutputCount: number;
}

// API Test Type
type APITestType = "intake" | "skill-gap" | "recommendations";

// Valid skills that our system supports
const VALID_SKILLS = [
  "problem_solving",
  "communication",
  "technical_skills",
  "creativity",
  "leadership",
  "self_management",
];

// Valid evidence sources
const VALID_SOURCES = ["interests", "goals", "past_activities", "achievements"];

// Default empty profile
const DEFAULT_PROFILE: StudentProfile = {
  grade: 10,
  interests_free_text: "",
  interests_by_category: {
    academic: false,
    creative: false,
    social: false,
    technical: false,
    sports: false,
    music: false,
    business: false,
    health_wellness: false,
    other: false,
  },
  goals_selected: [],
  goals_free_text: "",
  time_availability_hours_per_week: 5,
  learning_preferences: [],
  past_activities: "",
  past_achievements: "",
};

// Sample test profiles for quick testing
const SAMPLE_PROFILES: { name: string; profile: StudentProfile }[] = [
  {
    name: "STEM-Focused Student",
    profile: {
      grade: 11,
      interests_free_text: "I love coding, building robots, and participating in hackathons. I enjoy learning Python and JavaScript.",
      interests_by_category: {
        academic: true,
        creative: false,
        social: false,
        technical: true,
        sports: false,
        music: false,
        business: false,
        health_wellness: false,
        other: false,
      },
      goals_selected: ["coding", "stem", "college"],
      goals_free_text: "I want to become a software engineer and work at a tech company.",
      time_availability_hours_per_week: 10,
      learning_preferences: ["handson", "video"],
      past_activities: "I built a weather app using Python and APIs. I also led my school's robotics club and helped debug code for our competition robot.",
      past_achievements: "Won 2nd place at regional hackathon. Got state award for robotics.",
    },
  },
  {
    name: "Leadership-Focused Student",
    profile: {
      grade: 12,
      interests_free_text: "Public speaking, debate team, student government, and community service.",
      interests_by_category: {
        academic: true,
        creative: false,
        social: true,
        technical: false,
        sports: false,
        music: false,
        business: true,
        health_wellness: false,
        other: false,
      },
      goals_selected: ["leadership", "publicSpeaking", "networking"],
      goals_free_text: "I want to run for student body president and eventually pursue a career in politics or business.",
      time_availability_hours_per_week: 8,
      learning_preferences: ["group", "mentor"],
      past_activities: "I organized a charity fundraiser that raised $5000. I mentored younger students in debate club and led weekly practice sessions.",
      past_achievements: "Won best speaker at state debate competition. Elected class representative for 3 years.",
    },
  },
  {
    name: "Creative Student",
    profile: {
      grade: 10,
      interests_free_text: "Art, music production, graphic design, and creative writing.",
      interests_by_category: {
        academic: false,
        creative: true,
        social: false,
        technical: false,
        sports: false,
        music: true,
        business: false,
        health_wellness: false,
        other: false,
      },
      goals_selected: ["creativity", "writing"],
      goals_free_text: "I want to become a professional artist or work in the creative industry.",
      time_availability_hours_per_week: 6,
      learning_preferences: ["handson", "video"],
      past_activities: "I designed the school yearbook cover and created promotional posters for school events. I also compose music in my free time.",
      past_achievements: "Won the school art competition. My short story was published in the school magazine.",
    },
  },
  {
    name: "Minimal Evidence Student",
    profile: {
      grade: 9,
      interests_free_text: "I like playing video games and hanging out with friends.",
      interests_by_category: {
        academic: false,
        creative: false,
        social: true,
        technical: false,
        sports: false,
        music: false,
        business: false,
        health_wellness: false,
        other: true,
      },
      goals_selected: [],
      goals_free_text: "",
      time_availability_hours_per_week: 2,
      learning_preferences: ["video"],
      past_activities: "I sometimes help my friends with homework.",
      past_achievements: "",
    },
  },
  {
    name: "Athlete & Sports Leader",
    profile: {
      grade: 11,
      interests_free_text: "Basketball, track and field, fitness training, and sports psychology. I'm interested in how athletes train mentally and physically.",
      interests_by_category: {
        academic: false,
        creative: false,
        social: true,
        technical: false,
        sports: true,
        music: false,
        business: false,
        health_wellness: true,
        other: false,
      },
      goals_selected: ["leadership", "health", "college"],
      goals_free_text: "I want to get a basketball scholarship and eventually become a sports coach or physical therapist.",
      time_availability_hours_per_week: 6,
      learning_preferences: ["handson", "video", "mentor"],
      past_activities: "I'm the captain of the varsity basketball team. I organized summer training camps for younger players. I also volunteer at the community gym teaching basic fitness.",
      past_achievements: "Team MVP for 2 consecutive years. Led the team to regional championships. Certified in basic first aid and CPR.",
    },
  },
  {
    name: "Entrepreneur & Business Mind",
    profile: {
      grade: 12,
      interests_free_text: "Starting businesses, marketing, social media management, and financial literacy. I run a small reselling business online.",
      interests_by_category: {
        academic: false,
        creative: true,
        social: true,
        technical: true,
        sports: false,
        music: false,
        business: true,
        health_wellness: false,
        other: false,
      },
      goals_selected: ["entrepreneurship", "business", "networking", "leadership"],
      goals_free_text: "I want to start my own company before graduating college. Interested in e-commerce and digital marketing.",
      time_availability_hours_per_week: 12,
      learning_preferences: ["handson", "mentor", "reading"],
      past_activities: "Started a sneaker reselling business that made $3000 in profit. Managed social media for a local small business. Created a business club at school and organized guest speaker events.",
      past_achievements: "Won the school's young entrepreneur competition. Featured in local newspaper for my business. Grew Instagram account to 5000 followers for a client.",
    },
  },
  {
    name: "Science Researcher",
    profile: {
      grade: 11,
      interests_free_text: "Biology, chemistry, environmental science, and scientific research. I love conducting experiments and analyzing data.",
      interests_by_category: {
        academic: true,
        creative: false,
        social: false,
        technical: true,
        sports: false,
        music: false,
        business: false,
        health_wellness: true,
        other: false,
      },
      goals_selected: ["stem", "research", "college"],
      goals_free_text: "I want to become a research scientist, possibly in biotechnology or environmental science. PhD is my long-term goal.",
      time_availability_hours_per_week: 10,
      learning_preferences: ["reading", "handson", "mentor"],
      past_activities: "Conducted an independent research project on water quality in local streams. Participated in a summer research internship at a university lab. Member of Science Olympiad team focusing on biology events.",
      past_achievements: "Won 1st place in regional science fair. Published research summary in student science journal. Gold medal in Science Olympiad state competition.",
    },
  },
  {
    name: "Performing Arts Student",
    profile: {
      grade: 10,
      interests_free_text: "Theater, acting, singing, and dance. I love performing on stage and expressing emotions through art.",
      interests_by_category: {
        academic: false,
        creative: true,
        social: true,
        technical: false,
        sports: false,
        music: true,
        business: false,
        health_wellness: false,
        other: false,
      },
      goals_selected: ["creativity", "publicSpeaking", "networking"],
      goals_free_text: "I want to pursue performing arts in college and eventually work on Broadway or in film.",
      time_availability_hours_per_week: 8,
      learning_preferences: ["handson", "group", "mentor"],
      past_activities: "Lead roles in 3 school musicals. Took voice lessons for 5 years. Choreographed a dance routine for the school talent show. Participated in community theater productions.",
      past_achievements: "Best Actor award at regional theater festival. Selected for all-state choir. My dance performance went viral on TikTok with 100k views.",
    },
  },
  {
    name: "Healthcare Aspirant",
    profile: {
      grade: 12,
      interests_free_text: "Medicine, healthcare, volunteering at hospitals, and helping people. I'm fascinated by how the human body works.",
      interests_by_category: {
        academic: true,
        creative: false,
        social: true,
        technical: false,
        sports: false,
        music: false,
        business: false,
        health_wellness: true,
        other: false,
      },
      goals_selected: ["health", "college", "leadership"],
      goals_free_text: "I want to become a doctor, specifically a pediatrician or surgeon. Pre-med track in college is my plan.",
      time_availability_hours_per_week: 7,
      learning_preferences: ["reading", "handson", "mentor"],
      past_activities: "Volunteered 200+ hours at local hospital. Shadowed doctors in ER and pediatrics. Led the health awareness club and organized blood drives. Certified EMT.",
      past_achievements: "Received hospital volunteer of the year award. CPR and EMT certifications. 4.0 GPA in all science courses.",
    },
  },
  {
    name: "Gaming & Esports Enthusiast",
    profile: {
      grade: 10,
      interests_free_text: "Competitive gaming, game streaming, esports strategy, and game design. I spend hours analyzing game mechanics and improving my skills.",
      interests_by_category: {
        academic: false,
        creative: true,
        social: true,
        technical: true,
        sports: false,
        music: false,
        business: false,
        health_wellness: false,
        other: true,
      },
      goals_selected: ["coding", "creativity", "networking"],
      goals_free_text: "I want to either become a professional esports player or work in the gaming industry as a game designer or developer.",
      time_availability_hours_per_week: 15,
      learning_preferences: ["video", "handson", "group"],
      past_activities: "Rank top 500 in Valorant. Started a Twitch stream with 200 followers. Captain of school esports team. Learning Unity game development in free time. Organized school gaming tournaments.",
      past_achievements: "Won regional esports tournament. Reached Diamond rank in multiple competitive games. Built a small game prototype in Unity.",
    },
  },
  {
    name: "Environmental Activist",
    profile: {
      grade: 11,
      interests_free_text: "Climate change, sustainability, environmental policy, and outdoor activities. I'm passionate about protecting our planet.",
      interests_by_category: {
        academic: true,
        creative: false,
        social: true,
        technical: false,
        sports: false,
        music: false,
        business: false,
        health_wellness: true,
        other: true,
      },
      goals_selected: ["leadership", "research", "networking"],
      goals_free_text: "I want to work in environmental policy or become a climate scientist. Making a real impact on climate change is my mission.",
      time_availability_hours_per_week: 9,
      learning_preferences: ["reading", "group", "handson"],
      past_activities: "Founded the school's environmental club. Organized a school-wide recycling program that diverted 500 lbs of waste. Led a community tree planting initiative. Attended climate march in Washington DC.",
      past_achievements: "Recognized by city council for environmental leadership. Club grew from 5 to 50 members. Secured grant funding for school garden project.",
    },
  },
  {
    name: "Music Producer & DJ",
    profile: {
      grade: 11,
      interests_free_text: "Music production, DJing, sound engineering, and beat making. I use Ableton and FL Studio to create electronic music.",
      interests_by_category: {
        academic: false,
        creative: true,
        social: true,
        technical: true,
        sports: false,
        music: true,
        business: true,
        health_wellness: false,
        other: false,
      },
      goals_selected: ["creativity", "entrepreneurship", "networking"],
      goals_free_text: "I want to become a professional music producer or audio engineer. Dream of producing for major artists or scoring films.",
      time_availability_hours_per_week: 12,
      learning_preferences: ["video", "handson", "mentor"],
      past_activities: "Produced over 50 original tracks. DJ'd at school dances and local events. Released music on Spotify and SoundCloud. Collaborated with other artists online. Learning music theory and piano.",
      past_achievements: "Got 10,000 streams on Spotify. Paid gigs as DJ at 5 events. Won school talent show with original song. Featured on a music blog.",
    },
  },
  {
    name: "Multilingual & Cultural Explorer",
    profile: {
      grade: 10,
      interests_free_text: "Learning languages, different cultures, travel, and international relations. Currently learning Spanish, Japanese, and Mandarin.",
      interests_by_category: {
        academic: true,
        creative: false,
        social: true,
        technical: false,
        sports: false,
        music: false,
        business: false,
        health_wellness: false,
        other: true,
      },
      goals_selected: ["college", "networking", "publicSpeaking"],
      goals_free_text: "I want to work in international relations, diplomacy, or become a translator. Living and working abroad is my dream.",
      time_availability_hours_per_week: 8,
      learning_preferences: ["reading", "video", "mentor"],
      past_activities: "Fluent in English and Spanish. Intermediate Japanese and beginner Mandarin. Pen pals with students from 5 different countries. Volunteer translator for community events. Host international exchange students.",
      past_achievements: "AP Spanish score of 5. Won Model UN best delegate award. Completed Japanese N3 certification. Published article in school's multicultural magazine.",
    },
  },
  {
    name: "Math & Competition Student",
    profile: {
      grade: 11,
      interests_free_text: "Mathematics, problem solving, mathematical olympiads, and theoretical physics. I love the elegance of mathematical proofs.",
      interests_by_category: {
        academic: true,
        creative: false,
        social: false,
        technical: true,
        sports: false,
        music: false,
        business: false,
        health_wellness: false,
        other: false,
      },
      goals_selected: ["stem", "college", "research"],
      goals_free_text: "I want to study pure mathematics or theoretical physics at a top university. Research in academia is my goal.",
      time_availability_hours_per_week: 15,
      learning_preferences: ["reading", "mentor", "handson"],
      past_activities: "Member of Math Olympiad team for 4 years. Self-studied calculus and linear algebra. Tutored peers in advanced math. Attended summer math programs at universities. Solved 500+ competition problems.",
      past_achievements: "AIME qualifier for 2 years. State Math League champion. Perfect score on AMC 12. Accepted to prestigious summer math camp.",
    },
  },
  {
    name: "Social Justice Advocate",
    profile: {
      grade: 12,
      interests_free_text: "Social justice, civil rights, community organizing, and advocacy. I believe in using my voice to fight for equality.",
      interests_by_category: {
        academic: true,
        creative: false,
        social: true,
        technical: false,
        sports: false,
        music: false,
        business: false,
        health_wellness: false,
        other: true,
      },
      goals_selected: ["leadership", "publicSpeaking", "networking", "writing"],
      goals_free_text: "I want to become a civil rights lawyer or work for a nonprofit fighting for social justice. Law school is in my future.",
      time_availability_hours_per_week: 10,
      learning_preferences: ["reading", "group", "mentor"],
      past_activities: "Founded school's diversity and inclusion club. Organized voter registration drives. Spoke at city council meetings about youth issues. Interned at local ACLU chapter. Write opinion pieces for school newspaper.",
      past_achievements: "MLK Jr. service award recipient. Registered 100+ new voters. Published op-ed in local newspaper. Selected as youth representative for county equity committee.",
    },
  },
];

export default function TestingPlaygroundPage() {
  // State management
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_PROFILE, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [currentResult, setCurrentResult] = useState<TestRun | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "results" | "metrics">("input");
  
  // New state for API selection
  const [selectedAPI, setSelectedAPI] = useState<APITestType>("intake");
  
  // Skill Gap Analysis state
  const [skillGapTestRuns, setSkillGapTestRuns] = useState<SkillGapTestRun[]>([]);
  const [currentSkillGapResult, setCurrentSkillGapResult] = useState<SkillGapTestRun | null>(null);
  const [lastIntakeResult, setLastIntakeResult] = useState<AIAnalysisResult | null>(null);
  
  // Recommendations state
  const [recommendationsTestRuns, setRecommendationsTestRuns] = useState<RecommendationsTestRun[]>([]);
  const [currentRecommendationsResult, setCurrentRecommendationsResult] = useState<RecommendationsTestRun | null>(null);
  const [lastSkillGapResult, setLastSkillGapResult] = useState<SkillGapAnalysisResult | null>(null);

  // Calculate metrics from test runs
  const calculateMetrics = useCallback((): TestMetrics => {
    const evaluated = testRuns.filter((run) => run.matchesExpected !== null);
    const aligned = evaluated.filter((run) => run.matchesExpected === true);
    const hallucinations = testRuns.filter(
      (run) => run.validation.hallucinationFlags.length > 0
    );
    const valid = testRuns.filter((run) => run.validation.isValid);
    const invalid = testRuns.filter((run) => !run.validation.isValid);

    return {
      totalProfilesTested: testRuns.length,
      alignmentRatePercent:
        evaluated.length > 0
          ? Math.round((aligned.length / evaluated.length) * 100)
          : 0,
      hallucinationCount: hallucinations.length,
      validOutputCount: valid.length,
      invalidOutputCount: invalid.length,
    };
  }, [testRuns]);

  // Validate AI response
  const validateAIResponse = (
    response: unknown,
    rawText: string,
    profile: StudentProfile
  ): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const hallucinationFlags: string[] = [];

    // Check if response is an object
    if (!response || typeof response !== "object") {
      errors.push("Response is not a valid JSON object");
      return { isValid: false, errors, warnings, hallucinationFlags };
    }

    const result = response as Record<string, unknown>;

    // Check for all required skills
    for (const skill of VALID_SKILLS) {
      if (!(skill in result)) {
        errors.push(`Missing required skill: ${skill}`);
      }
    }

    // Check for unsupported skills (hallucination)
    for (const key of Object.keys(result)) {
      if (!VALID_SKILLS.includes(key)) {
        hallucinationFlags.push(`Unsupported skill detected: ${key}`);
      }
    }

    // Validate each skill signal
    for (const skill of VALID_SKILLS) {
      if (skill in result) {
        const signal = result[skill] as Record<string, unknown>;

        // Check required fields
        if (typeof signal.evidence_found !== "boolean") {
          errors.push(`${skill}: evidence_found must be boolean`);
        }
        if (!Array.isArray(signal.evidence_phrases)) {
          errors.push(`${skill}: evidence_phrases must be array`);
        }
        if (!Array.isArray(signal.evidence_sources)) {
          errors.push(`${skill}: evidence_sources must be array`);
        }
        if (
          typeof signal.confidence !== "number" ||
          signal.confidence < 0 ||
          signal.confidence > 1
        ) {
          errors.push(`${skill}: confidence must be number between 0-1`);
        }
        if (typeof signal.reasoning !== "string" || signal.reasoning.length === 0) {
          errors.push(`${skill}: reasoning must be non-empty string`);
        }

        // Validate evidence sources
        if (Array.isArray(signal.evidence_sources)) {
          for (const source of signal.evidence_sources) {
            if (!VALID_SOURCES.includes(source as string)) {
              hallucinationFlags.push(
                `${skill}: Invalid evidence source "${source}"`
              );
            }
          }
        }

        // Check for potential hallucinations in evidence phrases
        if (Array.isArray(signal.evidence_phrases)) {
          const allText = `${profile.interests_free_text} ${profile.goals_free_text} ${profile.past_activities} ${profile.past_achievements}`.toLowerCase();
          
          for (const phrase of signal.evidence_phrases) {
            const phraseStr = String(phrase).toLowerCase();
            // Check if phrase appears in the original text (allowing for some flexibility)
            const words = phraseStr.split(/\s+/);
            const foundWords = words.filter((word) => 
              word.length > 3 && allText.includes(word)
            );
            
            if (foundWords.length < words.length * 0.5 && words.length > 2) {
              warnings.push(
                `${skill}: Evidence phrase may not be from source text: "${phrase}"`
              );
            }
          }
        }

        // Check consistency: evidence_found should match evidence_phrases
        if (
          signal.evidence_found === true &&
          Array.isArray(signal.evidence_phrases) &&
          signal.evidence_phrases.length === 0
        ) {
          warnings.push(
            `${skill}: evidence_found is true but no evidence_phrases provided`
          );
        }
        if (
          signal.evidence_found === false &&
          Array.isArray(signal.evidence_phrases) &&
          signal.evidence_phrases.length > 0
        ) {
          warnings.push(
            `${skill}: evidence_found is false but evidence_phrases exist`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hallucinationFlags,
    };
  };

  // Handle JSON input change
  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setProfile(parsed);
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON syntax");
    }
  };

  // Load sample profile
  const loadSampleProfile = (sample: StudentProfile) => {
    setProfile(sample);
    setJsonInput(JSON.stringify(sample, null, 2));
    setJsonError(null);
  };

  // Submit test profile
  const submitTest = async () => {
    setIsLoading(true);
    const runId = `test-${Date.now()}`;
    let rawResponse = "";

    try {
      const response = await fetch("/api/analyze-student-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      rawResponse = JSON.stringify(data, null, 2);

      let aiResult: AIAnalysisResult | null = null;
      let validation: ValidationResult;

      // API returns: { success, data: { skill_signals: {...} }, meta: {...} }
      if (data.success && data.data?.skill_signals) {
        aiResult = data.data.skill_signals as AIAnalysisResult;
        validation = validateAIResponse(aiResult, rawResponse, profile);
        setLastIntakeResult(aiResult); // Store for skill gap test
      } else {
        validation = {
          isValid: false,
          errors: [data.error || data.details || "API returned unsuccessful response"],
          warnings: [],
          hallucinationFlags: [],
        };
      }

      const testRun: TestRun = {
        id: runId,
        timestamp: new Date(),
        profile: { ...profile },
        aiResult,
        validation,
        matchesExpected: null,
        rawResponse,
      };

      setTestRuns((prev) => [testRun, ...prev]);
      setCurrentResult(testRun);
      setActiveTab("results");
    } catch (error) {
      const testRun: TestRun = {
        id: runId,
        timestamp: new Date(),
        profile: { ...profile },
        aiResult: null,
        validation: {
          isValid: false,
          errors: [
            error instanceof Error ? error.message : "Unknown error occurred",
          ],
          warnings: [],
          hallucinationFlags: [],
        },
        matchesExpected: null,
        rawResponse: rawResponse || "No response received",
      };

      setTestRuns((prev) => [testRun, ...prev]);
      setCurrentResult(testRun);
      setActiveTab("results");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Skill Gap Analysis test
  const submitSkillGapTest = async () => {
    if (!lastIntakeResult) {
      alert("Please run an Intake Analysis first to get skill signals.");
      return;
    }

    setIsLoading(true);
    const runId = `skill-gap-${Date.now()}`;
    let rawResponse = "";

    const interestsCategories = Object.entries(profile.interests_by_category)
      .filter(([, value]) => value)
      .map(([key]) => key);

    const studentContext = {
      grade: profile.grade,
      interests_free_text: profile.interests_free_text,
      interests_categories: interestsCategories,
      goals_selected: profile.goals_selected,
      goals_free_text: profile.goals_free_text,
      time_availability_hours_per_week: profile.time_availability_hours_per_week,
      learning_preferences: profile.learning_preferences,
    };

    try {
      const response = await fetch("/api/skill-gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_snapshot: lastIntakeResult,
          student_context: studentContext,
        }),
      });

      const data = await response.json();
      rawResponse = JSON.stringify(data, null, 2);

      let result: SkillGapAnalysisResult | null = null;
      let validation: ValidationResult;

      if (data.success && data.data) {
        result = data.data as SkillGapAnalysisResult;
        setLastSkillGapResult(result); // Store for recommendations test
        validation = {
          isValid: true,
          errors: [],
          warnings: [],
          hallucinationFlags: [],
        };

        // Basic validation
        if (!result.skill_gaps || result.skill_gaps.length === 0) {
          validation.warnings.push("No skill gaps returned");
        }
        if (!result.overall_summary) {
          validation.warnings.push("Missing overall summary");
        }
      } else {
        validation = {
          isValid: false,
          errors: [data.error || data.details || "API returned unsuccessful response"],
          warnings: [],
          hallucinationFlags: [],
        };
      }

      const testRun: SkillGapTestRun = {
        id: runId,
        timestamp: new Date(),
        skillSnapshot: lastIntakeResult,
        studentContext,
        result,
        validation,
        rawResponse,
      };

      setSkillGapTestRuns((prev) => [testRun, ...prev]);
      setCurrentSkillGapResult(testRun);
      setActiveTab("results");
    } catch (error) {
      const testRun: SkillGapTestRun = {
        id: runId,
        timestamp: new Date(),
        skillSnapshot: lastIntakeResult,
        studentContext,
        result: null,
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : "Unknown error occurred"],
          warnings: [],
          hallucinationFlags: [],
        },
        rawResponse: rawResponse || "No response received",
      };

      setSkillGapTestRuns((prev) => [testRun, ...prev]);
      setCurrentSkillGapResult(testRun);
      setActiveTab("results");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Personalized Recommendations test
  const submitRecommendationsTest = async () => {
    if (!lastIntakeResult) {
      alert("Please run an Intake Analysis first to get skill signals.");
      return;
    }

    setIsLoading(true);
    const runId = `recommendations-${Date.now()}`;
    let rawResponse = "";

    const interestsCategories = Object.entries(profile.interests_by_category)
      .filter(([, value]) => value)
      .map(([key]) => key);

    const studentProfile = {
      grade: profile.grade,
      interests: profile.interests_free_text,
      interest_categories: interestsCategories,
      goals: profile.goals_selected,
      goals_free_text: profile.goals_free_text,
      time_availability_hours_per_week: profile.time_availability_hours_per_week,
      learning_preferences: profile.learning_preferences,
    };

    const skillGapAnalysis = lastSkillGapResult ? {
      skill_gaps: lastSkillGapResult.skill_gaps.map(sg => ({
        skill: sg.skill,
        current_level: sg.current_level,
        goal_level: sg.goal_level,
        gap: sg.gap,
      })),
      priority_skills: lastSkillGapResult.priority_skills,
      overall_summary: lastSkillGapResult.overall_summary,
    } : undefined;

    try {
      const response = await fetch("/api/personalized-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_profile: studentProfile,
          skill_snapshot: lastIntakeResult,
          skill_gap_analysis: skillGapAnalysis,
        }),
      });

      const data = await response.json();
      rawResponse = JSON.stringify(data, null, 2);

      let result: PersonalizedRecommendationsResult | null = null;
      let validation: ValidationResult;

      if (data.success && data.data) {
        result = data.data as PersonalizedRecommendationsResult;
        validation = {
          isValid: true,
          errors: [],
          warnings: [],
          hallucinationFlags: [],
        };

        // Basic validation
        const totalRecs = (result.courses?.length || 0) + (result.projects?.length || 0) + (result.competitions?.length || 0);
        if (totalRecs === 0) {
          validation.warnings.push("No recommendations returned");
        }
        if (!result.summary) {
          validation.warnings.push("Missing summary");
        }
      } else {
        validation = {
          isValid: false,
          errors: [data.error || data.details || "API returned unsuccessful response"],
          warnings: [],
          hallucinationFlags: [],
        };
      }

      const testRun: RecommendationsTestRun = {
        id: runId,
        timestamp: new Date(),
        studentProfile,
        skillSnapshot: lastIntakeResult,
        skillGapAnalysis,
        result,
        validation,
        rawResponse,
      };

      setRecommendationsTestRuns((prev) => [testRun, ...prev]);
      setCurrentRecommendationsResult(testRun);
      setActiveTab("results");
    } catch (error) {
      const testRun: RecommendationsTestRun = {
        id: runId,
        timestamp: new Date(),
        studentProfile,
        skillSnapshot: lastIntakeResult,
        skillGapAnalysis,
        result: null,
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : "Unknown error occurred"],
          warnings: [],
          hallucinationFlags: [],
        },
        rawResponse: rawResponse || "No response received",
      };

      setRecommendationsTestRuns((prev) => [testRun, ...prev]);
      setCurrentRecommendationsResult(testRun);
      setActiveTab("results");
    } finally {
      setIsLoading(false);
    }
  };

  // Run all tests in sequence
  const runFullPipeline = async () => {
    setIsLoading(true);
    try {
      // Step 1: Run intake analysis
      await submitTest();
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Run skill gap analysis
      await submitSkillGapTest();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Run recommendations
      await submitRecommendationsTest();
    } finally {
      setIsLoading(false);
    }
  };

  // Mark test result alignment
  const markAlignment = (runId: string, matches: boolean) => {
    setTestRuns((prev) =>
      prev.map((run) =>
        run.id === runId ? { ...run, matchesExpected: matches } : run
      )
    );
    if (currentResult?.id === runId) {
      setCurrentResult((prev) =>
        prev ? { ...prev, matchesExpected: matches } : prev
      );
    }
  };

  // Clear all test runs
  const clearTestRuns = () => {
    setTestRuns([]);
    setCurrentResult(null);
    setSkillGapTestRuns([]);
    setCurrentSkillGapResult(null);
    setRecommendationsTestRuns([]);
    setCurrentRecommendationsResult(null);
    setLastIntakeResult(null);
    setLastSkillGapResult(null);
  };

  const metrics = calculateMetrics();

  // Get current result based on selected API
  const getCurrentAPIResult = () => {
    switch (selectedAPI) {
      case "intake":
        return currentResult;
      case "skill-gap":
        return currentSkillGapResult;
      case "recommendations":
        return currentRecommendationsResult;
      default:
        return null;
    }
  };

  // Get test runs count based on selected API
  const getTestRunsCount = () => {
    switch (selectedAPI) {
      case "intake":
        return testRuns.length;
      case "skill-gap":
        return skillGapTestRuns.length;
      case "recommendations":
        return recommendationsTestRuns.length;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-yellow-800">
                🧪 Internal Testing Playground
              </h1>
              <p className="text-sm text-yellow-700">
                FOR VALIDATION ONLY - This page tests SkillBridge AI outputs for
                accuracy and hallucination detection
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "input", label: "📝 Test Input", count: null },
            { key: "results", label: "📊 Results", count: getCurrentAPIResult() ? 1 : 0 },
            { key: "metrics", label: "📈 Metrics", count: testRuns.length + skillGapTestRuns.length + recommendationsTestRuns.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* API Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <span className="font-medium text-gray-700">Test API:</span>
            <div className="flex gap-2">
              {[
                { key: "intake", label: "🔍 Intake Analysis", color: "indigo" },
                { key: "skill-gap", label: "📊 Skill Gap Analysis", color: "emerald" },
                { key: "recommendations", label: "💡 Recommendations", color: "purple" },
              ].map((api) => (
                <button
                  key={api.key}
                  onClick={() => setSelectedAPI(api.key as APITestType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedAPI === api.key
                      ? `bg-${api.color}-600 text-white`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={selectedAPI === api.key ? {
                    backgroundColor: api.key === "intake" ? "#4f46e5" : api.key === "skill-gap" ? "#059669" : "#7c3aed"
                  } : {}}
                >
                  {api.label}
                </button>
              ))}
            </div>
            
            {/* Pipeline indicator */}
            <div className="ml-auto flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded ${lastIntakeResult ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {lastIntakeResult ? "✓ Intake Ready" : "○ Intake"}
              </span>
              <span className="text-gray-300">→</span>
              <span className={`px-2 py-1 rounded ${lastSkillGapResult ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {lastSkillGapResult ? "✓ Gap Ready" : "○ Gap"}
              </span>
              <span className="text-gray-300">→</span>
              <span className={`px-2 py-1 rounded ${currentRecommendationsResult ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {currentRecommendationsResult ? "✓ Recs Ready" : "○ Recs"}
              </span>
            </div>
          </div>
        </div>

        {/* INPUT TAB */}
        {activeTab === "input" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Sample Profiles */}
            <div className="lg:col-span-1">
              <Card padding="md" className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  📋 Sample Test Profiles
                </h3>
                <div className="space-y-2">
                  {SAMPLE_PROFILES.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadSampleProfile(sample.profile)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {sample.name}
                      </span>
                      <span className="block text-xs text-gray-500">
                        Grade {sample.profile.grade} •{" "}
                        {sample.profile.goals_selected.length} goals
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-semibold text-gray-900 mb-3">⚙️ Options</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jsonMode}
                    onChange={(e) => setJsonMode(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">JSON Editor Mode</span>
                </label>
              </Card>
            </div>

            {/* Right: Profile Form / JSON Editor */}
            <div className="lg:col-span-2">
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {jsonMode ? "📄 JSON Input" : "📝 Student Profile"}
                  </h3>
                  <div className="flex gap-2">
                    {selectedAPI === "intake" && (
                      <Button
                        onClick={submitTest}
                        disabled={isLoading || (jsonMode && !!jsonError)}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Testing...
                          </>
                        ) : (
                          "🔍 Run Intake Analysis"
                        )}
                      </Button>
                    )}
                    {selectedAPI === "skill-gap" && (
                      <Button
                        onClick={submitSkillGapTest}
                        disabled={isLoading || !lastIntakeResult}
                        variant={!lastIntakeResult ? "secondary" : "primary"}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Testing...
                          </>
                        ) : !lastIntakeResult ? (
                          "⚠️ Run Intake First"
                        ) : (
                          "📊 Run Skill Gap Analysis"
                        )}
                      </Button>
                    )}
                    {selectedAPI === "recommendations" && (
                      <Button
                        onClick={submitRecommendationsTest}
                        disabled={isLoading || !lastIntakeResult}
                        variant={!lastIntakeResult ? "secondary" : "primary"}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Testing...
                          </>
                        ) : !lastIntakeResult ? (
                          "⚠️ Run Intake First"
                        ) : (
                          "💡 Run Recommendations"
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {jsonMode ? (
                  <div>
                    {jsonError && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        {jsonError}
                      </div>
                    )}
                    <textarea
                      value={jsonInput}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      className="w-full h-[500px] font-mono text-sm p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      spellCheck={false}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Grade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade Level
                      </label>
                      <select
                        value={profile.grade}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            grade: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {[9, 10, 11, 12].map((g) => (
                          <option key={g} value={g}>
                            Grade {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Interests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interests (Free Text)
                      </label>
                      <textarea
                        value={profile.interests_free_text}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            interests_free_text: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                        placeholder="Describe your interests..."
                      />
                    </div>

                    {/* Interest Categories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interest Categories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(profile.interests_by_category).map((cat) => (
                          <label
                            key={cat}
                            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${
                              profile.interests_by_category[
                                cat as keyof typeof profile.interests_by_category
                              ]
                                ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-400"
                                : "bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={
                                profile.interests_by_category[
                                  cat as keyof typeof profile.interests_by_category
                                ]
                              }
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  interests_by_category: {
                                    ...p.interests_by_category,
                                    [cat]: e.target.checked,
                                  },
                                }))
                              }
                            />
                            {cat.replace("_", " ")}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Goals (Free Text)
                      </label>
                      <textarea
                        value={profile.goals_free_text}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            goals_free_text: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                        placeholder="What do you want to achieve?"
                      />
                    </div>

                    {/* Time Availability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Availability (hours/week)
                      </label>
                      <input
                        type="number"
                        value={profile.time_availability_hours_per_week}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            time_availability_hours_per_week: parseInt(
                              e.target.value
                            ),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min={1}
                        max={40}
                      />
                    </div>

                    {/* Past Activities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Past Activities *
                      </label>
                      <textarea
                        value={profile.past_activities}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            past_activities: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Describe your past activities, projects, and experiences..."
                      />
                    </div>

                    {/* Past Achievements */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Past Achievements
                      </label>
                      <textarea
                        value={profile.past_achievements}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            past_achievements: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                        placeholder="Awards, recognitions, accomplishments..."
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {/* Intake Analysis Results */}
            {selectedAPI === "intake" && currentResult && (
              <>
                {/* Validation Summary */}
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      🔍 Intake Analysis - Validation Summary
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          currentResult.validation.isValid ? "success" : "error"
                        }
                      >
                        {currentResult.validation.isValid
                          ? "✓ Valid Output"
                          : "✗ Invalid Output"}
                      </Badge>
                      {currentResult.validation.hallucinationFlags.length > 0 && (
                        <Badge variant="warning">
                          ⚠ {currentResult.validation.hallucinationFlags.length}{" "}
                          Hallucination Flag(s)
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Errors */}
                  {currentResult.validation.errors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">
                        ❌ Schema Errors
                      </h4>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {currentResult.validation.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {currentResult.validation.warnings.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        ⚠️ Warnings
                      </h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        {currentResult.validation.warnings.map((warn, idx) => (
                          <li key={idx}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Hallucination Flags */}
                  {currentResult.validation.hallucinationFlags.length > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">
                        🔮 Hallucination Flags
                      </h4>
                      <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                        {currentResult.validation.hallucinationFlags.map(
                          (flag, idx) => (
                            <li key={idx}>{flag}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Manual Alignment Check */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      ✅ Manual Alignment Check
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Does the AI output match expected skills for this profile?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAlignment(currentResult.id, true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentResult.matchesExpected === true
                            ? "bg-green-600 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"
                        }`}
                      >
                        👍 Yes, Aligned
                      </button>
                      <button
                        onClick={() => markAlignment(currentResult.id, false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentResult.matchesExpected === false
                            ? "bg-red-600 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-red-400"
                        }`}
                      >
                        👎 No, Misaligned
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Extracted Skills */}
                {currentResult.aiResult && (
                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">
                      🎯 Extracted Skills & Evidence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {VALID_SKILLS.map((skillKey) => {
                        const signal =
                          currentResult.aiResult![
                            skillKey as keyof AIAnalysisResult
                          ];
                        const score = Math.round(signal.confidence * 100);

                        return (
                          <div
                            key={skillKey}
                            className="p-4 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">
                                {skillKey
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    signal.evidence_found ? "success" : "default"
                                  }
                                  size="sm"
                                >
                                  {signal.evidence_found
                                    ? "Evidence Found"
                                    : "No Evidence"}
                                </Badge>
                                <span
                                  className={`font-bold ${
                                    score >= 70
                                      ? "text-green-600"
                                      : score >= 40
                                      ? "text-yellow-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {score}%
                                </span>
                              </div>
                            </div>

                            <ProgressBar
                              value={score}
                              color={
                                score >= 70
                                  ? "success"
                                  : score >= 40
                                  ? "warning"
                                  : "error"
                              }
                              size="sm"
                              showValue={false}
                            />

                            {signal.evidence_phrases.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">
                                  Evidence Phrases:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {signal.evidence_phrases.map((phrase, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded"
                                    >
                                      &ldquo;{phrase}&rdquo;
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {signal.evidence_sources.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  Sources:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {signal.evidence_sources.map((source, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                                    >
                                      {source}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                              <strong>AI Reasoning:</strong> {signal.reasoning}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Raw Response */}
                <Card padding="lg">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">
                    📄 Raw API Response
                  </h3>
                  <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-lg overflow-auto max-h-96">
                    {currentResult.rawResponse}
                  </pre>
                </Card>
              </>
            )}

            {/* Skill Gap Analysis Results */}
            {selectedAPI === "skill-gap" && currentSkillGapResult && (
              <>
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      📊 Skill Gap Analysis - Results
                    </h3>
                    <Badge
                      variant={
                        currentSkillGapResult.validation.isValid ? "success" : "error"
                      }
                    >
                      {currentSkillGapResult.validation.isValid
                        ? "✓ Valid Output"
                        : "✗ Invalid Output"}
                    </Badge>
                  </div>

                  {/* Errors */}
                  {currentSkillGapResult.validation.errors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">❌ Errors</h4>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {currentSkillGapResult.validation.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {currentSkillGapResult.validation.warnings.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warnings</h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        {currentSkillGapResult.validation.warnings.map((warn, idx) => (
                          <li key={idx}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Overall Summary */}
                  {currentSkillGapResult.result && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                      <h4 className="font-medium text-emerald-800 mb-2">📝 Overall Summary</h4>
                      <p className="text-sm text-emerald-700">{currentSkillGapResult.result.overall_summary}</p>
                      {currentSkillGapResult.result.total_weekly_time_recommended && (
                        <p className="text-sm text-emerald-600 mt-2">
                          <strong>Recommended Time:</strong> {currentSkillGapResult.result.total_weekly_time_recommended}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Priority Skills */}
                  {currentSkillGapResult.result?.priority_skills && currentSkillGapResult.result.priority_skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">🎯 Priority Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentSkillGapResult.result.priority_skills.map((skill, idx) => (
                          <Badge key={idx} variant="info">
                            {skill.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Skill Gaps Detail */}
                {currentSkillGapResult.result?.skill_gaps && (
                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">
                      📈 Skill Gap Details
                    </h3>
                    <div className="space-y-4">
                      {currentSkillGapResult.result.skill_gaps.map((gap, idx) => (
                        <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-800">
                              {gap.skill.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </h4>
                            <Badge variant={gap.gap > 30 ? "error" : gap.gap > 15 ? "warning" : "success"}>
                              Gap: {gap.gap}%
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-gray-500">Current</p>
                              <p className="font-bold text-gray-700">{gap.current_level}%</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-gray-500">Goal</p>
                              <p className="font-bold text-gray-700">{gap.goal_level}%</p>
                            </div>
                            <div className="text-center p-2 bg-emerald-50 rounded">
                              <p className="text-emerald-600">Expected After</p>
                              <p className="font-bold text-emerald-700">{gap.expected_level_after}%</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <ProgressBar value={gap.current_level} color="primary" size="sm" showValue={false} />
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Timeline:</strong> {gap.timeline}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Why it matters:</strong> {gap.why_it_matters}
                          </p>

                          {/* Actionable Steps */}
                          {gap.actionable_steps && gap.actionable_steps.length > 0 && (
                            <div className="mt-3 border-t pt-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">📋 Actionable Steps</h5>
                              <div className="space-y-2">
                                {gap.actionable_steps.map((step, stepIdx) => (
                                  <div key={stepIdx} className="p-2 bg-gray-50 rounded text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge size="sm" variant={step.priority === "high" ? "error" : step.priority === "medium" ? "warning" : "default"}>
                                        {step.priority}
                                      </Badge>
                                      <span className="text-xs text-gray-500">{step.time_required}</span>
                                    </div>
                                    <p className="text-gray-700">{step.step}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Expected Impact: {step.expected_impact}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            <strong>AI Reasoning:</strong> {gap.reasoning}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Raw Response */}
                <Card padding="lg">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">
                    📄 Raw API Response
                  </h3>
                  <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-lg overflow-auto max-h-96">
                    {currentSkillGapResult.rawResponse}
                  </pre>
                </Card>
              </>
            )}

            {/* Personalized Recommendations Results */}
            {selectedAPI === "recommendations" && currentRecommendationsResult && (
              <>
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      💡 Personalized Recommendations - Results
                    </h3>
                    <Badge
                      variant={
                        currentRecommendationsResult.validation.isValid ? "success" : "error"
                      }
                    >
                      {currentRecommendationsResult.validation.isValid
                        ? "✓ Valid Output"
                        : "✗ Invalid Output"}
                    </Badge>
                  </div>

                  {/* Errors */}
                  {currentRecommendationsResult.validation.errors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">❌ Errors</h4>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {currentRecommendationsResult.validation.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {currentRecommendationsResult.validation.warnings.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warnings</h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        {currentRecommendationsResult.validation.warnings.map((warn, idx) => (
                          <li key={idx}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary */}
                  {currentRecommendationsResult.result && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">📝 Summary</h4>
                      <p className="text-sm text-purple-700">{currentRecommendationsResult.result.summary}</p>
                    </div>
                  )}
                </Card>

                {/* Courses */}
                {currentRecommendationsResult.result?.courses && currentRecommendationsResult.result.courses.length > 0 && (
                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">
                      📚 Recommended Courses ({currentRecommendationsResult.result.courses.length})
                    </h3>
                    <div className="space-y-4">
                      {currentRecommendationsResult.result.courses.map((course, idx) => (
                        <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800">{course.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="info">{course.match_score}% Match</Badge>
                              <Badge variant="default">{course.level}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Provider:</strong> {course.platform_or_provider} • 
                            <strong> Duration:</strong> {course.duration_weeks} weeks
                            {course.format && <> • <strong>Format:</strong> {course.format}</>}
                          </p>
                          {course.skill_alignment && course.skill_alignment.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {course.skill_alignment.map((sa, saIdx) => (
                                <span key={saIdx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                  {sa.skill}: +{sa.expected_improvement}%
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">{course.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Projects */}
                {currentRecommendationsResult.result?.projects && currentRecommendationsResult.result.projects.length > 0 && (
                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">
                      🛠️ Recommended Projects ({currentRecommendationsResult.result.projects.length})
                    </h3>
                    <div className="space-y-4">
                      {currentRecommendationsResult.result.projects.map((project, idx) => (
                        <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800">{project.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="success">{project.match_score}% Match</Badge>
                              <Badge variant="default">{project.level}</Badge>
                              {project.project_type && <Badge variant="default">{project.project_type}</Badge>}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Platform:</strong> {project.platform_or_provider} • 
                            <strong> Duration:</strong> {project.duration_weeks} weeks
                          </p>
                          {project.skills_used && project.skills_used.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {project.skills_used.map((skill, sIdx) => (
                                <span key={sIdx} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          {project.skill_alignment && project.skill_alignment.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {project.skill_alignment.map((sa, saIdx) => (
                                <span key={saIdx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                  {sa.skill}: +{sa.expected_improvement}%
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">{project.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Competitions */}
                {currentRecommendationsResult.result?.competitions && currentRecommendationsResult.result.competitions.length > 0 && (
                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">
                      🏆 Recommended Competitions ({currentRecommendationsResult.result.competitions.length})
                    </h3>
                    <div className="space-y-4">
                      {currentRecommendationsResult.result.competitions.map((comp, idx) => (
                        <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800">{comp.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="warning">{comp.match_score}% Match</Badge>
                              <Badge variant="default">{comp.level}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Organizer:</strong> {comp.platform_or_provider} • 
                            <strong> Duration:</strong> {comp.duration_weeks} weeks
                            {comp.deadline && <> • <strong>Deadline:</strong> {comp.deadline}</>}
                            {comp.prize && <> • <strong>Prize:</strong> {comp.prize}</>}
                          </p>
                          {comp.skill_alignment && comp.skill_alignment.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {comp.skill_alignment.map((sa, saIdx) => (
                                <span key={saIdx} className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                                  {sa.skill}: +{sa.expected_improvement}%
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">{comp.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Raw Response */}
                <Card padding="lg">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">
                    📄 Raw API Response
                  </h3>
                  <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-lg overflow-auto max-h-96">
                    {currentRecommendationsResult.rawResponse}
                  </pre>
                </Card>
              </>
            )}

            {/* No Results Message */}
            {((selectedAPI === "intake" && !currentResult) ||
              (selectedAPI === "skill-gap" && !currentSkillGapResult) ||
              (selectedAPI === "recommendations" && !currentRecommendationsResult)) && (
              <Card padding="lg">
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p>No test results yet for {selectedAPI === "intake" ? "Intake Analysis" : selectedAPI === "skill-gap" ? "Skill Gap Analysis" : "Recommendations"}.</p>
                  <p className="text-sm mt-2">
                    {selectedAPI === "intake" 
                      ? "Run an Intake Analysis test to see results here."
                      : selectedAPI === "skill-gap"
                      ? "Run an Intake Analysis first, then test Skill Gap Analysis."
                      : "Run Intake Analysis (and optionally Skill Gap) first, then test Recommendations."}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* METRICS TAB */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            {/* Metrics Summary */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 text-lg">
                  📊 Validation Metrics Summary
                </h3>
                {(testRuns.length > 0 || skillGapTestRuns.length > 0 || recommendationsTestRuns.length > 0) && (
                  <button
                    onClick={clearTestRuns}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Clear All Tests
                  </button>
                )}
              </div>

              {/* Intake Metrics */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">🔍 Intake Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-indigo-600">
                      {metrics.totalProfilesTested}
                    </p>
                    <p className="text-sm text-indigo-700">Profiles Tested</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {metrics.validOutputCount}
                    </p>
                    <p className="text-sm text-green-700">Valid Outputs</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {metrics.invalidOutputCount}
                    </p>
                    <p className="text-sm text-red-700">Invalid Outputs</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {metrics.hallucinationCount}
                    </p>
                    <p className="text-sm text-orange-700">Hallucinations</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {metrics.alignmentRatePercent}%
                    </p>
                    <p className="text-sm text-blue-700">Alignment Rate</p>
                  </div>
                </div>
              </div>

              {/* Skill Gap Metrics */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">📊 Skill Gap Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-emerald-600">
                      {skillGapTestRuns.length}
                    </p>
                    <p className="text-sm text-emerald-700">Tests Run</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {skillGapTestRuns.filter(r => r.validation.isValid).length}
                    </p>
                    <p className="text-sm text-green-700">Valid Outputs</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {skillGapTestRuns.filter(r => !r.validation.isValid).length}
                    </p>
                    <p className="text-sm text-red-700">Invalid Outputs</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-yellow-600">
                      {skillGapTestRuns.filter(r => r.validation.warnings.length > 0).length}
                    </p>
                    <p className="text-sm text-yellow-700">With Warnings</p>
                  </div>
                </div>
              </div>

              {/* Recommendations Metrics */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">💡 Personalized Recommendations</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {recommendationsTestRuns.length}
                    </p>
                    <p className="text-sm text-purple-700">Tests Run</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {recommendationsTestRuns.filter(r => r.validation.isValid).length}
                    </p>
                    <p className="text-sm text-green-700">Valid Outputs</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {recommendationsTestRuns.filter(r => !r.validation.isValid).length}
                    </p>
                    <p className="text-sm text-red-700">Invalid Outputs</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-yellow-600">
                      {recommendationsTestRuns.filter(r => r.validation.warnings.length > 0).length}
                    </p>
                    <p className="text-sm text-yellow-700">With Warnings</p>
                  </div>
                </div>
              </div>

              {/* Combined Metrics JSON */}
              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">
                  Combined Metrics Summary:
                </p>
                <pre className="text-green-400 text-sm">
                  {JSON.stringify({
                    intake: metrics,
                    skillGap: {
                      testsRun: skillGapTestRuns.length,
                      validOutputs: skillGapTestRuns.filter(r => r.validation.isValid).length,
                      invalidOutputs: skillGapTestRuns.filter(r => !r.validation.isValid).length,
                    },
                    recommendations: {
                      testsRun: recommendationsTestRuns.length,
                      validOutputs: recommendationsTestRuns.filter(r => r.validation.isValid).length,
                      invalidOutputs: recommendationsTestRuns.filter(r => !r.validation.isValid).length,
                    },
                  }, null, 2)}
                </pre>
              </div>
            </Card>

            {/* Test History - Intake */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">
                📜 Intake Analysis History
              </h3>
              {testRuns.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No intake tests run yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {testRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedAPI("intake");
                        setCurrentResult(run);
                        setActiveTab("results");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            🔍 Intake #{run.id.split("-")[1]?.slice(-6)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {run.timestamp.toLocaleString()} • Grade{" "}
                            {run.profile.grade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              run.validation.isValid ? "success" : "error"
                            }
                            size="sm"
                          >
                            {run.validation.isValid ? "Valid" : "Invalid"}
                          </Badge>
                          {run.validation.hallucinationFlags.length > 0 && (
                            <Badge variant="warning" size="sm">
                              ⚠️
                            </Badge>
                          )}
                          {run.matchesExpected === true && (
                            <Badge variant="success" size="sm">
                              👍
                            </Badge>
                          )}
                          {run.matchesExpected === false && (
                            <Badge variant="error" size="sm">
                              👎
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Test History - Skill Gap */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">
                📊 Skill Gap Analysis History
              </h3>
              {skillGapTestRuns.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No skill gap tests run yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {skillGapTestRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedAPI("skill-gap");
                        setCurrentSkillGapResult(run);
                        setActiveTab("results");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            📊 Skill Gap #{run.id.split("-")[2]?.slice(-6)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {run.timestamp.toLocaleString()} • Grade{" "}
                            {run.studentContext.grade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              run.validation.isValid ? "success" : "error"
                            }
                            size="sm"
                          >
                            {run.validation.isValid ? "Valid" : "Invalid"}
                          </Badge>
                          {run.validation.warnings.length > 0 && (
                            <Badge variant="warning" size="sm">
                              ⚠️ {run.validation.warnings.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Test History - Recommendations */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">
                💡 Recommendations History
              </h3>
              {recommendationsTestRuns.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No recommendations tests run yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recommendationsTestRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedAPI("recommendations");
                        setCurrentRecommendationsResult(run);
                        setActiveTab("results");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            💡 Recommendations #{run.id.split("-")[1]?.slice(-6)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {run.timestamp.toLocaleString()} • Grade{" "}
                            {run.studentProfile.grade}
                            {run.result && (
                              <> • {(run.result.courses?.length || 0) + (run.result.projects?.length || 0) + (run.result.competitions?.length || 0)} recommendations</>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              run.validation.isValid ? "success" : "error"
                            }
                            size="sm"
                          >
                            {run.validation.isValid ? "Valid" : "Invalid"}
                          </Badge>
                          {run.validation.warnings.length > 0 && (
                            <Badge variant="warning" size="sm">
                              ⚠️ {run.validation.warnings.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="mt-8 p-4 bg-gray-200 rounded-lg text-center text-sm text-gray-600">
          <p>
            <strong>⚠️ Internal Testing Only</strong> — This page is not for
            end-users. Results are for validation and competition documentation
            purposes.
          </p>
        </div>
      </div>
    </div>
  );
}