// =============================================================================
// PERTURBATION GENERATORS
// =============================================================================
// Purpose: Generate controlled variants of student profiles for robustness testing
// =============================================================================

import type { StudentProfile } from "../testing-playground/types";
import type { ProfileVariant, EvidenceItem, PerturbationType } from "./types";

/**
 * Evidence injection templates for different skills
 * These are realistic evidence items that can be added to profiles
 */
const INJECTION_TEMPLATES: Record<string, EvidenceItem[]> = {
  problem_solving: [
    {
      type: "experience",
      content: "Debugged a complex software issue that stumped my team for weeks",
      relatedSkills: ["problem_solving", "technical_skills"],
    },
    {
      type: "achievement",
      content: "Won 1st place in a regional problem-solving competition",
      relatedSkills: ["problem_solving"],
    },
  ],
  communication: [
    {
      type: "experience",
      content: "Presented our research findings to a panel of university professors",
      relatedSkills: ["communication"],
    },
    {
      type: "achievement",
      content: "Selected as keynote speaker for school assembly of 500+ students",
      relatedSkills: ["communication", "leadership"],
    },
  ],
  technical_skills: [
    {
      type: "experience",
      content: "Built a full-stack web application using React and Node.js",
      relatedSkills: ["technical_skills", "problem_solving"],
    },
    {
      type: "achievement",
      content: "Completed Google's Professional IT Support certification",
      relatedSkills: ["technical_skills"],
    },
  ],
  creativity: [
    {
      type: "experience",
      content: "Designed and illustrated a 40-page graphic novel from scratch",
      relatedSkills: ["creativity"],
    },
    {
      type: "achievement",
      content: "Art piece selected for display in the city art museum",
      relatedSkills: ["creativity"],
    },
  ],
  leadership: [
    {
      type: "experience",
      content: "Led a team of 15 volunteers for a community service project",
      relatedSkills: ["leadership", "communication"],
    },
    {
      type: "achievement",
      content: "Elected student body president with 65% of votes",
      relatedSkills: ["leadership"],
    },
  ],
  self_management: [
    {
      type: "experience",
      content: "Maintained a 4.0 GPA while working 20 hours per week",
      relatedSkills: ["self_management"],
    },
    {
      type: "achievement",
      content: "Completed a year-long independent research project ahead of schedule",
      relatedSkills: ["self_management", "problem_solving"],
    },
  ],
};

/**
 * Rephrasing patterns that preserve meaning
 */
const REPHRASING_PATTERNS: Array<{ pattern: RegExp; replacements: string[] }> = [
  { pattern: /I built/gi, replacements: ["I created", "I developed", "I constructed"] },
  { pattern: /I led/gi, replacements: ["I headed", "I directed", "I spearheaded"] },
  { pattern: /I organized/gi, replacements: ["I coordinated", "I arranged", "I set up"] },
  { pattern: /I won/gi, replacements: ["I achieved", "I earned", "I received"] },
  { pattern: /helped/gi, replacements: ["assisted", "supported", "aided"] },
  { pattern: /created/gi, replacements: ["developed", "produced", "designed"] },
  { pattern: /participated in/gi, replacements: ["took part in", "was involved in", "engaged in"] },
  { pattern: /worked on/gi, replacements: ["contributed to", "was part of", "engaged with"] },
  { pattern: /managed/gi, replacements: ["oversaw", "handled", "coordinated"] },
  { pattern: /taught/gi, replacements: ["instructed", "educated", "trained"] },
  { pattern: /competition/gi, replacements: ["contest", "tournament", "challenge"] },
  { pattern: /project/gi, replacements: ["initiative", "undertaking", "endeavor"] },
  { pattern: /team/gi, replacements: ["group", "squad", "unit"] },
  { pattern: /school/gi, replacements: ["academic institution", "educational institution", "school"] },
];

/**
 * Generate a unique ID for variants
 */
function generateVariantId(profileId: string, variantType: PerturbationType): string {
  return `${profileId}-${variantType}-${Date.now()}`;
}

/**
 * Apply rephrasing to text while preserving meaning
 */
function rephraseText(text: string): string {
  let result = text;
  const appliedReplacements: string[] = [];
  
  for (const { pattern, replacements } of REPHRASING_PATTERNS) {
    if (pattern.test(result)) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(pattern, replacement);
      appliedReplacements.push(`${pattern.source} -> ${replacement}`);
    }
  }
  
  return result;
}

/**
 * Identify key evidence items in a profile
 */
