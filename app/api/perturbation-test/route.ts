// =============================================================================
// PERTURBATION TESTING API ROUTE
// =============================================================================
// Purpose: Execute full perturbation testing pipeline for robustness validation
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import type { StudentProfile, AIAnalysisResult, SkillGapAnalysisResult, PersonalizedRecommendationsResult } from "@/app/testing-playground/types";
import type {
  ProfileVariant,
  PipelineResults,
  PerturbationTestResult,
  VariantComparisonResult,
  ActionPlanResult,
  PerturbationConfig,
} from "@/app/perturbation-testing/types";
import { generateAllVariants } from "@/app/perturbation-testing/generators";
import { compareVariantToOriginal, calculateMetrics } from "@/app/perturbation-testing/comparison";

// =============================================================================
// PIPELINE EXECUTION HELPERS
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Run the student intake analysis API
 */
async function runIntakeAnalysis(profile: StudentProfile): Promise<{
  result: AIAnalysisResult | null;
  rawResponse: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${BASE_URL}/api/analyze-student-intake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    const rawResponse = await response.text();
    
    if (!response.ok) {
      return { result: null, rawResponse, error: `HTTP ${response.status}: ${rawResponse}` };
    }

    const data = JSON.parse(rawResponse);
    // The intake API returns { success, data: { skill_signals: {...} } }
    const skillSignals = data?.data?.skill_signals || data?.skill_signals || data;
    return { result: skillSignals, rawResponse };
  } catch (error) {
    return { 
      result: null, 
      rawResponse: "", 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Run the skill gap analysis API
 */
async function runSkillGapAnalysis(
  skillSnapshot: AIAnalysisResult,
  profile: StudentProfile
): Promise<{
  result: SkillGapAnalysisResult | null;
  rawResponse: string;
  error?: string;
}> {
  try {
    // Convert profile to student context
    const interestCategories = Object.entries(profile.interests_by_category)
      .filter(([, value]) => value)
      .map(([key]) => key);

    const response = await fetch(`${BASE_URL}/api/skill-gap-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skill_snapshot: skillSnapshot,
        student_context: {
          grade: profile.grade,
          interests_free_text: profile.interests_free_text,
          interests_categories: interestCategories,
          goals_selected: profile.goals_selected,
          goals_free_text: profile.goals_free_text,
          time_availability_hours_per_week: profile.time_availability_hours_per_week,
          learning_preferences: profile.learning_preferences,
        },
      }),
    });

    const rawResponse = await response.text();
    
    if (!response.ok) {
      return { result: null, rawResponse, error: `HTTP ${response.status}: ${rawResponse}` };
    }

    const data = JSON.parse(rawResponse);
    // The skill gap API returns { success, data: {...} }
    return { result: data?.data || data, rawResponse };
  } catch (error) {
    return { 
      result: null, 
      rawResponse: "", 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Run the personalized recommendations API
 */
async function runRecommendations(
  profile: StudentProfile,
  skillSnapshot: AIAnalysisResult,
  skillGapAnalysis: SkillGapAnalysisResult | null
): Promise<{
  result: PersonalizedRecommendationsResult | null;
  rawResponse: string;
  error?: string;
}> {
  try {
    const interestCategories = Object.entries(profile.interests_by_category)
      .filter(([, value]) => value)
      .map(([key]) => key);

    const response = await fetch(`${BASE_URL}/api/personalized-recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_profile: {
          grade: profile.grade,
          interests: profile.interests_free_text,
          interest_categories: interestCategories,
          goals: profile.goals_selected,
          goals_free_text: profile.goals_free_text,
          time_availability_hours_per_week: profile.time_availability_hours_per_week,
          learning_preferences: profile.learning_preferences,
        },
        skill_snapshot: skillSnapshot,
        skill_gap_analysis: skillGapAnalysis ? {
          skill_gaps: skillGapAnalysis.skill_gaps?.map(gap => ({
            skill: gap.skill,
            current_level: gap.current_level,
            goal_level: gap.goal_level,
            gap: gap.gap,
          })),
          priority_skills: skillGapAnalysis.priority_skills,
          overall_summary: skillGapAnalysis.overall_summary,
        } : undefined,
      }),
    });

    const rawResponse = await response.text();
    
    if (!response.ok) {
      return { result: null, rawResponse, error: `HTTP ${response.status}: ${rawResponse}` };
    }

    const data = JSON.parse(rawResponse);
    // The recommendations API returns { success, data: {...} }
    return { result: data?.data || data, rawResponse };
  } catch (error) {
    return { 
      result: null, 
      rawResponse: "", 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Run the 30-day action plan generator API
 */
async function runActionPlan(
  skillSnapshot: AIAnalysisResult,
  skillGapAnalysis: SkillGapAnalysisResult | null,
  recommendations: PersonalizedRecommendationsResult | null,
  timeAvailability: number
): Promise<{
  result: ActionPlanResult | null;
  rawResponse: string;
  error?: string;
}> {
  try {
    if (!skillGapAnalysis || !recommendations) {
      return { result: null, rawResponse: "", error: "Missing skill gap analysis or recommendations" };
    }

    // Convert skill snapshot to numeric format
    const skillSnapshotNumeric = {
      problem_solving: Math.round(skillSnapshot.problem_solving.confidence * 100),
      communication: Math.round(skillSnapshot.communication.confidence * 100),
      technical_skills: Math.round(skillSnapshot.technical_skills.confidence * 100),
      creativity: Math.round(skillSnapshot.creativity.confidence * 100),
      leadership: Math.round(skillSnapshot.leadership.confidence * 100),
      self_management: Math.round(skillSnapshot.self_management.confidence * 100),
    };

    // Convert skill gaps
    const skillGaps = skillGapAnalysis.skill_gaps?.map((gap, index) => ({
      skill: gap.skill,
      current_score: gap.current_level,
      target_score: gap.goal_level,
      gap_percentage: gap.gap,
      evidence_summary: gap.reasoning || `Gap analysis for ${gap.skill}`,
    })) || [];

    // Convert recommendations
    const allRecs = [
      ...recommendations.courses.map((c, i) => ({
        id: `course-${i}`,
        type: "course" as const,
        title: c.title,
        matched_skills: c.skill_alignment.map(s => s.skill),
        expected_skill_gain: Object.fromEntries(
          c.skill_alignment.map(s => [s.skill, s.expected_improvement])
        ),
        match_score: c.match_score,
      })),
      ...recommendations.projects.map((p, i) => ({
        id: `project-${i}`,
        type: "project" as const,
        title: p.title,
        matched_skills: p.skill_alignment.map(s => s.skill),
        expected_skill_gain: Object.fromEntries(
          p.skill_alignment.map(s => [s.skill, s.expected_improvement])
        ),
        match_score: p.match_score,
      })),
      ...recommendations.competitions.map((c, i) => ({
        id: `competition-${i}`,
        type: "competition" as const,
        title: c.title,
        matched_skills: c.skill_alignment.map(s => s.skill),
        expected_skill_gain: Object.fromEntries(
          c.skill_alignment.map(s => [s.skill, s.expected_improvement])
        ),
        match_score: c.match_score,
      })),
    ];

    const response = await fetch(`${BASE_URL}/api/generate-30-day-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skill_snapshot: skillSnapshotNumeric,
        skill_gaps: skillGaps,
        recommendations: allRecs,
        time_availability_hours_per_week: timeAvailability,
      }),
    });

    const rawResponse = await response.text();
    
    if (!response.ok) {
      return { result: null, rawResponse, error: `HTTP ${response.status}: ${rawResponse}` };
    }

    const data = JSON.parse(rawResponse);
    // The action plan API returns { success, data: {...} }
    return { result: data?.data || data, rawResponse };
  } catch (error) {
    return { 
      result: null, 
      rawResponse: "", 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Run the complete pipeline for a profile variant
 */
async function runCompletePipeline(
  variant: ProfileVariant,
  skipActionPlan: boolean = false
): Promise<PipelineResults> {
  const errors: string[] = [];
  const rawResponses = {
    intake: "",
    skillGap: "",
    recommendations: "",
    actionPlan: "",
  };

  // Step 1: Intake Analysis
  const intakeResult = await runIntakeAnalysis(variant.profile);
  rawResponses.intake = intakeResult.rawResponse;
  if (intakeResult.error) {
    errors.push(`Intake: ${intakeResult.error}`);
  }

  // Step 2: Skill Gap Analysis (requires intake)
  let skillGapResult: { result: SkillGapAnalysisResult | null; rawResponse: string } = { 
    result: null, 
    rawResponse: "" 
  };
  if (intakeResult.result) {
    skillGapResult = await runSkillGapAnalysis(intakeResult.result, variant.profile);
    rawResponses.skillGap = skillGapResult.rawResponse;
    if (!skillGapResult.result) {
      errors.push(`Skill Gap: Failed to get skill gap analysis`);
    }
  }

  // Step 3: Recommendations (requires intake and optionally skill gap)
  let recommendationsResult: { result: PersonalizedRecommendationsResult | null; rawResponse: string } = { 
    result: null, 
    rawResponse: "" 
  };
  if (intakeResult.result) {
    recommendationsResult = await runRecommendations(
      variant.profile,
      intakeResult.result,
      skillGapResult.result
    );
    rawResponses.recommendations = recommendationsResult.rawResponse;
    if (!recommendationsResult.result) {
      errors.push(`Recommendations: Failed to get recommendations`);
    }
  }

  // Step 4: Action Plan (requires all previous steps)
  let actionPlanResult: { result: ActionPlanResult | null; rawResponse: string } = { 
    result: null, 
    rawResponse: "" 
  };
  if (!skipActionPlan && intakeResult.result && skillGapResult.result && recommendationsResult.result) {
    actionPlanResult = await runActionPlan(
      intakeResult.result,
      skillGapResult.result,
      recommendationsResult.result,
      variant.profile.time_availability_hours_per_week
    );
    rawResponses.actionPlan = actionPlanResult.rawResponse;
    if (!actionPlanResult.result) {
      errors.push(`Action Plan: Failed to get action plan`);
    }
  }

  return {
    intakeAnalysis: intakeResult.result,
    skillGapAnalysis: skillGapResult.result,
    recommendations: recommendationsResult.result,
    actionPlan: actionPlanResult.result,
    rawResponses,
    errors,
  };
}

// =============================================================================
// API ROUTE HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profiles, config } = body as {
      profiles: Array<{ id: string; name: string; profile: StudentProfile }>;
      config: PerturbationConfig;
    };

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: "No profiles provided" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const allResults: VariantComparisonResult[] = [];
    const totalProfileCount = profiles.length;

    // Process each profile
    for (let profileIndex = 0; profileIndex < profiles.length; profileIndex++) {
      const { id: profileId, name: profileName, profile } = profiles[profileIndex];

      // Generate variants for this profile
      const variants = generateAllVariants(profileId, profileName, profile, {
        runInjection: config.runInjection,
        runRemoval: config.runRemoval,
        runRephrasing: config.runRephrasing,
      });

      // Find the original variant and run it first
      const originalVariant = variants.find(v => v.variantType === "original");
      let originalResults: PipelineResults | null = null;

      if (originalVariant) {
        console.log(`[${profileIndex + 1}/${totalProfileCount}] Running original for: ${profileName}`);
        originalResults = await runCompletePipeline(originalVariant, config.skipActionPlan);

        // Add original to results
        const originalComparison = compareVariantToOriginal(
          originalVariant,
          null, // No comparison needed for original
          originalResults
        );
        allResults.push(originalComparison);
      }

      // Run other variants
      for (const variant of variants) {
        if (variant.variantType === "original") continue;

        console.log(`[${profileIndex + 1}/${totalProfileCount}] Running ${variant.variantType} for: ${profileName}`);
        const variantResults = await runCompletePipeline(variant, config.skipActionPlan);

        // Compare against original
        const comparison = compareVariantToOriginal(variant, originalResults, variantResults);
        allResults.push(comparison);
      }
    }

    // Calculate metrics
    const { summary, metrics } = calculateMetrics(allResults);

    // Build final result
    const finalResult: PerturbationTestResult = {
      profiles_tested: totalProfileCount,
      total_runs: allResults.length,
      results: allResults,
      summary,
      metrics,
      timestamp: new Date().toISOString(),
      execution_time_total_ms: Date.now() - startTime,
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("Perturbation test error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET HANDLER - For retrieving test configuration info
// =============================================================================

export async function GET() {
  return NextResponse.json({
    name: "Perturbation & Robustness Testing API",
    version: "1.0.0",
    description: "Runs controlled input perturbations and compares outputs for robustness validation",
    endpoints: {
      POST: {
        description: "Run perturbation tests on provided profiles",
        body: {
          profiles: "Array of { id, name, profile } objects",
          config: {
            selectedProfileIds: "Array of profile IDs to test",
            runInjection: "boolean - Run evidence injection tests",
            runRemoval: "boolean - Run evidence removal tests", 
            runRephrasing: "boolean - Run neutral rephrasing tests",
            skipActionPlan: "boolean - Skip action plan generation for faster testing",
          },
        },
      },
    },
    metrics: {
      skillAttributionConsistencyRate: "% of runs where skill changes match evidence changes",
      hallucinationRate: "% of runs with untraced outputs",
      recommendationStabilityRate: "% of runs with stable recommendations",
      actionPlanAppropriatenessRate: "% of runs with proportional action plan changes",
    },
  });
}
