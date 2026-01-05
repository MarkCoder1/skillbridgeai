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
 * 7. Growth caps enforced - max +25% improvement per skill in 30 days
 *
 * =============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  applyGrowthCapsToPlanTasks,
  MAX_30_DAY_IMPROVEMENT,
} from "../lib/responsible-ai";

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
   - Maximum 3-4 tasks per week (prefer fewer, focused tasks)
   - Total weekly hours MUST NOT exceed time_availability_hours_per_week
   - Ignore skill gaps with gap_percentage < 15%
   - Escalate difficulty progressively across weeks
   - No filler tasks - every task must have clear skill impact
   - Keep descriptions and reasoning BRIEF (1-2 sentences max)

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
    max_tokens: 8192,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }
  return content;
}

/**
 * Normalize AI response to fix common issues before validation
 * - Converts difficulty values to lowercase
 * - Fixes common AI output variations
 * - Maps alternative difficulty names to valid values
 */
function normalizeAIResponse(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== 'object') return parsed;
  
  const data = parsed as Record<string, unknown>;
  
  if (Array.isArray(data.weeks)) {
    data.weeks = data.weeks.map((week: unknown) => {
      if (!week || typeof week !== 'object') return week;
      const w = week as Record<string, unknown>;
      
      if (Array.isArray(w.tasks)) {
        w.tasks = w.tasks.map((task: unknown) => {
          if (!task || typeof task !== 'object') return task;
          const t = task as Record<string, unknown>;
          
          // Normalize difficulty to valid enum values
          if (typeof t.difficulty === 'string') {
            const originalDifficulty = t.difficulty;
            const diffLower = t.difficulty.toLowerCase().trim();
            
            // Map various AI outputs to valid values
            const difficultyMap: Record<string, string> = {
              'low': 'low',
              'easy': 'low',
              'beginner': 'low',
              'simple': 'low',
              'basic': 'low',
              'medium': 'medium',
              'moderate': 'medium',
              'intermediate': 'medium',
              'mid': 'medium',
              'average': 'medium',
              'high': 'high',
              'hard': 'high',
              'difficult': 'high',
              'advanced': 'high',
              'challenging': 'high',
              'complex': 'high',
            };
            
            if (difficultyMap[diffLower]) {
              t.difficulty = difficultyMap[diffLower];
            } else {
              // Default fallback based on week number if available
              const weekNum = typeof w.week_number === 'number' ? w.week_number : 2;
              let normalizedTo: string;
              if (weekNum === 1) {
                normalizedTo = 'low';
              } else if (weekNum === 4) {
                normalizedTo = 'high';
              } else {
                normalizedTo = 'medium';
              }
              t.difficulty = normalizedTo;
              console.warn(`[generate-30-day-plan] Unknown difficulty "${originalDifficulty}" normalized to "${normalizedTo}"`);
            }
          } else if (t.difficulty === undefined || t.difficulty === null) {
            // Set default difficulty based on week
            const weekNum = typeof w.week_number === 'number' ? w.week_number : 2;
            if (weekNum === 1) {
              t.difficulty = 'low';
            } else if (weekNum === 4) {
              t.difficulty = 'high';
            } else {
              t.difficulty = 'medium';
            }
          }
          
          return t;
        });
      }
      
      return w;
    });
  }
  
  return data;
}

/**
 * Check if JSON response appears to be truncated
 */
function isJsonTruncated(text: string): boolean {
  const cleaned = cleanJsonResponse(text).trim();
  
  // Count opening and closing braces/brackets
  const openBraces = (cleaned.match(/{/g) || []).length;
  const closeBraces = (cleaned.match(/}/g) || []).length;
  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/\]/g) || []).length;
  
  // If braces/brackets don't match, it's likely truncated
  if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
    return true;
  }
  
  // Check if it ends with valid JSON terminator
  if (!cleaned.endsWith('}') && !cleaned.endsWith(']')) {
    return true;
  }
  
  // Try to parse to be sure
  try {
    JSON.parse(cleaned);
    return false;
  } catch {
    return true;
  }
}

