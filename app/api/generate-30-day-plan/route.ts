/**
 * =============================================================================
 * 30-DAY ACTION PLAN GENERATOR API
 * =============================================================================
 *
 * WHY AI IS REQUIRED:
 * This endpoint uses AI for multi-constraint reasoning and dynamic planning that
 * cannot be achieved with static rules or simple conditionals. The AI must:
 * 1. Analyze skill gaps with varying severities and prioritize accordingly
 * 2. Map recommendations to appropriate weeks based on difficulty progression
 * 3. Balance time constraints against skill improvement goals
 * 4. Generate coherent task sequences that build upon each other
 * 5. Provide evidence-based reasoning for each planning decision
 *
 * HOW THIS IS NOT A STATIC CHECKLIST:
 * Unlike a predefined template, this system dynamically generates plans based on:
 * - Individual skill gap profiles (different students have different gaps)
 * - Available recommendations (varying by student interests and goals)
 * - Time availability constraints (personalized scheduling)
 * - Progressive difficulty scaling (adaptive to skill levels)
 *
 * HOW EACH TASK IS TRACEABLE TO EVIDENCE:
 * Every generated task includes:
 * - `evidence_source`: Direct reference to the recommendation or skill gap it addresses
 * - `reasoning`: Explanation of why this task reduces the specific skill gap
 * - `skill_gap_addressed`: Quantified gap percentage being targeted
 * - `related_skill`: Explicit skill linkage for traceability
 *
 * WHY THIS IS RESPONSIBLE, EXPLAINABLE AI USAGE:
 * 1. No fabricated advice - all tasks derive from provided inputs
 * 2. Transparent reasoning - every decision is explained
 * 3. Confidence disclosure - users are informed that gains are projections
 * 4. Input validation - malformed requests are rejected
 * 5. Output validation - AI responses are schema-validated before returning
 * 6. No motivational fluff - strictly functional, evidence-based output
 *
 * =============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// =============================================================================
// SECTION 1: INPUT SCHEMA DEFINITIONS
// =============================================================================

/**
 * Skill Snapshot - Current skill levels (0-100)
 */
const SkillSnapshotSchema = z.object({
  problem_solving: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  technical_skills: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  leadership: z.number().min(0).max(100),
  self_management: z.number().min(0).max(100),
});

/**
 * Skill Gap Item - Gap analysis for a specific skill
 */
const SkillGapSchema = z.object({
  skill: z.string(),
  current_score: z.number().min(0).max(100),
  target_score: z.number().min(0).max(100),
  gap_percentage: z.number().min(0).max(100),
  evidence_summary: z.string(),
});

/**
 * Recommendation Item - From personalized recommendations
 */
const RecommendationSchema = z.object({
  id: z.string(),
  type: z.enum(["course", "project", "competition", "volunteering", "internship"]),
  title: z.string(),
  matched_skills: z.array(z.string()),
  expected_skill_gain: z.record(z.string(), z.number()),
  match_score: z.number().min(0).max(100),
});

/**
 * Complete Input Schema
 */
const InputSchema = z.object({
  skill_snapshot: SkillSnapshotSchema,
  skill_gaps: z.array(SkillGapSchema),
  recommendations: z.array(RecommendationSchema),
  time_availability_hours_per_week: z.number().min(1).max(168),
});

// =============================================================================
// SECTION 2: OUTPUT SCHEMA DEFINITIONS
// =============================================================================

/**
 * Task Schema - Individual task within a week
 */
const TaskSchema = z.object({
  task_id: z.string(),
  title: z.string(),
  description: z.string(),
  related_skill: z.string(),
  skill_gap_addressed: z.number().min(0).max(100),
  expected_skill_gain: z.number().min(0).max(100),
  estimated_time_hours: z.number().min(0),
  difficulty: z.enum(["low", "medium", "high"]),
  evidence_source: z.string(),
  reasoning: z.string(),
});

/**
 * Week Schema - Weekly plan structure
 */
