// =============================================================================
// COMPARISON & ANALYSIS LOGIC
// =============================================================================
// Purpose: Compare original vs variant outputs to detect inconsistencies,
//          hallucinations, and inappropriate changes
// =============================================================================

import type { StudentProfile, AIAnalysisResult, SkillGapAnalysisResult, PersonalizedRecommendationsResult } from "../testing-playground/types";
import type {
  ProfileVariant,
  PipelineResults,
  VariantComparisonResult,
  ActionPlanResult,
  PerturbationType,
  EvidenceItem,
  SkillConsistencyResult,
  PerturbationSummary,
  PerturbationMetrics,
  SkillConsistencySummaryRow,
} from "./types";

// =============================================================================
// SKILL CONSISTENCY CALCULATION
// =============================================================================

/**
 * The 6 core skills measured by the system
 */
const CORE_SKILLS = [
  "problem_solving",
  "communication",
  "technical_skills",
  "creativity",
  "leadership",
  "self_management",
] as const;

type CoreSkill = typeof CORE_SKILLS[number];

/**
 * Calculate skill consistency between baseline and variant outputs.
 * 
 * Skill Consistency Definition:
 * - Measure percentage similarity between baseline and variant skill scores
 * - Compute absolute difference per skill (on 0-100 scale)
 * - Average difference across all 6 skills
 * - Convert to percentage similarity (100% = identical)
 * 
 * @param baselineResults - Original pipeline intake analysis results
 * @param variantResults - Variant pipeline intake analysis results
 * @returns SkillConsistencyResult with detailed breakdown
 */
export function calculateSkillConsistency(
  baselineResults: AIAnalysisResult | null,
  variantResults: AIAnalysisResult | null
): SkillConsistencyResult {
  // Default scores if no results
  const defaultScores: SkillConsistencyResult["baseline_scores"] = {
    problem_solving: 0,
    communication: 0,
    technical_skills: 0,
    creativity: 0,
    leadership: 0,
    self_management: 0,
  };

  // If no baseline, return 100% consistency (original profile)
  if (!baselineResults) {
    const variantScores = variantResults 
      ? extractSkillScores(variantResults)
      : { ...defaultScores };
    
    return {
      consistency_percentage: 100,
      skill_differences: { ...defaultScores },
      average_difference: 0,
      baseline_scores: variantScores,
      variant_scores: variantScores,
    };
  }

  // If no variant results, return 0% consistency
  if (!variantResults) {
    const baselineScores = extractSkillScores(baselineResults);
    return {
      consistency_percentage: 0,
      skill_differences: {
        problem_solving: 100,
        communication: 100,
        technical_skills: 100,
        creativity: 100,
        leadership: 100,
        self_management: 100,
      },
      average_difference: 100,
      baseline_scores: baselineScores,
      variant_scores: { ...defaultScores },
    };
  }

  // Extract confidence scores (0-1 scale) and convert to 0-100
  const baselineScores = extractSkillScores(baselineResults);
  const variantScores = extractSkillScores(variantResults);

  // Calculate absolute differences for each skill
  const skill_differences: SkillConsistencyResult["skill_differences"] = {
    problem_solving: 0,
    communication: 0,
    technical_skills: 0,
    creativity: 0,
    leadership: 0,
    self_management: 0,
  };

  let totalDifference = 0;

  for (const skill of CORE_SKILLS) {
    const baselineScore = baselineScores[skill];
    const variantScore = variantScores[skill];
    const difference = Math.abs(variantScore - baselineScore);
    skill_differences[skill] = Math.round(difference * 10) / 10; // Round to 1 decimal
    totalDifference += difference;
  }

  // Calculate average difference
  const average_difference = Math.round((totalDifference / CORE_SKILLS.length) * 10) / 10;

  // Convert to percentage similarity (100% - average_difference)
  // Since scores are 0-100, max difference is 100
  const consistency_percentage = Math.max(0, Math.round(100 - average_difference));

  return {
    consistency_percentage,
    skill_differences,
    average_difference,
    baseline_scores: baselineScores,
    variant_scores: variantScores,
  };
}