function identifyKeyEvidence(profile: StudentProfile): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];
  
  // Parse past_activities for key evidence
  const activities = profile.past_activities;
  if (activities) {
    // Look for leadership indicators
    if (/led|captain|president|organized|founded/i.test(activities)) {
      const match = activities.match(/([^.!?]*(?:led|captain|president|organized|founded)[^.!?]*[.!?])/i);
      if (match) {
        evidence.push({
          type: "experience",
          content: match[1].trim(),
          relatedSkills: ["leadership"],
        });
      }
    }
    
    // Look for technical indicators
    if (/built|coded|programmed|developed|app|software|robot/i.test(activities)) {
      const match = activities.match(/([^.!?]*(?:built|coded|programmed|developed|app|software|robot)[^.!?]*[.!?])/i);
      if (match) {
        evidence.push({
          type: "experience",
          content: match[1].trim(),
          relatedSkills: ["technical_skills", "problem_solving"],
        });
      }
    }
    
    // Look for communication indicators
    if (/presented|spoke|explained|taught|mentored/i.test(activities)) {
      const match = activities.match(/([^.!?]*(?:presented|spoke|explained|taught|mentored)[^.!?]*[.!?])/i);
      if (match) {
        evidence.push({
          type: "experience",
          content: match[1].trim(),
          relatedSkills: ["communication"],
        });
      }
    }
  }
  
  // Parse past_achievements
  const achievements = profile.past_achievements;
  if (achievements) {
    if (/won|award|place|recognition|certified/i.test(achievements)) {
      const match = achievements.match(/([^.!?]*(?:won|award|place|recognition|certified)[^.!?]*[.!?])/i);
      if (match) {
        const content = match[1].trim();
        const skills: string[] = [];
        
        if (/hackathon|coding|tech|robot/i.test(content)) {
          skills.push("technical_skills", "problem_solving");
        }
        if (/debate|speaker|speaking/i.test(content)) {
          skills.push("communication");
        }
        if (/leadership|president|captain/i.test(content)) {
          skills.push("leadership");
        }
        if (/art|creative|design/i.test(content)) {
          skills.push("creativity");
        }
        
        if (skills.length === 0) skills.push("problem_solving"); // Default
        
        evidence.push({
          type: "achievement",
          content,
          relatedSkills: skills,
        });
      }
    }
  }
  
  return evidence;
}

/**
 * Select appropriate evidence to inject based on profile's goals
 */
function selectInjectionEvidence(profile: StudentProfile): EvidenceItem[] {
  const selectedEvidence: EvidenceItem[] = [];
  const goals = profile.goals_selected || [];
  
  // Map goals to skills
  const goalSkillMap: Record<string, string[]> = {
    coding: ["technical_skills", "problem_solving"],
    stem: ["technical_skills", "problem_solving"],
    leadership: ["leadership", "communication"],
    publicSpeaking: ["communication"],
    creativity: ["creativity"],
    entrepreneurship: ["leadership", "problem_solving"],
    college: ["self_management", "problem_solving"],
    writing: ["communication", "creativity"],
    career: ["self_management", "leadership"],
    networking: ["communication", "leadership"],
  };
  
  // Collect relevant skills from goals
  const relevantSkills = new Set<string>();
  for (const goal of goals) {
    const skills = goalSkillMap[goal];
    if (skills) {
      skills.forEach(s => relevantSkills.add(s));
    }
  }
  
  // If no goals, pick random skills
  if (relevantSkills.size === 0) {
    relevantSkills.add("problem_solving");
    relevantSkills.add("communication");
  }
  
  // Select 1-2 evidence items aligned with goals
  const skillsArray = Array.from(relevantSkills);
  const numToAdd = Math.min(2, Math.ceil(Math.random() * 2));
  
  for (let i = 0; i < numToAdd && i < skillsArray.length; i++) {
    const skill = skillsArray[i];
    const templates = INJECTION_TEMPLATES[skill];
    if (templates && templates.length > 0) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      selectedEvidence.push(template);
    }
  }
  
  return selectedEvidence;
}

/**
 * Generate an INJECTION variant (+)
 * Adds 1-2 relevant evidence items
 */
export function generateInjectionVariant(
  profileId: string,
  profileName: string,
  profile: StudentProfile
): ProfileVariant {
  const evidenceToAdd = selectInjectionEvidence(profile);
  
  // Create modified profile
  const modifiedProfile: StudentProfile = { ...profile };
  
  for (const evidence of evidenceToAdd) {
    if (evidence.type === "experience") {
      modifiedProfile.past_activities = 
        `${modifiedProfile.past_activities} ${evidence.content}`;
    } else if (evidence.type === "achievement") {
      modifiedProfile.past_achievements = 
        `${modifiedProfile.past_achievements || ""} ${evidence.content}`;
    } else if (evidence.type === "goal") {
      modifiedProfile.goals_free_text = 
        `${modifiedProfile.goals_free_text || ""} ${evidence.content}`;
    }
  }
  
  return {
    id: generateVariantId(profileId, "injection"),
    profileId,
    profileName,
    variantType: "injection",
    profile: modifiedProfile,
    perturbationDescription: `Added ${evidenceToAdd.length} evidence item(s): ${evidenceToAdd.map(e => e.content.substring(0, 50) + "...").join("; ")}`,
    addedEvidence: evidenceToAdd,
  };
}