/**
 * Validate AI response against schema
 */
function validateResponse(rawResponse: string): ActionPlan {
  const cleanedResponse = cleanJsonResponse(rawResponse);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedResponse);
  } catch (parseError) {
    // Provide more specific error for truncated responses
    const isTruncated = isJsonTruncated(cleanedResponse);
    if (isTruncated) {
      throw new Error(
        `Response was truncated (${cleanedResponse.length} chars). Last 50 chars: "...${cleanedResponse.slice(-50)}"`
      );
    }
    throw new Error(
      `Invalid JSON response: ${cleanedResponse.substring(0, 200)}...`
    );
  }

  // Normalize common AI output variations before validation
  parsed = normalizeAIResponse(parsed);

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
 * Post-process the plan to ensure consistency and apply growth caps
 */
function postProcessPlan(
  plan: ActionPlan,
  timeAvailability: number,
  skillSnapshot: Record<string, number>
): ActionPlan & { growth_cap_applied: boolean; growth_cap_note: string } {
  // Apply growth caps to plan tasks (max +25% per skill across 30 days)
  const cappedWeeks = applyGrowthCapsToPlanTasks(plan.weeks, skillSnapshot);
  
  // Track if any gains were capped
  let growthCapApplied = false;
  
  // Recalculate totals for accuracy
  let totalTasks = 0;
  let totalHours = 0;

  for (const week of cappedWeeks) {
    totalTasks += week.tasks.length;
    for (const task of week.tasks) {
      totalHours += task.estimated_time_hours;
      if (task.gain_capped) {
        growthCapApplied = true;
      }
    }
  }

  // Update overview with accurate counts
  plan.overview.total_tasks = totalTasks;
  plan.overview.estimated_total_hours = Math.round(totalHours * 10) / 10;

  return {
    ...plan,
    weeks: cappedWeeks as ActionPlan["weeks"],
    growth_cap_applied: growthCapApplied,
    growth_cap_note: `Skill gains are capped at +${MAX_30_DAY_IMPROVEMENT}% per skill over 30 days. Any projected gains beyond this limit are long-term goals.`,
  };
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

    let rawResponse: string = "";
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        rawResponse = await callAI(userPrompt);
        
        // Check for truncated response
        if (isJsonTruncated(rawResponse)) {
          console.warn(`[generate-30-day-plan] Attempt ${attempt + 1}: Response appears truncated, length: ${rawResponse.length}`);
          if (attempt < MAX_RETRIES) {
            console.log(`[generate-30-day-plan] Retrying...`);
            continue;
          }
          throw new Error("AI response was truncated after multiple attempts. The generated plan may be too complex.");
        }
        
        // Response looks complete, break out of retry loop
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`AI call attempt ${attempt + 1} failed:`, error);
        
        if (attempt >= MAX_RETRIES) {
          return NextResponse.json(
            {
              success: false,
              error: "AI service error",
              details: lastError.message,
            },
            { status: 502 }
          );
        }
      }
    }
    
    // TypeScript guard - rawResponse should always be set if we reach here
    if (!rawResponse) {
      return NextResponse.json(
        {
          success: false,
          error: "AI service error",
          details: lastError?.message || "Failed to get response after retries",
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

    // Post-process for consistency and apply growth caps
    const processedPlan = postProcessPlan(
      validatedPlan,
      time_availability_hours_per_week,
      skill_snapshot
    );

    // Return successful response
    return NextResponse.json({
      success: true,
      data: processedPlan,
      meta: {
        generated_at: new Date().toISOString(),
        model_used: AI_MODEL,
        api_version: "1.1", // Updated for growth cap enforcement
        significant_gaps_count: significantGaps.length,
        recommendations_considered: Math.min(recommendations.length, 10),
        time_budget_hours: time_availability_hours_per_week * 4,
        growth_cap_applied: processedPlan.growth_cap_applied,
        max_30_day_improvement: MAX_30_DAY_IMPROVEMENT,
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