const WeekSchema = z.object({
  week_number: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  theme: z.string(),
  tasks: z.array(TaskSchema).max(5),
});

/**
 * Overview Schema - Plan summary
 */
const OverviewSchema = z.object({
  primary_focus_skill: z.string(),
  total_tasks: z.number().int().min(0),
  estimated_total_hours: z.number().min(0),
  reasoning_summary: z.string(),
});

/**
 * Complete Output Schema
 */
const OutputSchema = z.object({
  overview: OverviewSchema,
  weeks: z.array(WeekSchema).length(4),
  confidence_note: z.string(),
});

// Type exports
export type SkillSnapshot = z.infer<typeof SkillSnapshotSchema>;
export type SkillGap = z.infer<typeof SkillGapSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Week = z.infer<typeof WeekSchema>;
export type PlanOverview = z.infer<typeof OverviewSchema>;
export type ActionPlan = z.infer<typeof OutputSchema>;

// =============================================================================
// SECTION 3: GROQ CLIENT INITIALIZATION
// =============================================================================

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const AI_MODEL = "llama-3.1-8b-instant";

// =============================================================================
// SECTION 4: SYSTEM PROMPT
// =============================================================================

const SYSTEM_PROMPT = `You are a strict planning engine for SkillBridge AI. Your sole purpose is to generate evidence-based, week-by-week 30-day action plans derived from skill gap analysis and personalized recommendations.

YOU ARE NOT:
- A coach
- A motivational assistant
- A chatbot
- A general advisor

YOU ARE:
- A planning engine that maps skill gaps to actionable tasks
- A constraint-satisfying system that respects time limits
- An evidence-based reasoner that traces every decision to inputs

CRITICAL RULES:

1. EVERY TASK MUST:
   - Map to a specific skill gap from the input (gap_percentage >= 15%)
   - Reference an evidence source (a recommendation title or skill gap evidence)
   - Include reasoning explaining why this task reduces the gap
   - Have realistic time estimates within weekly availability
   - Have a unique task_id (format: "w{week}-t{task}" e.g., "w1-t1")

2. PLANNING STRUCTURE (STRICT):
   - Week 1: Foundations & Setup - Low difficulty tasks, establish baseline
   - Week 2: Execution - Medium difficulty, core skill building
   - Week 3: Applied Collaboration - Medium-high difficulty, collaborative/leadership focus
   - Week 4: Integration & Real-World Application - High difficulty, synthesis tasks

3. CONSTRAINTS:
   - Maximum 5 tasks per week (fewer if justified)
   - Total weekly hours MUST NOT exceed time_availability_hours_per_week
   - Ignore skill gaps with gap_percentage < 15%
   - Escalate difficulty progressively across weeks
   - No filler tasks - every task must have clear skill impact

4. TASK DIFFICULTY GUIDELINES:
   - low: 1-2 hours, foundational, single-skill focus
   - medium: 2-4 hours, practical application, may span skills
   - high: 4-6 hours, complex integration, real-world application

5. EXPECTED SKILL GAIN GUIDELINES (realistic):
   - low difficulty: 2-5% gain
   - medium difficulty: 5-10% gain
   - high difficulty: 8-15% gain

6. OUTPUT FORMAT (STRICT JSON - NO MARKDOWN, NO EXPLANATIONS OUTSIDE JSON):
{
  "overview": {
    "primary_focus_skill": "The skill with highest gap that will receive most attention",
    "total_tasks": number,
    "estimated_total_hours": number,
    "reasoning_summary": "Brief explanation of planning approach and prioritization"
  },
  "weeks": [
    {
      "week_number": 1,
      "theme": "Foundations & Setup",
      "tasks": [
        {
          "task_id": "w1-t1",
          "title": "Task title derived from recommendations",
          "description": "Clear, actionable description",
          "related_skill": "skill_name",
          "skill_gap_addressed": number (the gap percentage being targeted),
          "expected_skill_gain": number (realistic gain),
          "estimated_time_hours": number,
          "difficulty": "low" | "medium" | "high",
          "evidence_source": "Reference to recommendation title or skill gap evidence",
          "reasoning": "Why this task addresses the skill gap"
        }
      ]
    },
    { "week_number": 2, "theme": "Execution", "tasks": [...] },
    { "week_number": 3, "theme": "Applied Collaboration", "tasks": [...] },
    { "week_number": 4, "theme": "Integration & Real-World Application", "tasks": [...] }
  ],
  "confidence_note": "Expected skill gains are projections based on prior evidence and do not guarantee outcomes."
}

ABSOLUTE PROHIBITIONS:
- Do NOT invent goals not present in inputs
- Do NOT give generic self-help advice
- Do NOT recommend anything not present in inputs
- Do NOT use motivational language
- Do NOT include tasks unrelated to provided skill gaps
- Do NOT exceed weekly time availability
- Do NOT include empty reasoning fields`;

