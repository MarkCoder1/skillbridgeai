// Types for AI Analysis data from sessionStorage
export type EvidenceSource = "interests" | "goals" | "past_activities" | "achievements";

export interface SkillSignal {
  evidence_found: boolean;
  evidence_phrases: string[];
  evidence_sources: EvidenceSource[];
  confidence: number;
  reasoning: string;
}

export interface AIAnalysisData {
  formData: {
    grade: string;
    interests: string;
    interestCategories: string[];
    goals: string[];
    customGoal: string;
    timeAvailability: string;
    preferredLearningModes: string[];
    activities: string;
    pastAchievements: string;
    challenges: string;
    skillSelfRatings: Record<string, number>;
  };
  confidence_note?: string;
  aiAnalysis: {
    skill_signals: {
      problem_solving: SkillSignal;
      communication: SkillSignal;
      technical_skills: SkillSignal;
      creativity: SkillSignal;
      leadership: SkillSignal;
      self_management: SkillSignal;
    };
    summary: Record<string, boolean>;
  };
  meta: {
    grade: number;
    goals_count: number;
    time_availability: number;
    analyzed_at: string;
    model: string;
    api_version: string;
  };
  submittedAt: string;
}

// Types for Skill Gap Analysis
export interface ActionStep {
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
  actionable_steps: ActionStep[];
  reasoning: string;
}

export interface SkillWithoutEvidence {
  skill: string;
  display_name: string;
  goal_relevance: "high" | "medium" | "low";
  suggestion: string;
}

export interface SkillGapAnalysis {
  skill_gaps: SkillGapResult[];
  overall_summary: string;
  priority_skills: string[];
  total_weekly_time_recommended: string;
  skills_without_evidence: SkillWithoutEvidence[];
}

// Types for Personalized Recommendations
import type {
  CourseRecommendation,
  ProjectRecommendation,
  CompetitionRecommendation,
} from "@/components/ui";

export interface RecommendationsData {
  courses: CourseRecommendation[];
  projects: ProjectRecommendation[];
  competitions: CompetitionRecommendation[];
  summary: string;
}

// Types for 30-Day Action Plan API
export interface PlanTask {
  task_id: string;
  title: string;
  description: string;
  related_skill: string;
  skill_gap_addressed: number;
  expected_skill_gain: number;
  estimated_time_hours: number;
  difficulty: "low" | "medium" | "high";
  evidence_source: string;
  reasoning: string;
  completed?: boolean; // Local state for tracking completion
}

export interface PlanWeek {
  week_number: 1 | 2 | 3 | 4;
  theme: string;
  tasks: PlanTask[];
}

export interface PlanOverview {
  primary_focus_skill: string;
  total_tasks: number;
  estimated_total_hours: number;
  reasoning_summary: string;
}

export interface ActionPlanData {
  overview: PlanOverview;
  weeks: PlanWeek[];
  confidence_note: string;
}

// Filter and sort options for recommendations
export type TabType = "courses" | "projects" | "competitions";
export type MatchLevel = "high" | "medium" | "low";
export type RecommendationSortBy = "match" | "duration" | "level";
export type RecommendationFilterLevel = "all" | "high" | "medium" | "low";