/**
 * Extract skill confidence scores from AI analysis results and convert to 0-100 scale
 */
function extractSkillScores(results: AIAnalysisResult): SkillConsistencyResult["baseline_scores"] {
  return {
    problem_solving: Math.round((results.problem_solving?.confidence || 0) * 100),
    communication: Math.round((results.communication?.confidence || 0) * 100),
    technical_skills: Math.round((results.technical_skills?.confidence || 0) * 100),
    creativity: Math.round((results.creativity?.confidence || 0) * 100),
    leadership: Math.round((results.leadership?.confidence || 0) * 100),
    self_management: Math.round((results.self_management?.confidence || 0) * 100),
  };
}

// =============================================================================
// SKILL ATTRIBUTION CONSISTENCY
// =============================================================================

/**
 * Check if skill changes are consistent with evidence changes
 * 
 * Rules:
 * - Skills should only change if evidence changes
 * - Rephrasing must NOT introduce new skills
 * - Added evidence should potentially add skills
 * - Removed evidence should potentially reduce skills
 */
export function checkSkillAttributionConsistency(
  profileVariant: ProfileVariant,
  originalResults: AIAnalysisResult | null,
  variantResults: AIAnalysisResult | null
): {
  isConsistent: boolean;
  skillsChanged: string[];
  unexpectedChanges: string[];
  reasoning: string;
} {
  if (!originalResults || !variantResults) {
    return {
      isConsistent: false,
      skillsChanged: [],
      unexpectedChanges: [],
      reasoning: "Missing pipeline results for comparison",
    };
  }

  const skills = [
    "problem_solving",
    "communication",
    "technical_skills",
    "creativity",
    "leadership",
    "self_management",
  ] as const;

  const skillsChanged: string[] = [];
  const unexpectedChanges: string[] = [];
  const reasons: string[] = [];

  // Define significant confidence change threshold
  const CONFIDENCE_THRESHOLD = 0.15;
  const EVIDENCE_COUNT_THRESHOLD = 1;

  for (const skill of skills) {
    const originalSignal = originalResults[skill];
    const variantSignal = variantResults[skill];

    // Skip if either signal is undefined
    if (!originalSignal || !variantSignal) {
      continue;
    }

    // Check for confidence changes
    const confidenceDelta = Math.abs((variantSignal.confidence || 0) - (originalSignal.confidence || 0));
    const evidenceCountDelta = Math.abs(
      (variantSignal.evidence_phrases?.length || 0) - (originalSignal.evidence_phrases?.length || 0)
    );

    if (confidenceDelta > CONFIDENCE_THRESHOLD || evidenceCountDelta >= EVIDENCE_COUNT_THRESHOLD) {
      skillsChanged.push(skill);

      // Determine if change is expected based on perturbation type
      if (profileVariant.variantType === "rephrased") {
        // Rephrasing should NOT significantly change skills
        if (confidenceDelta > CONFIDENCE_THRESHOLD) {
          unexpectedChanges.push(skill);
          reasons.push(
            `${skill}: Confidence changed by ${confidenceDelta.toFixed(2)} despite only rephrasing (expected no significant change)`
          );
        }
        if (evidenceCountDelta >= 2) {
          unexpectedChanges.push(skill);
          reasons.push(
            `${skill}: Evidence count changed by ${evidenceCountDelta} despite only rephrasing`
          );
        }
      } else if (profileVariant.variantType === "injection") {
        // Injection should potentially increase skills related to added evidence
        const addedEvidence = profileVariant.addedEvidence || [];
        const relatedToInjection = addedEvidence.some((e: EvidenceItem) => 
          e.relatedSkills.includes(skill.replace("_", " ")) || 
          e.relatedSkills.includes(skill)
        );
        
        if (!relatedToInjection && (variantSignal.confidence || 0) > (originalSignal.confidence || 0) + CONFIDENCE_THRESHOLD) {
          unexpectedChanges.push(skill);
          reasons.push(
            `${skill}: Increased despite not being related to injected evidence`
          );
        }
      } else if (profileVariant.variantType === "removal") {
        // Removal should potentially decrease skills related to removed evidence
        const removedEvidence = profileVariant.removedEvidence || [];
        const relatedToRemoval = removedEvidence.some((e: EvidenceItem) => 
          e.relatedSkills.includes(skill.replace("_", " ")) || 
          e.relatedSkills.includes(skill)
        );
        
        if (!relatedToRemoval && (variantSignal.confidence || 0) < (originalSignal.confidence || 0) - CONFIDENCE_THRESHOLD) {
          unexpectedChanges.push(skill);
          reasons.push(
            `${skill}: Decreased despite not being related to removed evidence`
          );
        }
      }
    }
  }

  // Special handling for rephrasing - it should be highly consistent
  const isConsistent = profileVariant.variantType === "rephrased" 
    ? unexpectedChanges.length === 0 && skillsChanged.length <= 1
    : unexpectedChanges.length === 0;

  return {
    isConsistent,
    skillsChanged: [...new Set(skillsChanged)],
    unexpectedChanges: [...new Set(unexpectedChanges)],
    reasoning: reasons.length > 0 
      ? reasons.join("; ") 
      : `Skill changes are consistent with ${profileVariant.variantType} perturbation`,
  };
}

