// =============================================================================
// ANALYZE PAGE DATA - Form options and constants
// =============================================================================

import type {
  SelectOption,
  LearningMode,
  GoalOption,
  InterestCategory,
  SkillLabel,
} from "./types";

export const gradeOptions: SelectOption[] = [
  { value: "", label: "Select your grade" },
  { value: "9", label: "Grade 9 (Freshman)" },
  { value: "10", label: "Grade 10 (Sophomore)" },
  { value: "11", label: "Grade 11 (Junior)" },
  { value: "12", label: "Grade 12 (Senior)" },
];

export const timeAvailabilityOptions: SelectOption[] = [
  { value: "", label: "Select hours per week" },
  { value: "1-3", label: "1-3 hours" },
  { value: "4-6", label: "4-6 hours" },
  { value: "7-10", label: "7-10 hours" },
  { value: "11-15", label: "11-15 hours" },
  { value: "15+", label: "15+ hours" },
];

export const learningModes: LearningMode[] = [
  { id: "video", label: "Video Tutorials", icon: "🎬", description: "YouTube, online courses" },
  { id: "reading", label: "Reading", icon: "📚", description: "Articles, books, documentation" },
  { id: "handson", label: "Hands-on Projects", icon: "🛠️", description: "Learning by building" },
  { id: "group", label: "Group Work", icon: "👥", description: "Study groups, team projects" },
  { id: "mentor", label: "Mentorship", icon: "🎓", description: "1-on-1 guidance" },
  { id: "interactive", label: "Interactive", icon: "🎮", description: "Quizzes, games, challenges" },
];

export const goalOptions: GoalOption[] = [
  { id: "college", label: "College Prep", icon: "🎓" },
  { id: "coding", label: "Coding & Tech", icon: "💻" },
  { id: "publicSpeaking", label: "Public Speaking", icon: "🎤" },
  { id: "leadership", label: "Leadership", icon: "👑" },
  { id: "creativity", label: "Creativity & Arts", icon: "🎨" },
  { id: "entrepreneurship", label: "Entrepreneurship", icon: "🚀" },
  { id: "stem", label: "STEM Skills", icon: "🔬" },
  { id: "writing", label: "Writing", icon: "✍️" },
  { id: "networking", label: "Networking", icon: "🤝" },
  { id: "career", label: "Career Exploration", icon: "💼" },
];

export const interestCategories: InterestCategory[] = [
  { id: "academic", label: "Academic", icon: "📖", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "creative", label: "Creative", icon: "🎨", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "social", label: "Social", icon: "💬", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: "technical", label: "Technical", icon: "⚙️", color: "bg-green-100 text-green-700 border-green-200" },
  { id: "sports", label: "Sports", icon: "⚽", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "music", label: "Music", icon: "🎵", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "business", label: "Business", icon: "📊", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: "health", label: "Health & Wellness", icon: "💪", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { id: "other", label: "Other", icon: "✨", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export const skillLabels: SkillLabel[] = [
  {
    key: "problemSolving",
    label: "Problem Solving",
    description: "Ability to analyze issues and find solutions",
  },
  {
    key: "communication",
    label: "Communication",
    description: "Written and verbal expression skills",
  },
  {
    key: "technicalSkills",
    label: "Technical Skills",
    description: "Computer, coding, or technical abilities",
  },
  {
    key: "creativity",
    label: "Creativity",
    description: "Innovative thinking and artistic expression",
  },
  {
    key: "leadership",
    label: "Leadership",
    description: "Ability to guide and motivate others",
  },
  {
    key: "selfManagement",
    label: "Self-Management",
    description: "Time management and self-discipline",
  },
];

export const stepLabels = ["Basic Info", "Goals & Learning", "Experience", "Self-Assessment"];

// Helper to convert time availability string to hours
export const parseTimeAvailability = (value: string): number => {
  const mapping: Record<string, number> = {
    "1-3": 2,
    "4-6": 5,
    "7-10": 8,
    "11-15": 13,
    "15+": 20,
  };
  return mapping[value] || 5;
};
