/**
 * =============================================================================
 * RESPONSIBLE AI VALIDATION TESTS
 * =============================================================================
 * 
 * This file contains test scenarios to validate the responsible AI improvements:
 * 1. Inferred evidence detection for Problem Solving
 * 2. Growth cap enforcement (max +25% in 30 days)
 * 3. Short-term vs long-term target separation
 * 4. Recommendation freshness validation (no discontinued programs)
 * 5. Evidence attribution types (explicit/inferred/missing)
 * 
 * Run these tests by importing and calling the validateResponsibleAI function
 * from the testing playground or results page.
 * 
 * =============================================================================
 */

import {
  validateGrowthCaps,
  validateTargetSeparation,
  validateNoOutdatedRecommendations,
  validateInferredEvidence,
  validateResponsibleAI,
} from "./validation";
import type { SkillGapAnalysisResult, PersonalizedRecommendationsResult } from "./types";

// =============================================================================
// TEST DATA: Scenarios for Responsible AI Validation
// =============================================================================

/**
 * Test Scenario 1: Inferred Problem Solving Evidence
 * 
 * This student has strong implicit evidence for problem-solving through:
 * - Technical teaching/mentoring
 * - Competitive awards
 * - Complex project activities
 * 
 * Expected: Problem solving should be inferred at 40-55% confidence
 */
export const INFERRED_EVIDENCE_TEST_PROFILE = {
  originalText: `
    I taught Arduino programming to middle school students for 2 years.
    Won first place at the state robotics competition.
    Built a mobile app that helps students track their homework.
    Mentored classmates in Python programming.
  `,
  expectedInference: {
    problem_solving: {
      attribution_type: "inferred",
      inference_sources: ["technical_teaching_mentoring", "competitive_awards", "complex_project_activities"],
      confidence_range: { min: 0.4, max: 0.55 },
    },
  },
};

/**
 * Test Scenario 2: Growth Cap Enforcement
 * 
 * This skill gap analysis attempts unrealistic growth (e.g., 20% → 85%)
 * Expected: Growth should be capped at +25% (20% → 45%)
 */
export const GROWTH_CAP_TEST_DATA: SkillGapAnalysisResult = {
  skill_gaps: [
    {
      skill: "leadership",
      current_level: 20,
      goal_level: 90,
      gap: 70,
      expected_level_after: 85, // Unrealistic - should be capped to 45
      timeline: "30 days",
      why_it_matters: "Leadership is critical for college applications",
      actionable_steps: [
        {
          step: "Join student government",
          time_required: "5 hours/week",
          expected_impact: "+15%",
          priority: "high",
          why: "Direct leadership experience",
        },
      ],
      reasoning: "Strong leadership gap identified",
    },
    {
      skill: "communication",
      current_level: 30,
      goal_level: 80,
      gap: 50,
      expected_level_after: 75, // Unrealistic - should be capped to 55
      timeline: "30 days",
      why_it_matters: "Communication supports all goals",
      actionable_steps: [
        {
          step: "Join debate club",
          time_required: "3 hours/week",
          expected_impact: "+10%",
          priority: "high",
          why: "Practice public speaking",
        },
      ],
      reasoning: "Communication gap for college prep",
    },
    {
      skill: "technical_skills",
      current_level: 60,
      goal_level: 80,
      gap: 20,
      expected_level_after: 78, // Realistic - within +25% cap
      timeline: "30 days",
      why_it_matters: "Technical skills for STEM goals",
      actionable_steps: [
        {
          step: "Complete online course",
          time_required: "4 hours/week",
          expected_impact: "+8%",
          priority: "medium",
          why: "Build on existing skills",
        },
      ],
      reasoning: "Technical skills enhancement",
    },
  ],
  overall_summary: "Focus on soft skills development",
  priority_skills: ["leadership", "communication"],
  total_weekly_time_recommended: "12 hours/week",
  skills_without_evidence: [],
};

/**
 * Test Scenario 3: Outdated Recommendations Detection
 * 
 * These recommendations include discontinued programs
 * Expected: Validation should flag Google Code-in, Facebook University, etc.
 */