// =============================================================================
// HALLUCINATION DETECTION
// =============================================================================

/**
 * Build a comprehensive text corpus from the profile for evidence tracing
 */
function buildEvidenceCorpus(profile: StudentProfile): string {
  const parts = [
    profile.interests_free_text || "",
    profile.goals_free_text || "",
    profile.past_activities || "",
    profile.past_achievements || "",
    profile.challenges || "",
    (profile.goals_selected || []).join(" "),
    (profile.learning_preferences || []).join(" "),
  ];
  return parts.join(" ").toLowerCase();
}

/**
 * Check if a phrase can be traced to the input evidence
 */
function isPhraseTraceable(phrase: string, corpus: string): boolean {
  const normalizedPhrase = phrase.toLowerCase().trim();
  
  // Direct match
  if (corpus.includes(normalizedPhrase)) {
    return true;
  }
  
  // Word-level match (at least 60% of significant words should be in corpus)
  const words = normalizedPhrase.split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) return true; // Short phrases are acceptable
  
  const foundWords = words.filter(word => corpus.includes(word));
  return foundWords.length >= words.length * 0.5;
}

/**
 * Detect hallucinations in the pipeline results
 * 
 * A hallucination is flagged when:
 * - Any skill evidence phrase is not traceable to input text
 * - Any recommendation reasoning references non-existent evidence
 * - Any action plan step is not traceable to recommendations or evidence
 */
