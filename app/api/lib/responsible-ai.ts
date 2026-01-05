/**
 * =============================================================================
 * RESPONSIBLE AI UTILITIES
 * =============================================================================
 *
 * PURPOSE:
 * Centralized utilities for responsible AI practices including:
 * - Inferred evidence detection for Problem Solving
 * - Growth cap enforcement
 * - Short-term vs long-term target separation
 * - Recommendation freshness validation
 * - Evidence attribution types
 *
 * =============================================================================
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Evidence attribution type for transparency
 */
export type EvidenceAttributionType = "explicit" | "inferred" | "missing";

/**
 * Inferred evidence metadata
 */
export interface InferredEvidenceMetadata {
  attribution_type: EvidenceAttributionType;
  inference_sources?: string[];
  inference_justification?: string;
}

/**
 * Skill signal with evidence attribution
 */
export interface EnhancedSkillSignal {
  evidence_found: boolean;
  evidence_phrases: string[];
  evidence_sources: string[];
  confidence: number;
  reasoning: string;
  attribution_type: EvidenceAttributionType;
  inference_sources?: string[];
  inference_justification?: string;
}

/**
 * Skill gap with separated short-term and long-term targets
 * Extends the original schema with responsible AI fields
 */
export interface EnhancedSkillGap {
  skill: string;
  // Original fields (maintain compatibility)
  current_level: number;
  goal_level: number;
  gap: number;
  expected_level_after: number;
  timeline: string;
  why_it_matters: string;
  actionable_steps: Array<{
    step: string;
    time_required: string;
    expected_impact: string;
    priority: "high" | "medium" | "low";
    why: string;
  }>;
  reasoning: string;
  // Responsible AI enhancements
  current_score: number;
  expected_30_day_score: number;
  long_term_target_score: number;
  attribution_type: EvidenceAttributionType;
}

/**
 * Recommendation validation status
 */
