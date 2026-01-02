import type {
  ActionPlanData,
  RecommendationSortBy,
  RecommendationFilterLevel,
  MatchLevel,
} from "./types";
import type { Recommendation } from "@/components/ui";

// Helper to get match level from score
function getMatchLevel(score: number): "high" | "medium" | "low" {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

// Time availability mapping
export const timeMapping: Record<string, number> = {
  "0-2": 1,
  "2-5": 3.5,
  "5-10": 7.5,
  "10-15": 12.5,
  "15+": 17,
};

// Skill display names mapping
export const skillDisplayNames: Record<string, string> = {
  problem_solving: "Problem Solving",
  communication: "Communication",
  technical_skills: "Technical Skills",
  creativity: "Creativity",
  leadership: "Leadership",
  self_management: "Self Management",
};

/**
 * Get color class based on score value
 */
export function getColorForScore(score: number): "success" | "warning" | "error" | "primary" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  if (score >= 20) return "error";
  return "primary";
}

/**
 * Get priority color class based on difficulty/priority level
 */
export function getPriorityColor(priority: "high" | "medium" | "low"): string {
  switch (priority) {
    case "high":
      return "text-[var(--error)]";
    case "medium":
      return "text-[var(--warning)]";
    case "low":
      return "text-[var(--success)]";
    default:
      return "text-[var(--muted)]";
  }
}

/**
 * Calculate total completed tasks from action plan
 */
export function calculateCompletedTasks(plan: ActionPlanData | null): number {
  if (!plan?.weeks) return 0;
  return plan.weeks.reduce((total, week) => {
    return total + week.tasks.filter((task) => task.completed).length;
  }, 0);
}

/**
 * Calculate total tasks from action plan
 */
export function calculateTotalTasks(plan: ActionPlanData | null): number {
  if (!plan?.weeks) return 0;
  return plan.weeks.reduce((total, week) => total + week.tasks.length, 0);
}

/**
 * Get progress percentage for a specific week
 */
export function getWeekProgress(plan: ActionPlanData | null, weekIndex: number): number {
  if (!plan?.weeks?.[weekIndex]) return 0;
  const week = plan.weeks[weekIndex];
  const completedInWeek = week.tasks.filter((task) => task.completed).length;
  return week.tasks.length > 0 ? Math.round((completedInWeek / week.tasks.length) * 100) : 0;
}

/**
 * Sort recommendations by the specified criteria
 */
export function sortRecommendations(
  recommendations: Recommendation[],
  sortBy: RecommendationSortBy
): Recommendation[] {
  return [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case "match":
        const matchOrder: Record<MatchLevel, number> = { high: 0, medium: 1, low: 2 };
        const aMatch = a.match_level || getMatchLevel(a.match_score);
        const bMatch = b.match_level || getMatchLevel(b.match_score);
        return matchOrder[aMatch] - matchOrder[bMatch];
      case "duration":
        // Sort by duration_weeks
        return (a.duration_weeks || 0) - (b.duration_weeks || 0);
      case "level":
        const levelOrder: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };
        const aLevel = levelOrder[a.level] ?? 1;
        const bLevel = levelOrder[b.level] ?? 1;
        return aLevel - bLevel;
      default:
        return 0;
    }
  });
}

/**
 * Filter recommendations by match level
 */
export function filterRecommendations(
  recommendations: Recommendation[],
  filterLevel: RecommendationFilterLevel
): Recommendation[] {
  if (filterLevel === "all") return recommendations;
  return recommendations.filter((rec) => {
    const matchLevel = rec.match_level || getMatchLevel(rec.match_score);
    return matchLevel === filterLevel;
  });
}