export function detectHallucinations(
  profile: StudentProfile,
  results: PipelineResults
): {
  hasHallucinations: boolean;
  untracedSkills: string[];
  untracedRecommendations: string[];
  untracedPlanSteps: string[];
  reasoning: string;
} {
  const corpus = buildEvidenceCorpus(profile);
  const untracedSkills: string[] = [];
  const untracedRecommendations: string[] = [];
  const untracedPlanSteps: string[] = [];
  const reasons: string[] = [];

  // Check intake analysis evidence phrases
  if (results.intakeAnalysis) {
    const skills = [
      "problem_solving",
      "communication",
      "technical_skills",
      "creativity",
      "leadership",
      "self_management",
    ] as const;

    for (const skill of skills) {
      const signal = results.intakeAnalysis[skill];
      // Add null check for signal
      if (signal && signal.evidence_found && signal.evidence_phrases && signal.evidence_phrases.length > 0) {
        for (const phrase of signal.evidence_phrases) {
          if (!isPhraseTraceable(phrase, corpus)) {
            untracedSkills.push(`${skill}: "${phrase}"`);
            reasons.push(`Evidence phrase "${phrase}" for ${skill} not found in input`);
          }
        }
      }
    }
  }

  // Check recommendations reasoning
  if (results.recommendations) {
    const allRecommendations = [
      ...(results.recommendations.courses || []),
      ...(results.recommendations.projects || []),
      ...(results.recommendations.competitions || []),
    ];

    for (const rec of allRecommendations) {
      // Check if reasoning references things not in the profile
      const reasoning = rec.reasoning?.toLowerCase() || "";
      
      // Look for specific claims in reasoning that might be hallucinated
      const claimPatterns = [
        /student (?:has|mentioned|demonstrated|showed|exhibited) ([^,.]+)/gi,
        /based on (?:the student's|their) ([^,.]+)/gi,
        /given (?:the student's|their) ([^,.]+)/gi,
      ];

      for (const pattern of claimPatterns) {
        const matches = reasoning.matchAll(pattern);
        for (const match of matches) {
          const claim = match[1]?.toLowerCase() || "";
          if (claim.length > 5 && !corpus.includes(claim.substring(0, 10))) {
            // Could be a hallucination - flag for review
            const words = claim.split(/\s+/).filter(w => w.length > 3);
            const foundWords = words.filter(word => corpus.includes(word));
            if (words.length > 2 && foundWords.length < words.length * 0.3) {
              untracedRecommendations.push(`${rec.title}: "${match[0]}"`);
              reasons.push(`Recommendation "${rec.title}" references unverified claim: "${match[0]}"`);
            }
          }
        }
      }
    }
  }

  // Check action plan tasks
  if (results.actionPlan) {
    const recommendationTitles = results.recommendations 
      ? [
          ...(results.recommendations.courses || []),
          ...(results.recommendations.projects || []),
          ...(results.recommendations.competitions || []),
        ].map(r => r.title.toLowerCase())
      : [];

    for (const week of results.actionPlan.weeks || []) {
      for (const task of week.tasks || []) {
        // Check if task evidence_source is traceable
        const evidenceSource = task.evidence_source?.toLowerCase() || "";
        const isFromRecommendation = recommendationTitles.some(title => 
          evidenceSource.includes(title) || title.includes(evidenceSource.substring(0, 20))
        );
        const isFromSkillGap = results.skillGapAnalysis?.skill_gaps?.some(gap =>
          evidenceSource.toLowerCase().includes(gap.skill.toLowerCase())
        );

        if (!isFromRecommendation && !isFromSkillGap && evidenceSource.length > 5) {
          // Check if it's at least traceable to the input
          if (!isPhraseTraceable(evidenceSource, corpus)) {
            untracedPlanSteps.push(`Week ${week.week_number}: "${task.title}"`);
            reasons.push(`Task "${task.title}" evidence source not traceable: "${evidenceSource}"`);
          }
        }
      }
    }
  }

  const hasHallucinations = 
    untracedSkills.length > 0 || 
    untracedRecommendations.length > 1 || // Allow 1 minor issue
    untracedPlanSteps.length > 0;

  return {
    hasHallucinations,
    untracedSkills,
    untracedRecommendations,
    untracedPlanSteps,
    reasoning: reasons.length > 0 
      ? reasons.slice(0, 5).join("; ") + (reasons.length > 5 ? `... and ${reasons.length - 5} more` : "")
      : "All outputs are traceable to input evidence",
  };
}

// =============================================================================
// RECOMMENDATION STABILITY
// =============================================================================

/**
 * Check if recommendations remain stable across variants
 * 
 * Stability means:
 * - High-level recommendation categories remain similar
 * - Minor ranking changes are allowed
 * - Major category shifts are flagged
 */
export function checkRecommendationStability(
  originalResults: PersonalizedRecommendationsResult | null,
  variantResults: PersonalizedRecommendationsResult | null,
  variantType: PerturbationType
): {
  isStable: boolean;
  categoriesChanged: string[];
  significantRankingChanges: boolean;
  reasoning: string;
} {
  if (!originalResults || !variantResults) {
    return {
      isStable: true, // Can't compare if missing
      categoriesChanged: [],
      significantRankingChanges: false,
      reasoning: "Missing recommendation results for comparison",
    };
  }

  const categoriesChanged: string[] = [];
  const reasons: string[] = [];

  // Extract recommendation categories and themes
  const extractThemes = (recs: PersonalizedRecommendationsResult) => {
    const themes = new Set<string>();
    const allRecs = [
      ...recs.courses.map(c => ({ ...c, category: "course" })),
      ...recs.projects.map(p => ({ ...p, category: "project" })),
      ...recs.competitions.map(c => ({ ...c, category: "competition" })),
    ];

    for (const rec of allRecs) {
      // Extract skill themes
      for (const alignment of rec.skill_alignment || []) {
        themes.add(alignment.skill.toLowerCase());
      }
      // Add category
      themes.add(rec.category);
    }
    return themes;
  };

  const originalThemes = extractThemes(originalResults);
  const variantThemes = extractThemes(variantResults);

  // Check for theme changes
  const addedThemes = [...variantThemes].filter(t => !originalThemes.has(t));
  const removedThemes = [...originalThemes].filter(t => !variantThemes.has(t));

  if (addedThemes.length > 0) {
    categoriesChanged.push(...addedThemes.map(t => `+${t}`));
    reasons.push(`New themes added: ${addedThemes.join(", ")}`);
  }
  if (removedThemes.length > 0) {
    categoriesChanged.push(...removedThemes.map(t => `-${t}`));
    reasons.push(`Themes removed: ${removedThemes.join(", ")}`);
  }

  // Check recommendation counts
  const originalCount = originalResults.courses.length + 
    originalResults.projects.length + 
    originalResults.competitions.length;
  const variantCount = variantResults.courses.length + 
    variantResults.projects.length + 
    variantResults.competitions.length;

  const countDelta = Math.abs(variantCount - originalCount);
  const significantRankingChanges = countDelta >= 3;

  if (significantRankingChanges) {
    reasons.push(`Recommendation count changed significantly: ${originalCount} -> ${variantCount}`);
  }

  // Determine stability based on perturbation type
  let isStable = true;
  
  if (variantType === "rephrased") {
    // Rephrasing should be highly stable
    isStable = categoriesChanged.length <= 1 && !significantRankingChanges;
  } else if (variantType === "injection") {
    // Injection can have some changes but should be proportional
    isStable = addedThemes.length <= 2 && removedThemes.length === 0;
  } else if (variantType === "removal") {
    // Removal can reduce recommendations
    isStable = addedThemes.length === 0 && removedThemes.length <= 2;
  }

  return {
    isStable,
    categoriesChanged,
    significantRankingChanges,
    reasoning: reasons.length > 0 
      ? reasons.join("; ") 
      : "Recommendations are stable across variants",
  };
}

// =============================================================================
// ACTION PLAN SENSITIVITY
// =============================================================================

/**
 * Check if action plan changes are proportional to evidence changes
 * 
 * Rules:
 * - Added evidence → proportionally enhanced plan
 * - Removed evidence → reduced or adjusted plan
 * - No unrelated steps should appear
 */
export function checkActionPlanSensitivity(
  variant: ProfileVariant,
  originalResults: ActionPlanResult | null,
  variantResults: ActionPlanResult | null
): {
  isAppropriate: boolean;
  planChangesProportion: "proportional" | "disproportional" | "unchanged";
  unrelatedStepsAdded: string[];
  reasoning: string;
} {
  if (!originalResults || !variantResults) {
    return {
      isAppropriate: true, // Can't compare if missing
      planChangesProportion: "unchanged",
      unrelatedStepsAdded: [],
      reasoning: "Missing action plan results for comparison",
    };
  }

  const reasons: string[] = [];
  const unrelatedStepsAdded: string[] = [];

  // Count tasks
  const countTasks = (plan: ActionPlanResult) => {
    return plan.weeks.reduce((sum, week) => sum + week.tasks.length, 0);
  };

  const originalTaskCount = countTasks(originalResults);
  const variantTaskCount = countTasks(variantResults);
  const taskDelta = variantTaskCount - originalTaskCount;

  // Extract task themes
  const extractTaskSkills = (plan: ActionPlanResult): Set<string> => {
    const skills = new Set<string>();
    for (const week of plan.weeks) {
      for (const task of week.tasks) {
        skills.add(task.related_skill.toLowerCase());
      }
    }
    return skills;
  };

  const originalSkills = extractTaskSkills(originalResults);
  const variantSkills = extractTaskSkills(variantResults);

  // Check for proportionality based on perturbation type
  let planChangesProportion: "proportional" | "disproportional" | "unchanged" = "unchanged";
  let isAppropriate = true;

  if (variant.variantType === "rephrased") {
    // Rephrasing should cause minimal to no changes
    if (Math.abs(taskDelta) > 2) {
      planChangesProportion = "disproportional";
      isAppropriate = false;
      reasons.push(`Task count changed by ${taskDelta} despite only rephrasing`);
    } else if (taskDelta !== 0) {
      planChangesProportion = "proportional";
    }

    // Check for new skill areas (shouldn't happen with rephrasing)
    const newSkills = [...variantSkills].filter(s => !originalSkills.has(s));
    if (newSkills.length > 0) {
      unrelatedStepsAdded.push(...newSkills.map(s => `New skill area: ${s}`));
      isAppropriate = false;
      reasons.push(`New skill areas introduced despite only rephrasing: ${newSkills.join(", ")}`);
    }
  } else if (variant.variantType === "injection") {
    // Injection should potentially add related tasks
    const addedEvidence = variant.addedEvidence || [];
    const addedSkills = addedEvidence.flatMap(e => e.relatedSkills.map(s => s.toLowerCase()));

    if (taskDelta > 0) {
      planChangesProportion = "proportional";
      
      // Check if new tasks are related to injected evidence
      const newSkillsInPlan = [...variantSkills].filter(s => !originalSkills.has(s));
      const unrelatedNewSkills = newSkillsInPlan.filter(s => 
        !addedSkills.some(as => as.includes(s) || s.includes(as))
      );
      
      if (unrelatedNewSkills.length > 0) {
        unrelatedStepsAdded.push(...unrelatedNewSkills);
        reasons.push(`Unrelated skill areas added: ${unrelatedNewSkills.join(", ")}`);
        isAppropriate = false;
      }
    } else if (taskDelta < -2) {
      planChangesProportion = "disproportional";
      isAppropriate = false;
      reasons.push(`Task count decreased by ${Math.abs(taskDelta)} despite adding evidence`);
    }
  } else if (variant.variantType === "removal") {
    // Removal should potentially reduce tasks
    const removedEvidence = variant.removedEvidence || [];
    const removedSkills = removedEvidence.flatMap(e => e.relatedSkills.map(s => s.toLowerCase()));

    if (taskDelta < 0) {
      planChangesProportion = "proportional";
      
      // Check if removed tasks are related to removed evidence
      const removedSkillsFromPlan = [...originalSkills].filter(s => !variantSkills.has(s));
      const appropriatelyRemoved = removedSkillsFromPlan.filter(s =>
        removedSkills.some(rs => rs.includes(s) || s.includes(rs))
      );
      
      if (appropriatelyRemoved.length === 0 && removedSkillsFromPlan.length > 0) {
        reasons.push(`Skills removed from plan not related to removed evidence`);
        // Still appropriate as long as plan is reduced
      }
    } else if (taskDelta > 2) {
      planChangesProportion = "disproportional";
      isAppropriate = false;
      reasons.push(`Task count increased by ${taskDelta} despite removing evidence`);
    }

    // Check for new unrelated additions
    const newSkillsInPlan = [...variantSkills].filter(s => !originalSkills.has(s));
    if (newSkillsInPlan.length > 0) {
      unrelatedStepsAdded.push(...newSkillsInPlan);
      isAppropriate = false;
      reasons.push(`New skill areas added despite removing evidence: ${newSkillsInPlan.join(", ")}`);
    }
  }

  return {
    isAppropriate,
    planChangesProportion,
    unrelatedStepsAdded,
    reasoning: reasons.length > 0 
      ? reasons.join("; ") 
      : `Action plan changes are ${planChangesProportion} to evidence changes`,
  };
}

// =============================================================================
// COMPLETE COMPARISON
// =============================================================================

/**
 * Perform complete comparison of variant against original
 */
export function compareVariantToOriginal(
  variant: ProfileVariant,
  originalResults: PipelineResults | null,
  variantResults: PipelineResults
): VariantComparisonResult {
  // NEW: Skill consistency calculation
  const skillConsistency = calculateSkillConsistency(
    originalResults?.intakeAnalysis || null,
    variantResults.intakeAnalysis
  );

  // Skill attribution consistency
  const attributionCheck = checkSkillAttributionConsistency(
    variant,
    originalResults?.intakeAnalysis || null,
    variantResults.intakeAnalysis
  );

  // Hallucination detection (check variant results against variant profile)
  const hallucinationCheck = detectHallucinations(
    variant.profile,
    variantResults
  );

  // Recommendation stability
  const stabilityCheck = checkRecommendationStability(
    originalResults?.recommendations || null,
    variantResults.recommendations,
    variant.variantType
  );

  // Action plan sensitivity
  const sensitivityCheck = checkActionPlanSensitivity(
    variant,
    originalResults?.actionPlan || null,
    variantResults.actionPlan
  );

  return {
    profile_id: variant.profileId,
    variant: variant.variantType,
    skill_consistency: skillConsistency,
    skill_attribution_consistency: attributionCheck.isConsistent ? "consistent" : "inconsistent",
    skill_attribution_details: {
      skillsChanged: attributionCheck.skillsChanged,
      unexpectedChanges: attributionCheck.unexpectedChanges,
      reasoning: attributionCheck.reasoning,
    },
    hallucinations_detected: hallucinationCheck.hasHallucinations,
    hallucination_details: {
      untracedSkills: hallucinationCheck.untracedSkills,
      untracedRecommendations: hallucinationCheck.untracedRecommendations,
      untracedPlanSteps: hallucinationCheck.untracedPlanSteps,
      reasoning: hallucinationCheck.reasoning,
    },
    recommendation_stability: stabilityCheck.isStable ? "stable" : "unstable",
    recommendation_stability_details: {
      categoriesChanged: stabilityCheck.categoriesChanged,
      significantRankingChanges: stabilityCheck.significantRankingChanges,
      reasoning: stabilityCheck.reasoning,
    },
    action_plan_sensitivity: sensitivityCheck.isAppropriate ? "appropriate" : "inappropriate",
    action_plan_sensitivity_details: {
      planChangesProportion: sensitivityCheck.planChangesProportion,
      unrelatedStepsAdded: sensitivityCheck.unrelatedStepsAdded,
      reasoning: sensitivityCheck.reasoning,
    },
  };
}

// =============================================================================
// METRICS CALCULATION
// =============================================================================

/**
 * Calculate summary metrics from comparison results
 */
export function calculateMetrics(results: VariantComparisonResult[]): {
  summary: PerturbationSummary;
  metrics: PerturbationMetrics;
  skill_consistency_table: SkillConsistencySummaryRow[];
} {
  const total = results.length;
  
  if (total === 0) {
    return {
      summary: {
        consistent_attribution_count: 0,
        hallucination_count: 0,
        stable_recommendations_count: 0,
        appropriate_action_plans_count: 0,
        average_skill_consistency: 0,
        skill_consistency_by_variant: {
          rephrased: 0,
          removed_detail: 0,
          added_irrelevant: 0,
        },
      },
      metrics: {
        skillAttributionConsistencyRate: 0,
        hallucinationRate: 0,
        recommendationStabilityRate: 0,
        actionPlanAppropriatenessRate: 0,
        averageSkillConsistency: 0,
        skillConsistencyByVariant: {
          original: 100,
          rephrased: 0,
          removal: 0,
          injection: 0,
        },
      },
      skill_consistency_table: [],
    };
  }

  const consistentCount = results.filter(r => r.skill_attribution_consistency === "consistent").length;
  const hallucinationCount = results.filter(r => r.hallucinations_detected).length;
  const stableCount = results.filter(r => r.recommendation_stability === "stable").length;
  const appropriateCount = results.filter(r => r.action_plan_sensitivity === "appropriate").length;

  // Calculate skill consistency by variant type
  const originalResults = results.filter(r => r.variant === "original");
  const rephrasedResults = results.filter(r => r.variant === "rephrased");
  const removalResults = results.filter(r => r.variant === "removal");
  const injectionResults = results.filter(r => r.variant === "injection");

  const avgConsistency = (resultSet: VariantComparisonResult[]) => {
    if (resultSet.length === 0) return 0;
    const sum = resultSet.reduce((acc, r) => acc + r.skill_consistency.consistency_percentage, 0);
    return Math.round(sum / resultSet.length);
  };

  const originalConsistency = avgConsistency(originalResults);
  const rephrasedConsistency = avgConsistency(rephrasedResults);
  const removalConsistency = avgConsistency(removalResults);
  const injectionConsistency = avgConsistency(injectionResults);

  // Overall average (excluding originals since they're always 100%)
  const variantResults = results.filter(r => r.variant !== "original");
  const overallAverage = variantResults.length > 0 
    ? Math.round(variantResults.reduce((acc, r) => acc + r.skill_consistency.consistency_percentage, 0) / variantResults.length)
    : 100;

  // Build summary table for documentation
  const skill_consistency_table: SkillConsistencySummaryRow[] = [
    {
      input_variant: "Original",
      skill_consistency: 100,
      description: "Baseline input (100% by definition)",
    },
    {
      input_variant: "Rephrased Input",
      skill_consistency: rephrasedConsistency,
      description: "Same meaning, different wording",
    },
    {
      input_variant: "Removed Detail",
      skill_consistency: removalConsistency,
      description: "Key but non-critical info removed",
    },
    {
      input_variant: "Added Irrelevant Text",
      skill_consistency: injectionConsistency,
      description: "Noise injection with unrelated content",
    },
  ];

  return {
    summary: {
      consistent_attribution_count: consistentCount,
      hallucination_count: hallucinationCount,
      stable_recommendations_count: stableCount,
      appropriate_action_plans_count: appropriateCount,
      average_skill_consistency: overallAverage,
      skill_consistency_by_variant: {
        rephrased: rephrasedConsistency,
        removed_detail: removalConsistency,
        added_irrelevant: injectionConsistency,
      },
    },
    metrics: {
      skillAttributionConsistencyRate: Math.round((consistentCount / total) * 100),
      hallucinationRate: Math.round((hallucinationCount / total) * 100),
      recommendationStabilityRate: Math.round((stableCount / total) * 100),
      actionPlanAppropriatenessRate: Math.round((appropriateCount / total) * 100),
      averageSkillConsistency: overallAverage,
      skillConsistencyByVariant: {
        original: originalConsistency || 100,
        rephrased: rephrasedConsistency,
        removal: removalConsistency,
        injection: injectionConsistency,
      },
    },
    skill_consistency_table,
  };
}
