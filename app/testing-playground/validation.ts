// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

import type { StudentProfile, ValidationResult } from "./types";
import { VALID_SKILLS, VALID_SOURCES } from "./data";

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