/**
 * Generate a REMOVAL variant (-)
 * Removes 1 key evidence item
 */
export function generateRemovalVariant(
  profileId: string,
  profileName: string,
  profile: StudentProfile
): ProfileVariant {
  const keyEvidence = identifyKeyEvidence(profile);
  const modifiedProfile: StudentProfile = { ...profile };
  let removedEvidence: EvidenceItem | null = null;
  
  if (keyEvidence.length > 0) {
    // Remove the first identified key evidence
    removedEvidence = keyEvidence[0];
    
    if (removedEvidence.type === "experience" || removedEvidence.type === "goal") {
      // Remove the sentence from past_activities
      modifiedProfile.past_activities = profile.past_activities
        .replace(removedEvidence.content, "")
        .replace(/\s+/g, " ")
        .trim();
    } else if (removedEvidence.type === "achievement") {
      // Remove from past_achievements
      modifiedProfile.past_achievements = (profile.past_achievements || "")
        .replace(removedEvidence.content, "")
        .replace(/\s+/g, " ")
        .trim();
    }
  } else {
    // If no key evidence identified, remove last sentence from past_activities
    const sentences = profile.past_activities.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 1) {
      const removedSentence = sentences.pop() || "";
      modifiedProfile.past_activities = sentences.join(". ").trim() + ".";
      removedEvidence = {
        type: "experience",
        content: removedSentence.trim(),
        relatedSkills: ["problem_solving"], // Default assumption
      };
    }
  }
  
  return {
    id: generateVariantId(profileId, "removal"),
    profileId,
    profileName,
    variantType: "removal",
    profile: modifiedProfile,
    perturbationDescription: removedEvidence 
      ? `Removed evidence: "${removedEvidence.content.substring(0, 60)}..."`
      : "No key evidence identified for removal",
    removedEvidence: removedEvidence ? [removedEvidence] : [],
  };
}

/**
 * Generate a REPHRASED variant (~)
 * Rephrases descriptions without changing meaning
 */
export function generateRephrasedVariant(
  profileId: string,
  profileName: string,
  profile: StudentProfile
): ProfileVariant {
  const modifiedProfile: StudentProfile = { ...profile };
  const rephrasedFields: string[] = [];
  
  // Rephrase past_activities
  const originalActivities = profile.past_activities;
  modifiedProfile.past_activities = rephraseText(originalActivities);
  if (modifiedProfile.past_activities !== originalActivities) {
    rephrasedFields.push("past_activities");
  }
  
  // Rephrase past_achievements
  if (profile.past_achievements) {
    const originalAchievements = profile.past_achievements;
    modifiedProfile.past_achievements = rephraseText(originalAchievements);
    if (modifiedProfile.past_achievements !== originalAchievements) {
      rephrasedFields.push("past_achievements");
    }
  }
  
  // Rephrase interests_free_text
  if (profile.interests_free_text) {
    const originalInterests = profile.interests_free_text;
    modifiedProfile.interests_free_text = rephraseText(originalInterests);
    if (modifiedProfile.interests_free_text !== originalInterests) {
      rephrasedFields.push("interests_free_text");
    }
  }
  
  // Rephrase goals_free_text
  if (profile.goals_free_text) {
    const originalGoals = profile.goals_free_text;
    modifiedProfile.goals_free_text = rephraseText(originalGoals);
    if (modifiedProfile.goals_free_text !== originalGoals) {
      rephrasedFields.push("goals_free_text");
    }
  }
  
  return {
    id: generateVariantId(profileId, "rephrased"),
    profileId,
    profileName,
    variantType: "rephrased",
    profile: modifiedProfile,
    perturbationDescription: `Rephrased ${rephrasedFields.length} field(s): ${rephrasedFields.join(", ")}`,
    rephrasedFields,
  };
}

/**
 * Generate all variants for a profile
 */
export function generateAllVariants(
  profileId: string,
  profileName: string,
  profile: StudentProfile,
  config: {
    runInjection?: boolean;
    runRemoval?: boolean;
    runRephrasing?: boolean;
  } = {}
): ProfileVariant[] {
  const {
    runInjection = true,
    runRemoval = true,
    runRephrasing = true,
  } = config;
  
  const variants: ProfileVariant[] = [];
  
  // Always include original
  variants.push({
    id: generateVariantId(profileId, "original"),
    profileId,
    profileName,
    variantType: "original",
    profile,
    perturbationDescription: "Original profile (baseline)",
  });
  
  if (runInjection) {
    variants.push(generateInjectionVariant(profileId, profileName, profile));
  }
  
  if (runRemoval) {
    variants.push(generateRemovalVariant(profileId, profileName, profile));
  }
  
  if (runRephrasing) {
    variants.push(generateRephrasedVariant(profileId, profileName, profile));
  }
  
  return variants;
}

/**
 * Export sample perturbation data for testing
 */
export const SAMPLE_INJECTION_EVIDENCE = INJECTION_TEMPLATES;