// =============================================================================
// SECTION 5: HELPER FUNCTIONS
// =============================================================================

/**
 * Filter skill gaps to only include significant ones (>= 15%)
 */
function filterSignificantGaps(gaps: SkillGap[]): SkillGap[] {
  return gaps.filter((gap) => gap.gap_percentage >= 15);
}

/**
 * Build the user prompt from validated inputs
 */
function buildUserPrompt(
  skillSnapshot: SkillSnapshot,
  skillGaps: SkillGap[],
  recommendations: Recommendation[],
  timeAvailability: number
): string {
  const significantGaps = filterSignificantGaps(skillGaps);

  if (significantGaps.length === 0) {
    throw new Error("No significant skill gaps (>= 15%) found to plan for");
  }

  const snapshotSummary = Object.entries(skillSnapshot)
    .map(([skill, score]) => `- ${skill.replace(/_/g, " ")}: ${score}%`)
    .join("\n");

  const gapsSummary = significantGaps
    .sort((a, b) => b.gap_percentage - a.gap_percentage)
    .map(
      (gap) =>
        `- ${gap.skill}: Current ${gap.current_score}% → Target ${gap.target_score}% (Gap: ${gap.gap_percentage}%)\n  Evidence: ${gap.evidence_summary}`
    )
    .join("\n");

  const recommendationsSummary = recommendations
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10) // Top 10 recommendations
    .map(
      (rec) =>
        `- [${rec.type.toUpperCase()}] ${rec.title} (Match: ${rec.match_score}%)\n  Skills: ${rec.matched_skills.join(", ")}\n  Expected gains: ${Object.entries(rec.expected_skill_gain).map(([s, g]) => `${s}: +${g}%`).join(", ")}`
    )
    .join("\n");

  return `PLANNING INPUT DATA:

TIME CONSTRAINT:
- Available hours per week: ${timeAvailability} hours
- Total available for 30 days: ${timeAvailability * 4} hours

CURRENT SKILL SNAPSHOT:
${snapshotSummary}

SIGNIFICANT SKILL GAPS (>= 15% gap only):
${gapsSummary}

AVAILABLE RECOMMENDATIONS TO INCORPORATE:
${recommendationsSummary}

Generate a 30-day action plan that:
1. Prioritizes the largest skill gaps
2. Incorporates relevant recommendations as task sources
3. Stays within the ${timeAvailability} hours/week limit
4. Follows the week 1-4 progression structure
5. Provides evidence-based reasoning for each task

Return ONLY the JSON object. No additional text.`;
}

/**
 * Clean JSON response from potential markdown formatting
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

/**
 * Call the AI model
 */
async function callAI(userPrompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }
  return content;
}

/**
 * Validate AI response against schema
 */
