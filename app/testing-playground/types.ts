// =============================================================================
// TESTING PLAYGROUND TYPES
// =============================================================================

export interface StudentProfile {
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
  challenges: string;
  skills: {
    problemSolving: number;
    communication: number;
    technicalSkills: number;
    creativity: number;
    leadership: number;
    selfManagement: number;
  };
}

export interface SkillSignal {
  evidence_found: boolean;
  evidence_phrases: string[];
  evidence_sources: string[];
  confidence: number;
  reasoning: string;
}

export interface AIAnalysisResult {
  problem_solving: SkillSignal;
  communication: SkillSignal;
  technical_skills: SkillSignal;
  creativity: SkillSignal;
  leadership: SkillSignal;
  self_management: SkillSignal;
}

// Skill Gap Analysis Types
export interface ActionableStep {
  step: string;
  time_required: string;
  expected_impact: string;
  priority: "high" | "medium" | "low";
  why: string;
}

export interface SkillGapResult {
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

export interface SkillGapAnalysisResult {
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
export interface SkillAlignment {
  skill: string;
  expected_improvement: number;
}

export interface BaseRecommendation {
  title: string;
  platform_or_provider: string;
  match_score: number;
  skill_alignment: SkillAlignment[];
  duration_weeks: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  reasoning: string;
}

export interface CourseRecommendation extends BaseRecommendation {
  type: "course";
  format?: "online" | "in-person" | "hybrid";
}

export interface ProjectRecommendation extends BaseRecommendation {
  type: "project";
  project_type?: "solo" | "team" | "open-source";
  skills_used?: string[];
}

export interface CompetitionRecommendation extends BaseRecommendation {
  type: "competition";
  deadline?: string;
  prize?: string;
}

export interface PersonalizedRecommendationsResult {
  courses: CourseRecommendation[];
  projects: ProjectRecommendation[];
  competitions: CompetitionRecommendation[];
  summary: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hallucinationFlags: string[];
}

export interface TestRun {
  id: string;
  timestamp: Date;
  profile: StudentProfile;
  aiResult: AIAnalysisResult | null;
  validation: ValidationResult;
  matchesExpected: boolean | null;
  rawResponse: string;
}

export interface SkillGapTestRun {
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

export interface RecommendationsTestRun {
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

export interface TestMetrics {
  totalProfilesTested: number;
  alignmentRatePercent: number;
  hallucinationCount: number;
  validOutputCount: number;
  invalidOutputCount: number;
}

// API Test Type
export type APITestType = "intake" | "skill-gap" | "recommendations";
