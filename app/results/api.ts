import type {
  AIAnalysisData,
  SkillGapAnalysis,
  RecommendationsData,
  ActionPlanData,
  PlanWeek,
  PlanTask,
} from "./types";
import { timeMapping } from "./utils";

/**
 * Fetch skill gap analysis from API
 */
export async function fetchSkillGapAnalysis(
  data: AIAnalysisData
): Promise<{ success: true; data: SkillGapAnalysis } | { success: false; error: string }> {
  try {
    const timeHours = timeMapping[data.formData.timeAvailability] || 5;

    const payload = {
      skill_snapshot: data.aiAnalysis.skill_signals,
      student_context: {
        grade: parseInt(data.formData.grade) || 10,
        interests_free_text: data.formData.interests,
        interests_categories: data.formData.interestCategories,
        goals_selected: data.formData.goals,
        goals_free_text: data.formData.customGoal,
        time_availability_hours_per_week: timeHours,
        learning_preferences: data.formData.preferredLearningModes,
      },
    };

    const response = await fetch("/api/skill-gap-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      throw new Error(result.details || result.error || "Failed to analyze skill gaps");
    }
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load skill gap analysis",
    };
  }
}

/**
 * Fetch personalized recommendations from API
 */
export async function fetchPersonalizedRecommendations(
  data: AIAnalysisData,
  gapData?: SkillGapAnalysis
): Promise<{ success: true; data: RecommendationsData } | { success: false; error: string }> {
  try {
    const timeHours = timeMapping[data.formData.timeAvailability] || 5;

    const skillGaps =
      gapData?.skill_gaps?.map((gap) => ({
        skill: gap.skill,
        current_level: gap.current_level,
        goal_level: gap.goal_level,
        gap: gap.gap,
      })) || [];

    const payload = {
      student_profile: {
        grade: parseInt(data.formData.grade) || 10,
        interests: data.formData.interests,
        interest_categories: data.formData.interestCategories,
        goals: data.formData.goals,
        goals_free_text: data.formData.customGoal,
        time_availability_hours_per_week: timeHours,
        learning_preferences: data.formData.preferredLearningModes,
      },
      skill_snapshot: data.aiAnalysis.skill_signals,
      skill_gap_analysis: {
        skill_gaps: skillGaps,
        priority_skills: gapData?.priority_skills || [],
        overall_summary: gapData?.overall_summary || "",
      },
    };

    const response = await fetch("/api/personalized-recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      throw new Error(result.details || result.error || "Failed to get recommendations");
    }
  } catch (error) {
    console.error("Recommendations error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load recommendations",
    };
  }
}

/**
 * Fetch 30-day action plan from API
 */
export async function fetch30DayPlan(
  data: AIAnalysisData,
  gapData: SkillGapAnalysis,
  recData: RecommendationsData
): Promise<{ success: true; data: ActionPlanData } | { success: false; error: string }> {
  try {
    // Build skill snapshot from AI analysis
    const skillSnapshot: Record<string, number> = {};
    Object.entries(data.aiAnalysis.skill_signals).forEach(([key, signal]) => {
      skillSnapshot[key] = Math.round(signal.confidence * 100);
    });

    // Build skill gaps array
    const skillGaps = gapData.skill_gaps
      .filter((gap) => gap.gap >= 15) // Only include significant gaps
      .map((gap) => ({
        skill: gap.skill,
        current_score: gap.current_level,
        target_score: gap.goal_level,
        gap_percentage: gap.gap,
        evidence_summary: gap.reasoning || gap.why_it_matters,
      }));

    // Build recommendations array from all categories
    const allRecs = [
      ...recData.courses.map((c, i) => ({
        id: `course-${i}`,
        type: "course" as const,
        title: c.title,
        matched_skills: c.skill_alignment.map((s) => s.skill),
        expected_skill_gain: c.skill_alignment.reduce<Record<string, number>>(
          (acc, s) => ({ ...acc, [s.skill]: s.expected_improvement }),
          {}
        ),
        match_score: c.match_score,
      })),
      ...recData.projects.map((p, i) => ({
        id: `project-${i}`,
        type: "project" as const,
        title: p.title,
        matched_skills: p.skill_alignment.map((s) => s.skill),
        expected_skill_gain: p.skill_alignment.reduce<Record<string, number>>(
          (acc, s) => ({ ...acc, [s.skill]: s.expected_improvement }),
          {}
        ),
        match_score: p.match_score,
      })),
      ...recData.competitions.map((c, i) => ({
        id: `competition-${i}`,
        type: "competition" as const,
        title: c.title,
        matched_skills: c.skill_alignment.map((s) => s.skill),
        expected_skill_gain: c.skill_alignment.reduce<Record<string, number>>(
          (acc, s) => ({ ...acc, [s.skill]: s.expected_improvement }),
          {}
        ),
        match_score: c.match_score,
      })),
    ];

    const timeHours = timeMapping[data.formData.timeAvailability] || 5;

    const payload = {
      skill_snapshot: skillSnapshot,
      skill_gaps: skillGaps,
      recommendations: allRecs,
      time_availability_hours_per_week: timeHours,
    };

    const response = await fetch("/api/generate-30-day-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      // Add completed state to each task
      const planWithCompletion: ActionPlanData = {
        ...result.data,
        weeks: result.data.weeks.map((week: PlanWeek) => ({
          ...week,
          tasks: week.tasks.map((task: PlanTask) => ({
            ...task,
            completed: false,
          })),
        })),
      };
      return { success: true, data: planWithCompletion };
    } else {
      throw new Error(result.details || result.error || "Failed to generate action plan");
    }
  } catch (error) {
    console.error("30-Day Plan error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load action plan",
    };
  }
}
