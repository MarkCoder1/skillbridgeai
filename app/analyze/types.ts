// =============================================================================
// ANALYZE PAGE TYPES - Form data and type definitions
// =============================================================================

export interface FormData {
  // Step 1: Basic Info
  grade: string;
  interests: string;
  interestCategories: string[];
  // Step 2: Goals & Learning
  goals: string[];
  customGoal: string;
  timeAvailability: string;
  preferredLearningModes: string[];
  // Step 3: Experience
  activities: string;
  pastAchievements: string;
  // Step 4: Self-Assessment
  challenges: string;
  skills: SkillRatings;
}

export interface SkillRatings {
  problemSolving: number;
  communication: number;
  technicalSkills: number;
  creativity: number;
  leadership: number;
  selfManagement: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface LearningMode {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface GoalOption {
  id: string;
  label: string;
  icon: string;
}

export interface InterestCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface SkillLabel {
  key: keyof SkillRatings;
  label: string;
  description: string;
}

export const initialFormData: FormData = {
  grade: "",
  interests: "",
  interestCategories: [],
  goals: [],
  customGoal: "",
  timeAvailability: "",
  preferredLearningModes: [],
  activities: "",
  pastAchievements: "",
  challenges: "",
  skills: {
    problemSolving: 0,
    communication: 0,
    technicalSkills: 0,
    creativity: 0,
    leadership: 0,
    selfManagement: 0,
  },
};