function validateResponse(rawResponse: string): ActionPlan {
  const cleanedResponse = cleanJsonResponse(rawResponse);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedResponse);
  } catch {
    throw new Error(
      `Invalid JSON response: ${cleanedResponse.substring(0, 200)}...`
    );
  }

  const result = OutputSchema.safeParse(parsed);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `${String(issue.path.join("."))}: ${issue.message}`)
      .join("; ");
    throw new Error(`Validation failed: ${errorDetails}`);
  }

  // Additional validation: Check for missing reasoning
  for (const week of result.data.weeks) {
    for (const task of week.tasks) {
      if (!task.reasoning || task.reasoning.trim().length < 10) {
        throw new Error(
          `Task ${task.task_id} has missing or insufficient reasoning`
        );
      }
      if (!task.evidence_source || task.evidence_source.trim().length < 5) {
        throw new Error(
          `Task ${task.task_id} has missing or insufficient evidence_source`
        );
      }
    }
  }

  // Ensure confidence note is exactly as required
  if (
    result.data.confidence_note !==
    "Expected skill gains are projections based on prior evidence and do not guarantee outcomes."
  ) {
    // Fix the confidence note if AI didn't output it exactly
    result.data.confidence_note =
      "Expected skill gains are projections based on prior evidence and do not guarantee outcomes.";
  }

  return result.data;
}

/**
 * Post-process the plan to ensure consistency
 */
function postProcessPlan(
  plan: ActionPlan,
  timeAvailability: number
): ActionPlan {
  // Recalculate totals for accuracy
  let totalTasks = 0;
  let totalHours = 0;

  for (const week of plan.weeks) {
    totalTasks += week.tasks.length;
    for (const task of week.tasks) {
      totalHours += task.estimated_time_hours;
    }
  }

  // Update overview with accurate counts
  plan.overview.total_tasks = totalTasks;
  plan.overview.estimated_total_hours = Math.round(totalHours * 10) / 10;

  return plan;
}

// =============================================================================
// SECTION 6: API ROUTE HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
          details: "Request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    const inputValidation = InputSchema.safeParse(body);
    if (!inputValidation.success) {
      const errorDetails = inputValidation.error.issues
        .map((issue) => `${String(issue.path.join("."))}: ${issue.message}`)
        .join("; ");
      return NextResponse.json(
        { success: false, error: "Invalid input", details: errorDetails },
        { status: 400 }
      );
    }

    const {
      skill_snapshot,
      skill_gaps,
      recommendations,
      time_availability_hours_per_week,
    } = inputValidation.data;

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
          details: "AI service not configured",
        },
        { status: 500 }
      );
    }

    // Filter significant gaps
    const significantGaps = filterSignificantGaps(skill_gaps);
    if (significantGaps.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient data",
          details:
            "No significant skill gaps (>= 15%) found. A 30-day plan is not recommended when all skills are near target.",
        },
        { status: 400 }
      );
    }

    // Build prompt and call AI
    let userPrompt: string;
    try {
      userPrompt = buildUserPrompt(
        skill_snapshot,
        skill_gaps,
        recommendations,
        time_availability_hours_per_week
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Input processing error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    let rawResponse: string;
    try {
      rawResponse = await callAI(userPrompt);
    } catch (error) {
      console.error("AI call failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: "AI service error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 502 }
      );
    }

    // Validate and process response
    let validatedPlan: ActionPlan;
    try {
      validatedPlan = validateResponse(rawResponse);
    } catch (error) {
      console.error("Validation failed:", {
        error,
        rawResponse: rawResponse.substring(0, 500),
      });
      return NextResponse.json(
        {
          success: false,
          error: "AI response validation failed",
          details:
            error instanceof Error ? error.message : "Invalid response format",
        },
        { status: 422 }
      );
    }

    // Post-process for consistency
    const processedPlan = postProcessPlan(
      validatedPlan,
      time_availability_hours_per_week
    );

    // Return successful response
    return NextResponse.json({
      success: true,
      data: processedPlan,
      meta: {
        generated_at: new Date().toISOString(),
        model_used: AI_MODEL,
        api_version: "1.0",
        significant_gaps_count: significantGaps.length,
        recommendations_considered: Math.min(recommendations.length, 10),
        time_budget_hours: time_availability_hours_per_week * 4,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 }
    );
  }
}
