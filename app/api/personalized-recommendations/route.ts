/**
 * =============================================================================
 * PERSONALIZED RECOMMENDATIONS API
 * =============================================================================
 *
 * PURPOSE:
 * This API generates personalized learning opportunity recommendations based on
 * a student's skill snapshot, skill gap analysis, and profile information.
 *
 * FEATURES:
 * 1. Generates tailored recommendations for courses, projects, competitions, internships
 * 2. Match scores based on skill alignment and student goals
 * 3. Expected skill improvements for each recommendation
 * 4. AI reasoning for transparency
 * 5. Time-compatible filtering based on student availability
 *
 * =============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// =============================================================================
// SECTION 1: SCHEMA DEFINITIONS
// =============================================================================

/**
 * Skill Signal from the Skill Snapshot
 */
const SkillSignalSchema = z.object({
  evidence_found: z.boolean(),
  evidence_phrases: z.array(z.string()),
  evidence_sources: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

/**
 * Skill Snapshot Input
 */
const SkillSnapshotInputSchema = z.object({
  problem_solving: SkillSignalSchema,
  communication: SkillSignalSchema,
  technical_skills: SkillSignalSchema,
  creativity: SkillSignalSchema,
  leadership: SkillSignalSchema,
  self_management: SkillSignalSchema,
});

/**
 * Skill Gap Item from Skill Gap Analysis
 */
const SkillGapItemSchema = z.object({
  skill: z.string(),
  current_level: z.number(),
  goal_level: z.number(),
  gap: z.number(),
});

/**
 * Skill Gap Analysis Input (simplified for recommendations)
 */
const SkillGapAnalysisInputSchema = z.object({
  skill_gaps: z.array(SkillGapItemSchema).optional(),
  priority_skills: z.array(z.string()).optional(),
  overall_summary: z.string().optional(),
});

/**
 * Student Profile Input
 */
const StudentProfileSchema = z.object({
  grade: z.number().int().min(6).max(12),
  interests: z.string().optional(),
  interest_categories: z.array(z.string()).optional(),
  goals: z.array(z.string()),
  goals_free_text: z.string().optional(),
  time_availability_hours_per_week: z.number().min(0).max(168),
  learning_preferences: z.array(z.string()).optional(),
});

/**
 * Complete Input Schema
 */
const InputSchema = z.object({
  student_profile: StudentProfileSchema,
  skill_snapshot: SkillSnapshotInputSchema,
  skill_gap_analysis: SkillGapAnalysisInputSchema.optional(),
});

/**
 * Skill Alignment - expected improvement per skill
 */
const SkillAlignmentSchema = z.object({
  skill: z.string(),
  expected_improvement: z.number().min(0).max(100),
});

/**
 * Base Recommendation Schema
 */
const BaseRecommendationSchema = z.object({
  title: z.string(),
  platform_or_provider: z.string(),
  match_score: z.number().min(0).max(100),
  skill_alignment: z.array(SkillAlignmentSchema),
  duration_weeks: z.number().min(1).max(52),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  reasoning: z.string(),
});

/**
 * Course Recommendation
 */
const CourseRecommendationSchema = BaseRecommendationSchema.extend({
  type: z.literal("course"),
  format: z.enum(["online", "in-person", "hybrid"]).optional(),
});

/**
 * Project Recommendation
 */
const ProjectRecommendationSchema = BaseRecommendationSchema.extend({
  type: z.literal("project"),
  project_type: z.enum(["solo", "team", "open-source"]).optional(),
  skills_used: z.array(z.string()).optional(),
});

/**
 * Competition Recommendation
 */
const CompetitionRecommendationSchema = BaseRecommendationSchema.extend({
  type: z.literal("competition"),
  deadline: z.string().optional(),
  prize: z.string().optional(),
});

/**
 * Complete AI Response Schema
 */
const AIResponseSchema = z.object({
  courses: z.array(CourseRecommendationSchema),
  projects: z.array(ProjectRecommendationSchema),
  competitions: z.array(CompetitionRecommendationSchema),
  summary: z.string(),
});

// Type exports
export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type SkillSnapshotInput = z.infer<typeof SkillSnapshotInputSchema>;
export type SkillGapAnalysisInput = z.infer<typeof SkillGapAnalysisInputSchema>;
export type CourseRecommendation = z.infer<typeof CourseRecommendationSchema>;
export type ProjectRecommendation = z.infer<typeof ProjectRecommendationSchema>;
export type CompetitionRecommendation = z.infer<
  typeof CompetitionRecommendationSchema
>;
export type AIResponse = z.infer<typeof AIResponseSchema>;

// =============================================================================
// SECTION 2: GROQ CLIENT INITIALIZATION (Fast & Reliable Llama 3.1)
// =============================================================================

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const AI_MODEL = "llama-3.1-8b-instant";

// =============================================================================
// SECTION 3: SYSTEM PROMPT
// =============================================================================

const SYSTEM_PROMPT = `You are a strict AI reasoning engine for SkillBridge AI. Your purpose is to analyze student skills and gaps, then suggest personalized learning opportunities (courses, projects, competitions) that fit the student.

CRITICAL RULES:
1. Output ONLY valid JSON matching the exact schema provided
2. Assign realistic match scores based on skill alignment and student goals
3. Provide expected skill improvements that are achievable
4. Only recommend opportunities compatible with student's available time per week
5. Prioritize opportunities aligned with student's interests and goals
6. Include concise but insightful reasoning for each recommendation

**IMPORTANT: ALL RECOMMENDATIONS MUST BE REAL AND VERIFIABLE**
- Every course, project, and competition MUST be a real, existing opportunity
- Use only well-known, reputable platforms and organizations
- Ensure all information (duration, format, provider) is accurate
- Do NOT invent or fabricate any opportunities
- Diversify recommendations - don't always suggest the same platforms
- Tailor recommendations to the student's specific interests and goals

MATCH SCORE GUIDELINES:
- 90-100: Perfect fit - aligns with interests, goals, and current skill level
- 80-89: Strong fit - addresses skill gaps while leveraging strengths
- 70-79: Good fit - reasonable alignment with some growth areas
- 60-69: Moderate fit - some alignment but requires stretch
- Below 60: Avoid recommending unless specifically relevant

SKILL IMPROVEMENT GUIDELINES (realistic expectations):
- Courses: 5-15% improvement per skill depending on duration and intensity
- Projects: 8-20% improvement through hands-on practice
- Competitions: 5-12% improvement plus recognition benefits

DURATION GUIDELINES (based on available time):
- 1-3 hours/week available: Recommend shorter (2-4 week) opportunities
- 4-6 hours/week available: Can handle 4-8 week opportunities
- 7-10 hours/week available: Can handle 6-12 week opportunities
- 11+ hours/week available: Can handle intensive or longer programs

LEVEL ASSIGNMENT:
- Beginner: Skill level < 50% OR no prior experience in area
- Intermediate: Skill level 50-75% OR some experience
- Advanced: Skill level > 75% AND significant experience

OUTPUT FORMAT (strict JSON only):
{
  "courses": [
    {
      "type": "course",
      "title": "EXACT real course name from a real platform",
      "platform_or_provider": "Real Platform Name",
      "match_score": number (0-100),
      "skill_alignment": [
        { "skill": "skill_name", "expected_improvement": number (0-100) }
      ],
      "duration_weeks": number,
      "level": "Beginner" | "Intermediate" | "Advanced",
      "reasoning": "Why this course fits this student",
      "format": "online" | "in-person" | "hybrid"
    }
  ],
  "projects": [
    {
      "type": "project",
      "title": "Real project type or specific project name",
      "platform_or_provider": "Real Platform or Type",
      "match_score": number (0-100),
      "skill_alignment": [...],
      "duration_weeks": number,
      "level": "Beginner" | "Intermediate" | "Advanced",
      "reasoning": "Why this project fits",
      "project_type": "solo" | "team" | "open-source",
      "skills_used": ["skill1", "skill2"]
    }
  ],
  "competitions": [
    {
      "type": "competition",
      "title": "EXACT real competition name",
      "platform_or_provider": "Real organizing body",
      "match_score": number (0-100),
      "skill_alignment": [...],
      "duration_weeks": number,
      "level": "Beginner" | "Intermediate" | "Advanced",
      "reasoning": "Why this competition fits",
      "deadline": "Typical registration period or 'Year-round'",
      "prize": "Real prize description if applicable"
    }
  ],
  "summary": "2-3 sentence summary of the recommendations and why they fit this student"
}

IMPORTANT:
- Generate 4-5 recommendations per category (courses, projects, competitions)
- Sort recommendations within each category by match_score (highest first)
- Ensure total weekly time commitment across all recommendations doesn't exceed student availability
- Be encouraging but realistic in expected improvements
- Reference specific student skills, gaps, and interests in reasoning
- Do NOT make up course names, competition names, or organizations`;

// =============================================================================
// SECTION 4: HELPER FUNCTIONS
// =============================================================================

function buildUserPrompt(
  studentProfile: StudentProfile,
  skillSnapshot: SkillSnapshotInput,
  skillGapAnalysis?: SkillGapAnalysisInput
): string {
  // Build skill levels summary
  const skillLevels = Object.entries(skillSnapshot)
    .map(([skill, data]) => {
      const level = Math.round(data.confidence * 100);
      return `- ${skill.replace(/_/g, " ")}: ${level}% (Evidence: ${
        data.evidence_found ? "Yes" : "No"
      })`;
    })
    .join("\n");

  // Build skill gaps summary if available
  let gapsSection = "";
  if (skillGapAnalysis?.skill_gaps && skillGapAnalysis.skill_gaps.length > 0) {
    const gapsSummary = skillGapAnalysis.skill_gaps
      .map(
        (gap) =>
          `- ${gap.skill}: Current ${gap.current_level}% → Goal ${gap.goal_level}% (Gap: ${gap.gap}%)`
      )
      .join("\n");
    gapsSection = `\nSKILL GAPS TO ADDRESS:\n${gapsSummary}`;

    if (
      skillGapAnalysis.priority_skills &&
      skillGapAnalysis.priority_skills.length > 0
    ) {
      gapsSection += `\nPriority Skills: ${skillGapAnalysis.priority_skills.join(
        ", "
      )}`;
    }
  }

  return `STUDENT PROFILE:
- Grade: ${studentProfile.grade}
- Goals: ${studentProfile.goals.join(", ")}${
    studentProfile.goals_free_text ? ` | ${studentProfile.goals_free_text}` : ""
  }
- Interests: ${studentProfile.interests || "Not specified"}
- Interest Categories: ${
    studentProfile.interest_categories?.join(", ") || "Not specified"
  }
- Available Time: ${studentProfile.time_availability_hours_per_week} hours/week
- Learning Preferences: ${
    studentProfile.learning_preferences?.join(", ") || "Not specified"
  }

SKILL SNAPSHOT:
${skillLevels}
${gapsSection}

Based on this student's profile, skills, and gaps, generate personalized recommendations for courses, projects, and competitions. Return ONLY the JSON object.`;
}

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

async function callLlamaAPI(userPrompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }
  return content;
}

function parseAndValidateResponse(rawResponse: string): AIResponse {
  const cleanedResponse = cleanJsonResponse(rawResponse);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedResponse);
  } catch {
    throw new Error(
      `Invalid JSON response: ${cleanedResponse.substring(0, 200)}...`
    );
  }

  const result = AIResponseSchema.safeParse(parsed);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `${String(issue.path.join("."))}: ${issue.message}`)
      .join("; ");
    throw new Error(`Validation failed: ${errorDetails}`);
  }

  return result.data;
}

