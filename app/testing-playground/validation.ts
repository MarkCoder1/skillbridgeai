// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

import type { StudentProfile, ValidationResult, SkillGapAnalysisResult, PersonalizedRecommendationsResult } from "./types";
import { VALID_SKILLS, VALID_SOURCES, VALID_ATTRIBUTION_TYPES, MAX_30_DAY_IMPROVEMENT, DISCONTINUED_PROGRAMS } from "./data";

// =============================================================================
// INTAKE ANALYSIS VALIDATION
// =============================================================================

// Validate AI response for intake analysis
export const validateAIResponse = (
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
          // Skip inferred evidence markers
          if (phraseStr.includes("[inferred")) continue;
          
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

      // Validate attribution_type if present (responsible AI)
      if (signal.attribution_type !== undefined) {
        if (!VALID_ATTRIBUTION_TYPES.includes(signal.attribution_type as string)) {
          errors.push(`${skill}: Invalid attribution_type "${signal.attribution_type}"`);
        }
        
        // Validate inferred evidence doesn't trigger hallucinations
        if (signal.attribution_type === "inferred") {
          if (!signal.inference_sources || !Array.isArray(signal.inference_sources)) {
            warnings.push(`${skill}: Inferred evidence should have inference_sources`);
          }
          if (!signal.inference_justification || typeof signal.inference_justification !== "string") {
            warnings.push(`${skill}: Inferred evidence should have inference_justification`);
          }
        }
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

// =============================================================================
// SKILL GAP ANALYSIS VALIDATION (Responsible AI)
// =============================================================================

/**
 * Validates that growth caps are enforced in skill gap analysis
 */
export const validateGrowthCaps = (
  result: SkillGapAnalysisResult
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const hallucinationFlags: string[] = [];

  if (!result.skill_gaps || !Array.isArray(result.skill_gaps)) {
    errors.push("skill_gaps must be an array");
    return { isValid: false, errors, warnings, hallucinationFlags };
  }

  for (const gap of result.skill_gaps) {
    const current = gap.current_level ?? (gap as { current_score?: number }).current_score ?? 0;
    const expected = gap.expected_level_after ?? 
      (gap as { expected_30_day_score?: number }).expected_30_day_score ?? 0;
    const improvement = expected - current;

    if (improvement > MAX_30_DAY_IMPROVEMENT) {
      errors.push(
        `Growth cap exceeded for ${gap.skill}: ${current}% → ${expected}% (+${improvement}%, max: +${MAX_30_DAY_IMPROVEMENT}%)`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hallucinationFlags,
  };
};

/**
 * Validates that short-term and long-term targets are properly separated
 */
export const validateTargetSeparation = (
  result: SkillGapAnalysisResult
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const hallucinationFlags: string[] = [];

  if (!result.skill_gaps || !Array.isArray(result.skill_gaps)) {
    errors.push("skill_gaps must be an array");
    return { isValid: false, errors, warnings, hallucinationFlags };
  }

  for (const gap of result.skill_gaps) {
    const enhancedGap = gap as {
      expected_30_day_score?: number;
      long_term_target_score?: number;
    };

    // Check if new fields are present
    if (enhancedGap.expected_30_day_score === undefined) {
      warnings.push(`${gap.skill}: Missing expected_30_day_score field`);
    }
    if (enhancedGap.long_term_target_score === undefined) {
      warnings.push(`${gap.skill}: Missing long_term_target_score field`);
    }

    // Validate that expected_30_day_score <= long_term_target_score
    if (
      enhancedGap.expected_30_day_score !== undefined &&
      enhancedGap.long_term_target_score !== undefined &&
      enhancedGap.expected_30_day_score > enhancedGap.long_term_target_score
    ) {
      errors.push(
        `${gap.skill}: expected_30_day_score (${enhancedGap.expected_30_day_score}%) > long_term_target_score (${enhancedGap.long_term_target_score}%)`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hallucinationFlags,
  };
};

// =============================================================================
// RECOMMENDATIONS VALIDATION (Responsible AI)
// =============================================================================

/**
 * Validates that no outdated/discontinued programs appear in recommendations
 */
export const validateNoOutdatedRecommendations = (
  result: PersonalizedRecommendationsResult
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const hallucinationFlags: string[] = [];

  const allRecommendations = [
    ...(result.courses || []),
    ...(result.projects || []),
    ...(result.competitions || []),
  ];

  for (const rec of allRecommendations) {
    const title = rec.title.toLowerCase();
    const platform = rec.platform_or_provider.toLowerCase();

    for (const discontinued of DISCONTINUED_PROGRAMS) {
      if (title.includes(discontinued.toLowerCase()) || 
          platform.includes(discontinued.toLowerCase())) {
        errors.push(
          `Outdated program detected: "${rec.title}" (${discontinued} is discontinued)`
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

// =============================================================================
// INFERRED EVIDENCE VALIDATION (Responsible AI)
// =============================================================================

/**
 * Validates that inferred evidence is properly justified and doesn't hallucinate
 */
export const validateInferredEvidence = (
  response: Record<string, unknown>,
  originalText: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const hallucinationFlags: string[] = [];

  const lowerText = originalText.toLowerCase();

  for (const skill of VALID_SKILLS) {
    if (skill in response) {
      const signal = response[skill] as Record<string, unknown>;

      if (signal.attribution_type === "inferred") {
        // Check that inference sources are present
        if (!signal.inference_sources || !Array.isArray(signal.inference_sources)) {
          errors.push(`${skill}: Inferred evidence missing inference_sources`);
          continue;
        }

        // Verify each claimed inference source has evidence in text
        for (const source of signal.inference_sources) {
          let foundEvidence = false;

          switch (source) {
            case "technical_teaching_mentoring":
              foundEvidence = /taught|teaching|mentor|tutored|explained coding|helped students|coached|workshop|instructor/.test(lowerText);
              break;
            case "competitive_awards":
              foundEvidence = /hackathon|won|winner|award|prize|competition|finalist|place|champion|olympiad|contest/.test(lowerText);
              break;
            case "complex_project_activities":
              foundEvidence = /app|built|developed|robot|research|project|implemented|programmed|software|hardware/.test(lowerText);
              break;
            default:
              warnings.push(`${skill}: Unknown inference source "${source}"`);
              continue;
          }

          if (!foundEvidence) {
            hallucinationFlags.push(
              `${skill}: Claimed inference source "${source}" not found in original text`
            );
          }
        }

        // Check confidence is within inferred evidence range (40-55%)
        if (typeof signal.confidence === "number") {
          const confidencePercent = signal.confidence * 100;
          if (confidencePercent < 40 || confidencePercent > 55) {
            warnings.push(
              `${skill}: Inferred evidence confidence ${confidencePercent}% outside expected range (40-55%)`
            );
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0 && hallucinationFlags.length === 0,
    errors,
    warnings,
    hallucinationFlags,
  };
};

// =============================================================================
// COMPREHENSIVE RESPONSIBLE AI VALIDATION
// =============================================================================

/**
 * Runs all responsible AI validations on a complete analysis result
 */
export const validateResponsibleAI = (
  intakeResponse: Record<string, unknown> | null,
  skillGapResult: SkillGapAnalysisResult | null,
  recommendationsResult: PersonalizedRecommendationsResult | null,
  originalText: string
): {
  overall: ValidationResult;
  intake: ValidationResult | null;
  skillGap: ValidationResult | null;
  recommendations: ValidationResult | null;
} => {
  const results = {
    intake: null as ValidationResult | null,
    skillGap: null as ValidationResult | null,
    recommendations: null as ValidationResult | null,
  };

  // Validate intake response for inferred evidence
  if (intakeResponse) {
    results.intake = validateInferredEvidence(intakeResponse, originalText);
  }

  // Validate skill gap analysis
  if (skillGapResult) {
    const growthCapResult = validateGrowthCaps(skillGapResult);
    const targetSeparationResult = validateTargetSeparation(skillGapResult);
    
    results.skillGap = {
      isValid: growthCapResult.isValid && targetSeparationResult.isValid,
      errors: [...growthCapResult.errors, ...targetSeparationResult.errors],
      warnings: [...growthCapResult.warnings, ...targetSeparationResult.warnings],
      hallucinationFlags: [...growthCapResult.hallucinationFlags, ...targetSeparationResult.hallucinationFlags],
    };
  }

  // Validate recommendations
  if (recommendationsResult) {
    results.recommendations = validateNoOutdatedRecommendations(recommendationsResult);
  }

  // Combine all results
  const overall: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    hallucinationFlags: [],
  };

  for (const result of Object.values(results)) {
    if (result) {
      if (!result.isValid) overall.isValid = false;
      overall.errors.push(...result.errors);
      overall.warnings.push(...result.warnings);
      overall.hallucinationFlags.push(...result.hallucinationFlags);
    }
  }

  return {
    overall,
    ...results,
  };
};