export const OUTDATED_RECOMMENDATIONS_TEST: PersonalizedRecommendationsResult = {
  courses: [
    {
      type: "course",
      title: "Harvard CS50: Introduction to Computer Science",
      platform_or_provider: "edX",
      match_score: 92,
      skill_alignment: [
        { skill: "technical_skills", expected_improvement: 12 },
        { skill: "problem_solving", expected_improvement: 8 },
      ],
      duration_weeks: 12,
      level: "Beginner",
      reasoning: "Excellent foundational course for STEM goals",
    },
    {
      type: "course",
      title: "Python for Everybody",
      platform_or_provider: "Coursera",
      match_score: 88,
      skill_alignment: [
        { skill: "technical_skills", expected_improvement: 10 },
      ],
      duration_weeks: 8,
      level: "Beginner",
      reasoning: "Great for building coding skills",
    },
  ],
  projects: [
    {
      type: "project",
      title: "Personal Portfolio Website",
      platform_or_provider: "GitHub Pages",
      match_score: 85,
      skill_alignment: [
        { skill: "technical_skills", expected_improvement: 8 },
        { skill: "creativity", expected_improvement: 6 },
      ],
      duration_weeks: 4,
      level: "Beginner",
      reasoning: "Hands-on project to showcase skills",
    },
  ],
  competitions: [
    {
      type: "competition",
      title: "Google Code-in", // DISCONTINUED - should be flagged
      platform_or_provider: "Google",
      match_score: 90,
      skill_alignment: [
        { skill: "technical_skills", expected_improvement: 15 },
        { skill: "problem_solving", expected_improvement: 10 },
      ],
      duration_weeks: 8,
      level: "Intermediate",
      reasoning: "Great for open source experience",
    },
    {
      type: "competition",
      title: "Science Olympiad",
      platform_or_provider: "Science Olympiad Foundation",
      match_score: 87,
      skill_alignment: [
        { skill: "technical_skills", expected_improvement: 10 },
        { skill: "problem_solving", expected_improvement: 12 },
      ],
      duration_weeks: 16,
      level: "Intermediate",
      reasoning: "Excellent for STEM competition experience",
    },
  ],
  summary: "Recommendations tailored for STEM and college preparation",
};

/**
 * Test Scenario 4: Valid Active Recommendations
 * All recommendations are current and active
 */
export const VALID_RECOMMENDATIONS_TEST: PersonalizedRecommendationsResult = {
  courses: [
    {
      type: "course",
      title: "MIT OpenCourseWare: Introduction to Algorithms",
      platform_or_provider: "MIT OpenCourseWare",
      match_score: 90,
      skill_alignment: [
        { skill: "problem_solving", expected_improvement: 12 },
        { skill: "technical_skills", expected_improvement: 8 },
      ],
      duration_weeks: 10,
      level: "Intermediate",
      reasoning: "Strong algorithmic thinking development",
    },
  ],
  projects: [
    {
      type: "project",
      title: "Open Source Contribution",
      platform_or_provider: "GitHub",
      match_score: 85,
      skill_alignment: [
        { skill: "technical_skills", expected_improvement: 10 },
        { skill: "communication", expected_improvement: 6 },
      ],
      duration_weeks: 8,
      level: "Intermediate",
      reasoning: "Real-world collaboration experience",
    },
  ],
  competitions: [
    {
      type: "competition",
      title: "Congressional App Challenge",
      platform_or_provider: "U.S. House of Representatives",
      match_score: 92,
      skill_alignment: [
        { skill: "technical_skills", expected_improvement: 15 },
        { skill: "creativity", expected_improvement: 10 },
      ],
      duration_weeks: 12,
      level: "Intermediate",
      reasoning: "Prestigious competition for app development",
    },
  ],
  summary: "All active, current programs recommended",
};

// =============================================================================
// TEST RUNNER FUNCTIONS
// =============================================================================

/**
 * Run all responsible AI validation tests
 */
