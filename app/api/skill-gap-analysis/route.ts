/**
 * =============================================================================
 * SKILL GAP ANALYSIS API
 * =============================================================================
 * 
 * PURPOSE:
 * This API analyzes a student's skill snapshot, compares it with their goals,
 * time availability, and learning context to generate actionable skill
 * development recommendations with expected timelines and improvement steps.
 * 
 * FEATURES:
 * 1. Calculates skill gaps (goal_level - current_level)
 * 2. Generates realistic expected progress based on time availability
 * 3. Provides actionable, time-bound improvement steps
 * 4. Aligns skill importance with student goals
 * 5. Includes reasoning for transparency and judge-proofing
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { z } from "zod";

// =============================================================================
// SECTION 1: SCHEMA DEFINITIONS
// =============================================================================

/**
 * Valid evidence sources for provenance tracking
 */
const EvidenceSourceSchema = z.enum(["interests", "goals", "past_activities", "achievements"]);

/**
 * Skill Signal from the Skill Snapshot
 */
const SkillSignalSchema = z.object({
  evidence_found: z.boolean(),
  evidence_phrases: z.array(z.string()),
  evidence_sources: z.array(EvidenceSourceSchema),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

/**
 * Complete Skill Snapshot from the intake analysis
 */
const SkillSnapshotSchema = z.object({
  problem_solving: SkillSignalSchema,
  communication: SkillSignalSchema,
  technical_skills: SkillSignalSchema,
  creativity: SkillSignalSchema,
  leadership: SkillSignalSchema,
  self_management: SkillSignalSchema,
});

/**
 * Student Context for gap analysis
 */
const StudentContextSchema = z.object({
  grade: z.number().int().min(6).max(12),
  interests_free_text: z.string().optional(),
  interests_categories: z.array(z.string()).optional(),
  goals_selected: z.array(z.string()),
  goals_free_text: z.string().optional(),
  time_availability_hours_per_week: z.number().min(0).max(168),
  learning_preferences: z.array(z.string()).optional(),
});

/**
 * Input Schema: Complete input for skill gap analysis
 */
const InputSchema = z.object({
  skill_snapshot: SkillSnapshotSchema,
  student_context: StudentContextSchema,
});

/**
 * Single Skill Gap Analysis Result
 */
const SkillGapResultSchema = z.object({
  skill: z.string(),
  current_level: z.number().min(0).max(100),
  goal_level: z.number().min(0).max(100),
  gap: z.number(),
  expected_level_after: z.number().min(0).max(100),
  timeline: z.string(),
  why_it_matters: z.string(),
  actionable_steps: z.array(z.object({
    step: z.string(),
    time_required: z.string(),
    expected_impact: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    why: z.string(), // Reasoning behind why this specific step is recommended
  })),
  reasoning: z.string(),
});

/**
 * Skill without evidence - needs user input or development
 */
const SkillWithoutEvidenceSchema = z.object({
  skill: z.string(),
  display_name: z.string(),
  goal_relevance: z.enum(["high", "medium", "low"]),
  suggestion: z.string(),
});

/**
 * Complete AI Response Schema
 */
const AIResponseSchema = z.object({
  skill_gaps: z.array(SkillGapResultSchema),
  overall_summary: z.string(),
  priority_skills: z.array(z.string()),
  total_weekly_time_recommended: z.string(),
});

/**
 * Extended response with skills without evidence (added post-AI)
 */
interface ExtendedResponse extends AIResponse {
  skills_without_evidence: z.infer<typeof SkillWithoutEvidenceSchema>[];
}

// Type exports
export type SkillSnapshot = z.infer<typeof SkillSnapshotSchema>;
export type StudentContext = z.infer<typeof StudentContextSchema>;
export type SkillGapResult = z.infer<typeof SkillGapResultSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;

// =============================================================================
// SECTION 2: HUGGING FACE CLIENT INITIALIZATION
// =============================================================================

const huggingface = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

const AI_MODEL = "Qwen/Qwen2.5-72B-Instruct";

// =============================================================================
// SECTION 3: GOAL-TO-SKILL MAPPING
// =============================================================================

/**
 * Maps common student goals to relevant skills with importance weights
 * This provides a deterministic baseline for goal-skill alignment
 */
const GOAL_SKILL_WEIGHTS: Record<string, Record<string, number>> = {
  // STEM Goals
  "stem_career": { problem_solving: 0.95, technical_skills: 0.95, self_management: 0.8, creativity: 0.7, communication: 0.6, leadership: 0.5 },
  "engineering": { problem_solving: 0.95, technical_skills: 0.95, creativity: 0.8, self_management: 0.75, communication: 0.6, leadership: 0.5 },
  "coding": { technical_skills: 0.95, problem_solving: 0.9, self_management: 0.75, creativity: 0.7, communication: 0.5, leadership: 0.4 },
  "science": { problem_solving: 0.9, technical_skills: 0.85, self_management: 0.8, communication: 0.7, creativity: 0.65, leadership: 0.5 },
  
  // Leadership/Business Goals
  "leadership": { leadership: 0.95, communication: 0.9, self_management: 0.85, problem_solving: 0.7, creativity: 0.6, technical_skills: 0.5 },
  "entrepreneurship": { leadership: 0.9, creativity: 0.9, communication: 0.85, problem_solving: 0.8, self_management: 0.8, technical_skills: 0.6 },
  "business": { leadership: 0.85, communication: 0.85, self_management: 0.8, problem_solving: 0.75, creativity: 0.6, technical_skills: 0.5 },
  
  // Creative Goals
  "creative_career": { creativity: 0.95, communication: 0.8, self_management: 0.75, technical_skills: 0.7, problem_solving: 0.6, leadership: 0.5 },
  "design": { creativity: 0.95, technical_skills: 0.8, communication: 0.75, problem_solving: 0.7, self_management: 0.7, leadership: 0.5 },
  "arts": { creativity: 0.95, communication: 0.75, self_management: 0.7, technical_skills: 0.5, problem_solving: 0.5, leadership: 0.4 },
  
  // Academic Goals
  "college_prep": { self_management: 0.9, communication: 0.85, problem_solving: 0.85, technical_skills: 0.75, leadership: 0.7, creativity: 0.65 },
  "scholarships": { leadership: 0.85, communication: 0.85, self_management: 0.85, problem_solving: 0.8, creativity: 0.7, technical_skills: 0.7 },
  "academic_excellence": { self_management: 0.9, problem_solving: 0.85, communication: 0.8, technical_skills: 0.75, creativity: 0.65, leadership: 0.6 },
  
  // Default balanced weights
  "default": { problem_solving: 0.75, communication: 0.75, technical_skills: 0.75, creativity: 0.75, leadership: 0.75, self_management: 0.75 },
};

/**
 * Calculates goal level for each skill based on student's stated goals
 */
function calculateGoalLevels(goals: string[], goalsFreeText?: string): Record<string, number> {
  const skillGoalLevels: Record<string, number[]> = {
    problem_solving: [],
    communication: [],
    technical_skills: [],
    creativity: [],
    leadership: [],
    self_management: [],
  };

  // Normalize goals to lowercase for matching
  const normalizedGoals = goals.map(g => g.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  const goalText = (goalsFreeText || '').toLowerCase();

  // Check for goal keywords
  const goalKeywords: Record<string, string[]> = {
    stem_career: ['stem', 'science', 'technology', 'engineering', 'math', 'computer'],
    engineering: ['engineer', 'engineering', 'mechanical', 'electrical', 'civil'],
    coding: ['coding', 'programming', 'software', 'developer', 'web dev', 'app'],
    leadership: ['leader', 'leadership', 'lead', 'president', 'captain', 'manage'],
    entrepreneurship: ['entrepreneur', 'startup', 'business owner', 'founder'],
    creative_career: ['creative', 'artist', 'designer', 'content creator'],
    college_prep: ['college', 'university', 'admission', 'application'],
    scholarships: ['scholarship', 'financial aid', 'award'],
  };

  // Match goals to weights
  let matchedGoals: string[] = [];
  
  for (const [goalKey, keywords] of Object.entries(goalKeywords)) {
    const hasMatch = keywords.some(kw => 
      normalizedGoals.some(g => g.includes(kw.replace(/\s/g, '_'))) || 
      goalText.includes(kw)
    );
    if (hasMatch) {
      matchedGoals.push(goalKey);
    }
  }

  // If no matches, use default
  if (matchedGoals.length === 0) {
    matchedGoals = ['default'];
  }

  // Aggregate weights from all matched goals
  for (const goalKey of matchedGoals) {
    const weights = GOAL_SKILL_WEIGHTS[goalKey] || GOAL_SKILL_WEIGHTS['default'];
    for (const [skill, weight] of Object.entries(weights)) {
      skillGoalLevels[skill].push(weight * 100);
    }
  }

  // Calculate final goal levels (max of all matched goal weights)
  const result: Record<string, number> = {};
  for (const [skill, levels] of Object.entries(skillGoalLevels)) {
    result[skill] = levels.length > 0 ? Math.round(Math.max(...levels)) : 70;
  }

  return result;
}

/**
 * Calculates expected weekly time per skill based on gaps and availability
 */
function calculateTimeAllocation(
  gaps: Record<string, number>,
  availableHours: number
): Record<string, number> {
  const totalGap = Object.values(gaps).reduce((sum, gap) => sum + Math.max(0, gap), 0);
  
  if (totalGap === 0) {
    // Equal distribution if no gaps
    const perSkill = availableHours / 6;
    return Object.keys(gaps).reduce((acc, skill) => {
      acc[skill] = Math.round(perSkill * 10) / 10;
      return acc;
    }, {} as Record<string, number>);
  }

  // Proportional allocation based on gaps
  const allocation: Record<string, number> = {};
  for (const [skill, gap] of Object.entries(gaps)) {
    const proportion = Math.max(0, gap) / totalGap;
    allocation[skill] = Math.round(availableHours * proportion * 10) / 10;
  }

  return allocation;
}

// =============================================================================
// SECTION 4: SYSTEM PROMPT
// =============================================================================

const SYSTEM_PROMPT = `You are a Skill Gap Analyst for SkillBridge AI. Your purpose is to analyze a student's skill snapshot and generate actionable, personalized skill development recommendations.

CRITICAL RULES:
1. Output ONLY valid JSON matching the exact schema provided
2. Be realistic about expected improvements based on time availability
3. Align skill importance with student goals
4. Provide concrete, measurable, time-bound action steps
5. Include reasoning that connects evidence to recommendations

EXPECTED IMPROVEMENT GUIDELINES (per week of dedicated practice):
- 1-2 hours/week: 1-3% improvement over 4 weeks
- 3-5 hours/week: 3-5% improvement over 4 weeks
- 6-10 hours/week: 5-8% improvement over 4 weeks
- 10+ hours/week: 8-12% improvement over 4 weeks

ACTION STEP REQUIREMENTS:
- Each step must be specific and measurable
- Include time estimate per step
- Steps should be progressive (easy → harder)
- Relate to student's learning preferences when possible
- Consider grade level appropriateness
- MUST include a 'why' explanation for EACH step explaining why it's recommended for this specific student

REASONING MUST INCLUDE:
- Why this skill matters for student's goals
- Current evidence strength from skill snapshot
- How suggested steps address the gap
- Expected timeline justification

OUTPUT FORMAT (strict JSON only):
{
  "skill_gaps": [
    {
      "skill": "problem_solving",
      "current_level": number (0-100),
      "goal_level": number (0-100),
      "gap": number (can be negative if current > goal),
      "expected_level_after": number (0-100),
      "timeline": "X weeks",
      "why_it_matters": "string connecting skill to student goals",
      "actionable_steps": [
        {
          "step": "specific action description",
          "time_required": "X hours/week",
          "expected_impact": "+X%",
          "priority": "high" | "medium" | "low",
          "why": "explanation of why this step is recommended for this student's specific situation, goals, and current level"
        }
      ],
      "reasoning": "string explaining analysis and recommendations"
    }
  ],
  "overall_summary": "2-3 sentence summary of student's skill profile and priorities",
  "priority_skills": ["skill1", "skill2"] (top 2-3 skills to focus on),
  "total_weekly_time_recommended": "X hours/week"
}

IMPORTANT:
- ONLY include skills where gap > 0 (current_level < goal_level) AND evidence_found is true
- DO NOT include skills that have NO EVIDENCE (evidence_found: false) - these will be handled separately
- DO NOT include skills that are already at or above goal level
- Sort skill_gaps by gap size (largest gap first)
- Priority skills should align with student goals AND have significant gaps AND have evidence
- Be encouraging but realistic in expected improvements
- If a skill has no gap, negative gap, or no evidence, EXCLUDE it from skill_gaps array`;

// =============================================================================
// SECTION 5: HELPER FUNCTIONS
// =============================================================================

function buildUserPrompt(
  skillSnapshot: SkillSnapshot,
  studentContext: StudentContext,
  goalLevels: Record<string, number>,
  timeAllocation: Record<string, number>
): string {
  // Separate skills with and without evidence
  const skillsWithEvidence: string[] = [];
  const skillsWithoutEvidence: string[] = [];
  
  Object.entries(skillSnapshot).forEach(([skill, data]) => {
    const currentLevel = Math.round(data.confidence * 100);
    const goalLevel = goalLevels[skill];
    const gap = goalLevel - currentLevel;
    const allocatedTime = timeAllocation[skill];
    
    const skillInfo = `${skill.toUpperCase()}:
  - Current Level: ${currentLevel}%
  - Goal Level: ${goalLevel}%
  - Gap: ${gap > 0 ? '+' : ''}${gap}%
  - Evidence Found: ${data.evidence_found}
  - Evidence: ${data.evidence_phrases.length > 0 ? data.evidence_phrases.join(', ') : 'None'}
  - Sources: ${data.evidence_sources.length > 0 ? data.evidence_sources.join(', ') : 'None'}
  - Current Reasoning: ${data.reasoning}
  - Allocated Weekly Time: ${allocatedTime} hours`;
    
    if (data.evidence_found) {
      skillsWithEvidence.push(skillInfo);
    } else {
      skillsWithoutEvidence.push(skillInfo);
    }
  });
  
  const skillSummary = skillsWithEvidence.length > 0 
    ? `SKILLS WITH EVIDENCE (analyze these for gaps):\n${skillsWithEvidence.join('\n\n')}`
    : 'No skills with evidence found.';
  
  const noEvidenceNote = skillsWithoutEvidence.length > 0
    ? `\n\nSKILLS WITHOUT EVIDENCE (DO NOT include in skill_gaps):\n${skillsWithoutEvidence.join('\n\n')}`
    : '';

  return `STUDENT CONTEXT:
- Grade: ${studentContext.grade}
- Goals: ${studentContext.goals_selected.join(', ')}${studentContext.goals_free_text ? ` | ${studentContext.goals_free_text}` : ''}
- Interests: ${studentContext.interests_free_text || 'Not specified'}
- Interest Categories: ${studentContext.interests_categories?.join(', ') || 'Not specified'}
- Available Time: ${studentContext.time_availability_hours_per_week} hours/week
- Learning Preferences: ${studentContext.learning_preferences?.join(', ') || 'Not specified'}

SKILL SNAPSHOT ANALYSIS:
${skillSummary}${noEvidenceNote}

IMPORTANT: Only include skills WITH evidence in the skill_gaps array. Skills without evidence should be excluded.

Generate a comprehensive skill gap analysis with actionable recommendations. Return ONLY the JSON object.`;
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

async function callHuggingFace(userPrompt: string): Promise<string> {
  const completion = await huggingface.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4000,
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
    throw new Error(`Invalid JSON response: ${cleanedResponse.substring(0, 200)}...`);
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
        { success: false, error: "Invalid JSON", details: "Request body must be valid JSON" },
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

    const { skill_snapshot, student_context } = inputValidation.data;

    // Check API key
    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Server configuration error", details: "AI service not configured" },
        { status: 500 }
      );
    }

    // Calculate goal levels based on student goals
    const goalLevels = calculateGoalLevels(
      student_context.goals_selected,
      student_context.goals_free_text
    );

    // Calculate current levels and gaps
    const currentLevels: Record<string, number> = {};
    const gaps: Record<string, number> = {};
    
    for (const [skill, data] of Object.entries(skill_snapshot)) {
      currentLevels[skill] = Math.round(data.confidence * 100);
      gaps[skill] = goalLevels[skill] - currentLevels[skill];
    }

    // Calculate time allocation
    const timeAllocation = calculateTimeAllocation(
      gaps,
      student_context.time_availability_hours_per_week
    );

    // Build prompt and call AI
    const userPrompt = buildUserPrompt(
      skill_snapshot,
      student_context,
      goalLevels,
      timeAllocation
    );

    let rawResponse: string;
    try {
      rawResponse = await callHuggingFace(userPrompt);
    } catch (error) {
      console.error("AI call failed:", error);
      return NextResponse.json(
        { success: false, error: "AI service error", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 502 }
      );
    }

    // Validate response
    let validatedResponse: AIResponse;
    try {
      validatedResponse = parseAndValidateResponse(rawResponse);
    } catch (error) {
      console.error("Validation failed:", { error, rawResponse: rawResponse.substring(0, 500) });
      return NextResponse.json(
        { success: false, error: "AI response validation failed", details: error instanceof Error ? error.message : "Invalid response format" },
        { status: 422 }
      );
    }

    // Build list of skills without evidence
    const skillDisplayNames: Record<string, string> = {
      problem_solving: "Problem Solving",
      communication: "Communication",
      technical_skills: "Technical Skills",
      creativity: "Creativity",
      leadership: "Leadership",
      self_management: "Self-Management",
    };
    
    const skillsWithoutEvidence: z.infer<typeof SkillWithoutEvidenceSchema>[] = [];
    const skillsWithEvidence = new Set<string>();
    
    for (const [skillKey, data] of Object.entries(skill_snapshot)) {
      if (data.evidence_found) {
        skillsWithEvidence.add(skillKey.toLowerCase().replace(/[\s_-]/g, ''));
      } else {
        // Determine goal relevance based on goal weights
        const goalLevel = goalLevels[skillKey] || 70;
        let relevance: "high" | "medium" | "low" = "low";
        if (goalLevel >= 85) relevance = "high";
        else if (goalLevel >= 70) relevance = "medium";
        
        skillsWithoutEvidence.push({
          skill: skillKey,
          display_name: skillDisplayNames[skillKey] || skillKey,
          goal_relevance: relevance,
          suggestion: relevance === "high"
            ? `This skill is highly relevant to your goals. Consider adding experiences or activities that demonstrate ${skillDisplayNames[skillKey] || skillKey} in the intake form.`
            : relevance === "medium"
            ? `This skill could support your goals. Try to develop and document experiences in ${skillDisplayNames[skillKey] || skillKey}.`
            : `Consider exploring opportunities to build ${skillDisplayNames[skillKey] || skillKey} skills.`,
        });
      }
    }

    // Post-process: Filter out skills with no gap, negative gap, OR no evidence
    validatedResponse.skill_gaps = validatedResponse.skill_gaps.filter((skill) => {
      const skillKey = skill.skill.toLowerCase().replace(/[\s_-]/g, '');
      return skill.gap > 0 && skillsWithEvidence.has(skillKey);
    });

    // Update priority_skills to only include skills that are in the filtered gaps
    const gapSkillNames = validatedResponse.skill_gaps.map(g => g.skill.toLowerCase().replace(/[\s_-]/g, ''));
    validatedResponse.priority_skills = validatedResponse.priority_skills.filter(
      (skill) => gapSkillNames.includes(skill.toLowerCase().replace(/[\s_-]/g, ''))
    );

    // Build extended response with skills without evidence
    const extendedResponse: ExtendedResponse = {
      ...validatedResponse,
      skills_without_evidence: skillsWithoutEvidence,
    };

    // Return response
    return NextResponse.json({
      success: true,
      data: extendedResponse,
      meta: {
        student_grade: student_context.grade,
        goals_analyzed: student_context.goals_selected.length,
        time_available: student_context.time_availability_hours_per_week,
        skills_with_evidence: skillsWithEvidence.size,
        skills_without_evidence: skillsWithoutEvidence.length,
        analyzed_at: new Date().toISOString(),
        model: AI_MODEL,
        api_version: "1.1",
      },
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