export interface RecommendationValidation {
  is_active: boolean;
  last_verified_date: string;
  replacement_log?: {
    original_title: string;
    replaced_with: string;
    reason: string;
    replaced_at: string;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Maximum skill improvement allowed in 30 days
 */
export const MAX_30_DAY_IMPROVEMENT = 25;

/**
 * Baseline score range for inferred problem-solving evidence
 */
export const INFERRED_PROBLEM_SOLVING_MIN = 40;
export const INFERRED_PROBLEM_SOLVING_MAX = 55;

/**
 * Keywords indicating technical teaching/mentoring
 */
export const TECHNICAL_TEACHING_KEYWORDS = [
  "taught", "teaching", "mentor", "mentored", "mentoring",
  "tutored", "tutoring", "explained coding", "explained programming",
  "helped students", "assisted students", "trained", "training",
  "coached", "coaching", "led workshop", "ran workshop",
  "instructor", "facilitated"
];

/**
 * Keywords indicating competitive awards
 */
export const COMPETITIVE_AWARD_KEYWORDS = [
  "hackathon", "won", "winner", "award", "awarded", "prize",
  "competition", "competed", "finalist", "placed", "rank",
  "first place", "second place", "third place", "champion",
  "state", "national", "regional", "olympiad", "contest",
  "stem", "science fair", "math competition", "robotics competition"
];

/**
 * Keywords indicating complex project-based activities
 */
export const COMPLEX_PROJECT_KEYWORDS = [
  "app", "application", "built", "developed", "created",
  "robot", "robotics", "research", "project", "engineered",
  "designed system", "implemented", "programmed", "coded",
  "software", "hardware", "machine learning", "ai", "algorithm",
  "database", "website", "web app", "mobile app", "automation"
];

/**
 * Known discontinued programs (for recommendation validation)
 */
export const DISCONTINUED_PROGRAMS: Record<string, { discontinued_date: string; alternative: string }> = {
  "Google Code-in": {
    discontinued_date: "2020-01-01",
    alternative: "Google Summer of Code (GSoC) or Google Season of Docs"
  },
  "GCI": {
    discontinued_date: "2020-01-01",
    alternative: "Google Summer of Code (GSoC) or Google Season of Docs"
  },
  "Facebook University": {
    discontinued_date: "2022-01-01",
    alternative: "Meta University Engineering Program"
  },
  "Uber Career Prep": {
    discontinued_date: "2023-06-01",
    alternative: "MLH Fellowship or Major League Hacking programs"
  },
  "Twitter University": {
    discontinued_date: "2022-11-01",
    alternative: "X Engineering Internship Program"
  },
  "Yahoo BOSS API": {
    discontinued_date: "2016-01-01",
    alternative: "Bing Search API or Google Custom Search API"
  }
};

/**
 * Known active programs with verification dates
 */
export const VERIFIED_ACTIVE_PROGRAMS: Record<string, string> = {
  "Google Summer of Code": "2025-12-01",
  "MLH Fellowship": "2025-12-01",
  "Coursera": "2025-12-01",
  "edX": "2025-12-01",
  "Khan Academy": "2025-12-01",
  "freeCodeCamp": "2025-12-01",
  "Codecademy": "2025-12-01",
  "MIT OpenCourseWare": "2025-12-01",
  "Harvard CS50": "2025-12-01",
  "Udacity": "2025-12-01",
  "Pluralsight": "2025-12-01",
  "LinkedIn Learning": "2025-12-01",
  "Science Olympiad": "2025-12-01",
  "FIRST Robotics": "2025-12-01",
  "American Mathematics Competitions": "2025-12-01",
  "USA Computing Olympiad": "2025-12-01",
  "Congressional App Challenge": "2025-12-01",
  "Regeneron Science Talent Search": "2025-12-01",
  "Intel ISEF": "2025-12-01",
  "MATHCOUNTS": "2025-12-01",
  "National History Day": "2025-12-01",
  "Scholastic Art & Writing Awards": "2025-12-01",
  "Model UN": "2025-12-01",
  "Debate": "2025-12-01",
  "DECA": "2025-12-01",
  "FBLA": "2025-12-01",
  "SkillsUSA": "2025-12-01"
};

// =============================================================================
// INFERRED EVIDENCE DETECTION
// =============================================================================

/**
 * Detects if text contains evidence of technical teaching/mentoring
 */
export function detectTechnicalTeaching(text: string): boolean {
  const lowerText = text.toLowerCase();
  return TECHNICAL_TEACHING_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Detects if text contains evidence of competitive awards
 */
export function detectCompetitiveAwards(text: string): boolean {
  const lowerText = text.toLowerCase();
  return COMPETITIVE_AWARD_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Detects if text contains evidence of complex project-based activities
 */
export function detectComplexProjects(text: string): boolean {
  const lowerText = text.toLowerCase();
  return COMPLEX_PROJECT_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Determines if problem-solving evidence should be inferred
 * Returns inference metadata if applicable
 */
export function shouldInferProblemSolving(
  combinedText: string,
  existingConfidence: number
): InferredEvidenceMetadata | null {
  // Only infer if existing confidence is low
  if (existingConfidence >= 0.4) {
    return null;
  }

  const inferenceSources: string[] = [];
  
  const hasTechnicalTeaching = detectTechnicalTeaching(combinedText);
  const hasCompetitiveAwards = detectCompetitiveAwards(combinedText);
  const hasComplexProjects = detectComplexProjects(combinedText);

  if (hasTechnicalTeaching) inferenceSources.push("technical_teaching_mentoring");
  if (hasCompetitiveAwards) inferenceSources.push("competitive_awards");
  if (hasComplexProjects) inferenceSources.push("complex_project_activities");

  // Need at least 2 of 3 signals to infer problem-solving
  if (inferenceSources.length >= 2) {
    return {
      attribution_type: "inferred",
      inference_sources: inferenceSources,
      inference_justification: `Problem-solving skills inferred from ${inferenceSources.join(" and ").replace(/_/g, " ")}. These activities inherently require analytical thinking and solution development.`
    };
  }

  return null;
}

/**
 * Calculates inferred problem-solving confidence score
 * Range: 40-55% based on strength of evidence
 */
export function calculateInferredProblemSolvingScore(inferenceSources: string[]): number {
  const baseScore = INFERRED_PROBLEM_SOLVING_MIN;
  const bonusPerSource = 5;
  
  // Calculate score: 40% base + 5% per additional source (beyond 2)
  const score = baseScore + ((inferenceSources.length - 2) * bonusPerSource);
  
  return Math.min(score, INFERRED_PROBLEM_SOLVING_MAX) / 100;
}

/**
 * Applies inferred evidence rules to skill signals
 */
export function applyInferredEvidenceRules(
  skillSignals: Record<string, {
    evidence_found: boolean;
    evidence_phrases: string[];
    evidence_sources: string[];
    confidence: number;
    reasoning: string;
  }>,
  combinedText: string
): Record<string, EnhancedSkillSignal> {
  const enhanced: Record<string, EnhancedSkillSignal> = {};

  for (const [skill, signal] of Object.entries(skillSignals)) {
    // Determine attribution type
    let attributionType: EvidenceAttributionType = signal.evidence_found ? "explicit" : "missing";
    let inferenceMetadata: InferredEvidenceMetadata | null = null;

    // Special handling for problem_solving
    if (skill === "problem_solving" && !signal.evidence_found) {
      inferenceMetadata = shouldInferProblemSolving(combinedText, signal.confidence);
      
      if (inferenceMetadata) {
        // Apply inferred evidence
        const inferredScore = calculateInferredProblemSolvingScore(inferenceMetadata.inference_sources || []);
        
        enhanced[skill] = {
          evidence_found: true, // Now has inferred evidence
          evidence_phrases: signal.evidence_phrases.length > 0 
            ? signal.evidence_phrases 
            : ["[Inferred from related activities]"],
          evidence_sources: signal.evidence_sources.length > 0 
            ? signal.evidence_sources 
            : ["past_activities", "achievements"],
          confidence: inferredScore,
          reasoning: `${inferenceMetadata.inference_justification} Original confidence was ${Math.round(signal.confidence * 100)}%, adjusted to ${Math.round(inferredScore * 100)}% based on inferred evidence.`,
          attribution_type: "inferred",
          inference_sources: inferenceMetadata.inference_sources,
          inference_justification: inferenceMetadata.inference_justification
        };
        continue;
      }
    }

    // For other skills or when no inference applies
    enhanced[skill] = {
      ...signal,
      attribution_type: attributionType,
      inference_sources: undefined,
      inference_justification: undefined
    };
  }

  return enhanced;
}

// =============================================================================
// GROWTH CAP ENFORCEMENT
// =============================================================================

/**
 * Enforces the 30-day growth cap on expected improvements
 */
export function enforceGrowthCap(
  currentScore: number,
  proposedScore: number,
  maxImprovement: number = MAX_30_DAY_IMPROVEMENT
): { expected_30_day_score: number; long_term_target_score: number; capped: boolean } {
  const proposedImprovement = proposedScore - currentScore;
  
  if (proposedImprovement <= maxImprovement) {
    return {
      expected_30_day_score: proposedScore,
      long_term_target_score: proposedScore,
      capped: false
    };
  }

  // Cap applied - separate short-term and long-term
  return {
    expected_30_day_score: Math.min(currentScore + maxImprovement, 100),
    long_term_target_score: proposedScore,
    capped: true
  };
}

/**
 * Applies growth caps to skill gap results
 */
export function applyGrowthCapsToSkillGaps(
  skillGaps: Array<{
    skill: string;
    current_level: number;
    goal_level: number;
    gap: number;
    expected_level_after: number;
    timeline: string;
    why_it_matters: string;
    actionable_steps: Array<{
      step: string;
      time_required: string;
      expected_impact: string;
      priority: "high" | "medium" | "low";
      why: string;
    }>;
    reasoning: string;
  }>
): EnhancedSkillGap[] {
  return skillGaps.map(gap => {
    const cappedResult = enforceGrowthCap(gap.current_level, gap.expected_level_after);
    
    // Determine attribution type based on current evidence
    const attributionType: EvidenceAttributionType = 
      gap.current_level > 30 ? "explicit" : 
      gap.current_level > 15 ? "inferred" : "missing";

    // Update reasoning if capped
    let updatedReasoning = gap.reasoning;
    if (cappedResult.capped) {
      updatedReasoning += ` Note: Expected 30-day improvement capped at +${MAX_30_DAY_IMPROVEMENT}%. The goal level of ${gap.goal_level}% is a long-term target.`;
    }

    return {
      // Original fields (maintain compatibility)
      skill: gap.skill,
      current_level: gap.current_level,
      goal_level: gap.goal_level,
      gap: gap.gap,
      expected_level_after: cappedResult.expected_30_day_score, // Use capped value
      timeline: cappedResult.capped ? "30 days (long-term target requires additional time)" : gap.timeline,
      why_it_matters: gap.why_it_matters,
      actionable_steps: gap.actionable_steps,
      reasoning: updatedReasoning,
      // Responsible AI enhancements
      current_score: gap.current_level,
      expected_30_day_score: cappedResult.expected_30_day_score,
      long_term_target_score: cappedResult.long_term_target_score,
      attribution_type: attributionType
    };
  });
}

/**
 * Applies growth caps to 30-day plan tasks
 */
export function applyGrowthCapsToPlanTasks(
  weeks: Array<{
    week_number: 1 | 2 | 3 | 4;
    theme: string;
    tasks: Array<{
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
    }>;
  }>,
  skillSnapshots: Record<string, number>
): Array<{
  week_number: 1 | 2 | 3 | 4;
  theme: string;
  tasks: Array<{
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
    gain_capped?: boolean;
  }>;
}> {
  // Track cumulative gains per skill across all weeks
  const cumulativeGains: Record<string, number> = {};

  return weeks.map(week => ({
    ...week,
    tasks: week.tasks.map(task => {
      const skill = task.related_skill.toLowerCase().replace(/\s+/g, '_');
      const currentCumulative = cumulativeGains[skill] || 0;
      const remainingAllowedGain = MAX_30_DAY_IMPROVEMENT - currentCumulative;
      
      let adjustedGain = task.expected_skill_gain;
      let gainCapped = false;

      if (task.expected_skill_gain > remainingAllowedGain) {
        adjustedGain = Math.max(0, remainingAllowedGain);
        gainCapped = true;
      }

      cumulativeGains[skill] = currentCumulative + adjustedGain;

      return {
        ...task,
        expected_skill_gain: adjustedGain,
        reasoning: gainCapped 
          ? `${task.reasoning} (Gain adjusted to maintain 30-day cap of +${MAX_30_DAY_IMPROVEMENT}%)`
          : task.reasoning,
        gain_capped: gainCapped
      };
    })
  }));
}

// =============================================================================
// RECOMMENDATION FRESHNESS VALIDATION
// =============================================================================

/**
 * Validates a recommendation for freshness and active status
 */
export function validateRecommendationFreshness(
  title: string,
  platform: string
): RecommendationValidation {
  const normalizedTitle = title.toLowerCase();
  const normalizedPlatform = platform.toLowerCase();
  const currentDate = new Date().toISOString().split('T')[0];

  // Check against discontinued programs
  for (const [program, info] of Object.entries(DISCONTINUED_PROGRAMS)) {
    if (normalizedTitle.includes(program.toLowerCase()) || 
        normalizedPlatform.includes(program.toLowerCase())) {
      return {
        is_active: false,
        last_verified_date: info.discontinued_date,
        replacement_log: {
          original_title: title,
          replaced_with: info.alternative,
          reason: `${program} was discontinued as of ${info.discontinued_date}`,
          replaced_at: currentDate
        }
      };
    }
  }

  // Check against verified active programs
  for (const [program, verifiedDate] of Object.entries(VERIFIED_ACTIVE_PROGRAMS)) {
    if (normalizedTitle.includes(program.toLowerCase()) || 
        normalizedPlatform.includes(program.toLowerCase())) {
      return {
        is_active: true,
        last_verified_date: verifiedDate
      };
    }
  }

  // Default: assume active but mark as unverified
  return {
    is_active: true,
    last_verified_date: "unverified"
  };
}

/**
 * Processes recommendations to replace outdated programs
 */
export function processRecommendationsForFreshness<T extends {
  title: string;
  platform_or_provider: string;
  reasoning: string;
}>(recommendations: T[]): { processed: T[]; replacements: RecommendationValidation[] } {
  const processed: T[] = [];
  const replacements: RecommendationValidation[] = [];

  for (const rec of recommendations) {
    const validation = validateRecommendationFreshness(rec.title, rec.platform_or_provider);
    
    if (!validation.is_active && validation.replacement_log) {
      // Log the replacement
      replacements.push(validation);
      
      // Update the recommendation with the alternative
      processed.push({
        ...rec,
        title: `Alternative: ${validation.replacement_log.replaced_with}`,
        reasoning: `${rec.reasoning} (Note: Original recommendation "${validation.replacement_log.original_title}" was replaced as it is no longer active. ${validation.replacement_log.reason})`
      });
    } else {
      processed.push(rec);
    }
  }

  return { processed, replacements };
}

// =============================================================================
// EXPLAINABILITY HELPERS
// =============================================================================

/**
 * Generates evidence attribution explanation
 */
export function generateAttributionExplanation(
  attributionType: EvidenceAttributionType,
  skillName: string,
  inferenceSources?: string[]
): string {
  switch (attributionType) {
    case "explicit":
      return `Evidence for ${skillName} was directly identified in the student's profile.`;
    case "inferred":
      const sources = inferenceSources?.map(s => s.replace(/_/g, " ")).join(", ") || "related activities";
      return `Evidence for ${skillName} was inferred from ${sources}. This is a derived assessment based on activities that inherently require this skill.`;
    case "missing":
      return `No clear evidence for ${skillName} was found in the student's profile. This represents an opportunity for development.`;
    default:
      return "";
  }
}

/**
 * Creates a summary of attribution types for all skills
 */
export function createAttributionSummary(
  skills: Record<string, { attribution_type: EvidenceAttributionType }>
): {
  explicit_count: number;
  inferred_count: number;
  missing_count: number;
  skills_by_type: Record<EvidenceAttributionType, string[]>;
} {
  const summary = {
    explicit_count: 0,
    inferred_count: 0,
    missing_count: 0,
    skills_by_type: {
      explicit: [] as string[],
      inferred: [] as string[],
      missing: [] as string[]
    }
  };

  for (const [skill, data] of Object.entries(skills)) {
    switch (data.attribution_type) {
      case "explicit":
        summary.explicit_count++;
        summary.skills_by_type.explicit.push(skill);
        break;
      case "inferred":
        summary.inferred_count++;
        summary.skills_by_type.inferred.push(skill);
        break;
      case "missing":
        summary.missing_count++;
        summary.skills_by_type.missing.push(skill);
        break;
    }
  }

  return summary;
}

// =============================================================================
// VALIDATION ASSERTIONS
// =============================================================================

/**
 * Validates that growth caps are not exceeded
 */
export function validateGrowthCaps(
  skillGaps: Array<{ current_score?: number; current_level?: number; expected_30_day_score?: number; expected_level_after?: number }>
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  for (const gap of skillGaps) {
    const current = gap.current_score ?? gap.current_level ?? 0;
    const expected = gap.expected_30_day_score ?? gap.expected_level_after ?? 0;
    const improvement = expected - current;

    if (improvement > MAX_30_DAY_IMPROVEMENT) {
      violations.push(`Growth exceeds cap: ${current}% → ${expected}% (+${improvement}%, max allowed: +${MAX_30_DAY_IMPROVEMENT}%)`);
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Validates that short-term and long-term targets are properly separated
 */
export function validateTargetSeparation(
  skillGaps: Array<{ expected_30_day_score?: number; long_term_target_score?: number }>
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const gap of skillGaps) {
    if (gap.expected_30_day_score === undefined || gap.long_term_target_score === undefined) {
      issues.push("Missing expected_30_day_score or long_term_target_score field");
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Validates that no outdated recommendations appear in output
 */
export function validateNoOutdatedRecommendations(
  recommendations: Array<{ title: string; platform_or_provider: string }>
): { valid: boolean; outdated: string[] } {
  const outdated: string[] = [];

  for (const rec of recommendations) {
    const validation = validateRecommendationFreshness(rec.title, rec.platform_or_provider);
    if (!validation.is_active) {
      outdated.push(`${rec.title} (${rec.platform_or_provider})`);
    }
  }

  return {
    valid: outdated.length === 0,
    outdated
  };
}

/**
 * Validates that inferred evidence doesn't trigger hallucinations
 */
export function validateInferredEvidenceIntegrity(
  skillSignals: Record<string, EnhancedSkillSignal>,
  originalText: string
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerText = originalText.toLowerCase();

  for (const [skill, signal] of Object.entries(skillSignals)) {
    if (signal.attribution_type === "inferred") {
      // Ensure inference sources are actually present in text
      if (signal.inference_sources) {
        for (const source of signal.inference_sources) {
          let foundEvidence = false;
          
          switch (source) {
            case "technical_teaching_mentoring":
              foundEvidence = detectTechnicalTeaching(lowerText);
              break;
            case "competitive_awards":
              foundEvidence = detectCompetitiveAwards(lowerText);
              break;
            case "complex_project_activities":
              foundEvidence = detectComplexProjects(lowerText);
              break;
          }

          if (!foundEvidence) {
            issues.push(`${skill}: Claimed inference source "${source}" not found in original text`);
          }
        }
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