export function runAllValidationTests(): {
  passed: number;
  failed: number;
  results: Array<{
    testName: string;
    passed: boolean;
    details: string;
  }>;
} {
  const results: Array<{ testName: string; passed: boolean; details: string }> = [];

  // Test 1: Growth Cap Validation
  const growthCapResult = validateGrowthCaps(GROWTH_CAP_TEST_DATA);
  results.push({
    testName: "Growth Cap Enforcement",
    passed: !growthCapResult.isValid, // Should fail because caps are violated in raw data
    details: growthCapResult.isValid 
      ? "Expected growth cap violations but none found"
      : `Found violations: ${growthCapResult.errors.join(", ")}`,
  });

  // Test 2: Target Separation Validation
  const targetSepResult = validateTargetSeparation(GROWTH_CAP_TEST_DATA);
  results.push({
    testName: "Target Separation Check",
    passed: targetSepResult.warnings.length > 0, // Should have warnings about missing fields
    details: targetSepResult.warnings.length > 0
      ? `Warnings: ${targetSepResult.warnings.join(", ")}`
      : "No warnings about missing short/long-term fields",
  });

  // Test 3: Outdated Recommendations Detection
  const outdatedResult = validateNoOutdatedRecommendations(OUTDATED_RECOMMENDATIONS_TEST);
  results.push({
    testName: "Outdated Recommendations Detection",
    passed: !outdatedResult.isValid, // Should fail because Google Code-in is discontinued
    details: outdatedResult.isValid
      ? "Expected to detect discontinued programs but validation passed"
      : `Found outdated: ${outdatedResult.errors.join(", ")}`,
  });

  // Test 4: Valid Recommendations Pass
  const validRecsResult = validateNoOutdatedRecommendations(VALID_RECOMMENDATIONS_TEST);
  results.push({
    testName: "Valid Recommendations Pass",
    passed: validRecsResult.isValid,
    details: validRecsResult.isValid
      ? "All recommendations are current and active"
      : `Unexpected errors: ${validRecsResult.errors.join(", ")}`,
  });

  // Test 5: Inferred Evidence Validation
  const inferredEvidenceResponse = {
    problem_solving: {
      evidence_found: true,
      evidence_phrases: ["[Inferred from related activities]"],
      evidence_sources: ["past_activities", "achievements"],
      confidence: 0.45,
      reasoning: "Problem-solving inferred from technical teaching and competitions",
      attribution_type: "inferred",
      inference_sources: ["technical_teaching_mentoring", "competitive_awards", "complex_project_activities"],
      inference_justification: "Activities demonstrate analytical thinking",
    },
    communication: {
      evidence_found: true,
      evidence_phrases: ["taught Arduino", "mentored classmates"],
      evidence_sources: ["past_activities"],
      confidence: 0.7,
      reasoning: "Teaching and mentoring show communication skills",
      attribution_type: "explicit",
    },
    technical_skills: {
      evidence_found: true,
      evidence_phrases: ["Arduino programming", "mobile app", "Python programming"],
      evidence_sources: ["past_activities"],
      confidence: 0.85,
      reasoning: "Strong technical evidence",
      attribution_type: "explicit",
    },
    creativity: {
      evidence_found: true,
      evidence_phrases: ["Built a mobile app"],
      evidence_sources: ["past_activities"],
      confidence: 0.6,
      reasoning: "App development shows creativity",
      attribution_type: "explicit",
    },
    leadership: {
      evidence_found: true,
      evidence_phrases: ["taught", "mentored"],
      evidence_sources: ["past_activities"],
      confidence: 0.5,
      reasoning: "Teaching implies leadership",
      attribution_type: "explicit",
    },
    self_management: {
      evidence_found: false,
      evidence_phrases: [],
      evidence_sources: [],
      confidence: 0.1,
      reasoning: "No clear evidence",
      attribution_type: "missing",
    },
  };

  const inferredResult = validateInferredEvidence(
    inferredEvidenceResponse,
    INFERRED_EVIDENCE_TEST_PROFILE.originalText
  );
  results.push({
    testName: "Inferred Evidence Integrity",
    passed: inferredResult.isValid && inferredResult.hallucinationFlags.length === 0,
    details: inferredResult.isValid
      ? "Inferred evidence properly justified without hallucinations"
      : `Issues: ${[...inferredResult.errors, ...inferredResult.hallucinationFlags].join(", ")}`,
  });

  // Calculate summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return { passed, failed, results };
}

/**
 * Format test results for display
 */
export function formatTestResults(testResults: ReturnType<typeof runAllValidationTests>): string {
  const lines: string[] = [
    "=".repeat(60),
    "RESPONSIBLE AI VALIDATION TEST RESULTS",
    "=".repeat(60),
    "",
    `Total Tests: ${testResults.passed + testResults.failed}`,
    `Passed: ${testResults.passed}`,
    `Failed: ${testResults.failed}`,
    "",
    "-".repeat(60),
    "DETAILED RESULTS:",
    "-".repeat(60),
  ];

  for (const result of testResults.results) {
    lines.push("");
    lines.push(`${result.passed ? "✅ PASS" : "❌ FAIL"}: ${result.testName}`);
    lines.push(`   ${result.details}`);
  }

  lines.push("");
  lines.push("=".repeat(60));

  return lines.join("\n");
}

// Export test data for use in testing playground
export const TEST_SCENARIOS = {
  inferredEvidence: INFERRED_EVIDENCE_TEST_PROFILE,
  growthCaps: GROWTH_CAP_TEST_DATA,
  outdatedRecommendations: OUTDATED_RECOMMENDATIONS_TEST,
  validRecommendations: VALID_RECOMMENDATIONS_TEST,
};