/**
 * Get match level based on score
 */
function getMatchLevel(score: number): "high" | "medium" | "low" {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

/**
 * Post-process recommendations to add match levels and filter by time
 */
function postProcessRecommendations(
  response: AIResponse,
  availableHours: number
): AIResponse & {
  match_levels: { high: string; medium: string; low: string };
} {
  // Calculate approximate weekly hours for each recommendation type
  const weeklyHoursEstimate = {
    course: 3,
    project: 4,
    competition: 2,
  };

  // Add match levels to all recommendations
  const addMatchLevel = <T extends { match_score: number }>(items: T[]) =>
    items.map((item) => ({
      ...item,
      match_level: getMatchLevel(item.match_score),
    }));

  return {
    courses: addMatchLevel(response.courses),
    projects: addMatchLevel(response.projects),
    competitions: addMatchLevel(response.competitions),
    summary: response.summary,
    match_levels: {
      high: "85%+" as const,
      medium: "70-84%" as const,
      low: "<70%" as const,
    } as { high: string; medium: string; low: string },
  };
}

// =============================================================================
// SECTION 5: API ROUTE HANDLER
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

    const { student_profile, skill_snapshot, skill_gap_analysis } =
      inputValidation.data;

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
          details: "Groq API key not configured",
        },
        { status: 500 }
      );
    }

    // Build prompt and call AI
    const userPrompt = buildUserPrompt(
      student_profile,
      skill_snapshot,
      skill_gap_analysis
    );

    let rawResponse: string;
    try {
      rawResponse = await callLlamaAPI(userPrompt);
    } catch (error) {
      console.error("Llama API call failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: "AI service error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 502 }
      );
    }

    // Validate response
    let validatedResponse: AIResponse;
    try {
      validatedResponse = parseAndValidateResponse(rawResponse);
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

    // Post-process to add match levels
    const processedResponse = postProcessRecommendations(
      validatedResponse,
      student_profile.time_availability_hours_per_week
    );

    // Return response
    return NextResponse.json({
      success: true,
      data: processedResponse,
      meta: {
        student_grade: student_profile.grade,
        goals_count: student_profile.goals.length,
        time_available: student_profile.time_availability_hours_per_week,
        total_recommendations:
          processedResponse.courses.length +
          processedResponse.projects.length +
          processedResponse.competitions.length,
        analyzed_at: new Date().toISOString(),
        model: AI_MODEL,
        api_version: "1.0",
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
