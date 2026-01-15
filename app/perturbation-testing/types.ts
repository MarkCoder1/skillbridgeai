// =============================================================================
// PERTURBATION & ROBUSTNESS TESTING TYPES
// =============================================================================

import type { StudentProfile, AIAnalysisResult, SkillGapAnalysisResult, PersonalizedRecommendationsResult } from "../testing-playground/types";

/**
 * Perturbation variant types
 */
export type PerturbationType = "original" | "injection" | "removal" | "rephrased";

/**
 * Evidence item that can be added or removed
 */
export interface EvidenceItem {
  type: "experience" | "achievement" | "goal";
  content: string;
  relatedSkills: string[];
}

/**
 * Profile variant with metadata about perturbation
 */
export interface ProfileVariant {
  id: string;
  profileId: string;
  profileName: string;
  variantType: PerturbationType;
  profile: StudentProfile;
  perturbationDescription: string;
  addedEvidence?: EvidenceItem[];
  removedEvidence?: EvidenceItem[];
  rephrasedFields?: string[];
}

/**
 * Full pipeline results for a single variant run
 */
export interface PipelineResults {
  intakeAnalysis: AIAnalysisResult | null;
  skillGapAnalysis: SkillGapAnalysisResult | null;
  recommendations: PersonalizedRecommendationsResult | null;
  actionPlan: ActionPlanResult | null;
  rawResponses: {
    intake: string;
    skillGap: string;
    recommendations: string;
    actionPlan: string;
  };
  errors: string[];
}

/**
 * Action plan task (from 30-day plan)
 */
export interface ActionPlanTask {
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
}

/**
 * Action plan week
 */
export interface ActionPlanWeek {
  week_number: 1 | 2 | 3 | 4;
  theme: string;
  tasks: ActionPlanTask[];
}

/**
 * Action plan result
 */
export interface ActionPlanResult {
  overview: {
    primary_focus_skill: string;
    total_tasks: number;
    estimated_total_hours: number;
    reasoning_summary: string;
  };
  weeks: ActionPlanWeek[];
  confidence_note: string;
}

/**
 * Skill consistency result - measures percentage similarity between baseline and variant
 */
export interface SkillConsistencyResult {
  /** Overall consistency percentage (100% = identical) */
  consistency_percentage: number;
  /** Per-skill absolute differences (0-100 scale) */
  skill_differences: {
    problem_solving: number;
    communication: number;
    technical_skills: number;
    creativity: number;
    leadership: number;
    self_management: number;
  };
  /** Average difference across all skills */
  average_difference: number;
  /** Per-skill confidence values for baseline */
  baseline_scores: {
    problem_solving: number;
    communication: number;
    technical_skills: number;
    creativity: number;
    leadership: number;
    self_management: number;
  };
  /** Per-skill confidence values for variant */
  variant_scores: {
    problem_solving: number;
    communication: number;
    technical_skills: number;
    creativity: number;
    leadership: number;
    self_management: number;
  };
}

/**
 * Comparison result for a single variant against original
 */
export interface VariantComparisonResult {
  profile_id: string;
  variant: PerturbationType;
  /** NEW: Skill consistency measurement */
  skill_consistency: SkillConsistencyResult;
  skill_attribution_consistency: "consistent" | "inconsistent";
  skill_attribution_details: {
    skillsChanged: string[];
    unexpectedChanges: string[];
    reasoning: string;
  };
  hallucinations_detected: boolean;
  hallucination_details: {
    untracedSkills: string[];
    untracedRecommendations: string[];
    untracedPlanSteps: string[];
    reasoning: string;
  };
  recommendation_stability: "stable" | "unstable";
  recommendation_stability_details: {
    categoriesChanged: string[];
    significantRankingChanges: boolean;
    reasoning: string;
  };
  action_plan_sensitivity: "appropriate" | "inappropriate";
  action_plan_sensitivity_details: {
    planChangesProportion: "proportional" | "disproportional" | "unchanged";
    unrelatedStepsAdded: string[];
    reasoning: string;
  };
}

/**
 * Single test run result with full data
 */
export interface PerturbationTestRun {
  id: string;
  timestamp: Date;
  variant: ProfileVariant;
  originalResults: PipelineResults | null;
  variantResults: PipelineResults;
  comparison: VariantComparisonResult;
  executionTimeMs: number;
}

/**
 * Summary statistics
 */
export interface PerturbationSummary {
  consistent_attribution_count: number;
  hallucination_count: number;
  stable_recommendations_count: number;
  appropriate_action_plans_count: number;
  /** Average skill consistency across all variants */
  average_skill_consistency: number;
  /** Skill consistency breakdown by variant type */
  skill_consistency_by_variant: {
    rephrased: number;
    removed_detail: number;
    added_irrelevant: number;
  };
}

/**
 * Percentage metrics for PDF
 */
export interface PerturbationMetrics {
  skillAttributionConsistencyRate: number;
  hallucinationRate: number;
  recommendationStabilityRate: number;
  actionPlanAppropriatenessRate: number;
  /** Average skill consistency percentage (100% = identical outputs) */
  averageSkillConsistency: number;
  /** Skill consistency by variant type for summary table */
  skillConsistencyByVariant: {
    original: number;
    rephrased: number;
    removal: number;
    injection: number;
  };
}

/**
 * Complete test session result (the final JSON output)
 */
export interface PerturbationTestResult {
  profiles_tested: number;
  total_runs: number;
  results: VariantComparisonResult[];
  summary: PerturbationSummary;
  metrics: PerturbationMetrics;
  timestamp: string;
  execution_time_total_ms: number;
  /** Summary table for documentation/PDF export */
  skill_consistency_table: SkillConsistencySummaryRow[];
}

/**
 * Row format for skill consistency summary table (for documentation)
 */
export interface SkillConsistencySummaryRow {
  input_variant: string;
  skill_consistency: number;
  description: string;
}

/**
 * Test session state for UI
 */
export interface PerturbationTestSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  status: "idle" | "running" | "completed" | "error";
  progress: {
    current: number;
    total: number;
    currentProfileName: string;
    currentVariantType: PerturbationType;
  };
  runs: PerturbationTestRun[];
  finalResult: PerturbationTestResult | null;
  error: string | null;
}

/**
 * Configuration for perturbation testing
 */
export interface PerturbationConfig {
  selectedProfileIds: string[];
  runInjection: boolean;
  runRemoval: boolean;
  runRephrasing: boolean;
  skipActionPlan: boolean; // Can skip for faster testing
}
