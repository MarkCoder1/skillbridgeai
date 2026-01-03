// =============================================================================
// TESTING PLAYGROUND CONSTANTS & DATA
// =============================================================================

import type { StudentProfile } from "./types";

// Valid skills that our system supports
export const VALID_SKILLS = [
  "problem_solving",
  "communication",
  "technical_skills",
  "creativity",
  "leadership",
  "self_management",
];

// Valid evidence sources
export const VALID_SOURCES = ["interests", "goals", "past_activities", "achievements", "challenges"];

// Goal options (matching the assessment form)
export const GOAL_OPTIONS = [
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

// Learning modes (matching the assessment form)
export const LEARNING_MODES = [
  { id: "video", label: "Video Tutorials", icon: "🎬", description: "YouTube, online courses" },
  { id: "reading", label: "Reading", icon: "📚", description: "Articles, books, documentation" },
  { id: "handson", label: "Hands-on Projects", icon: "🛠️", description: "Learning by building" },
  { id: "group", label: "Group Work", icon: "👥", description: "Study groups, team projects" },
  { id: "mentor", label: "Mentorship", icon: "🎓", description: "1-on-1 guidance" },
  { id: "interactive", label: "Interactive", icon: "🎮", description: "Quizzes, games, challenges" },
];

// Skill labels for self-assessment
export const SKILL_LABELS = [
  { key: "problemSolving", label: "Problem Solving", description: "Ability to analyze issues and find solutions" },
  { key: "communication", label: "Communication", description: "Written and verbal expression skills" },
  { key: "technicalSkills", label: "Technical Skills", description: "Computer, coding, or technical abilities" },
  { key: "creativity", label: "Creativity", description: "Innovative thinking and artistic expression" },
  { key: "leadership", label: "Leadership", description: "Ability to guide and motivate others" },
  { key: "selfManagement", label: "Self-Management", description: "Time management and self-discipline" },
];

// Default empty profile
export const DEFAULT_PROFILE: StudentProfile = {
  grade: 10,
  interests_free_text: "",
  interests_by_category: {
    academic: false,
    creative: false,
    social: false,
    technical: false,
    sports: false,
    music: false,
    business: false,
    health_wellness: false,
    other: false,
  },
  goals_selected: [],
  goals_free_text: "",
  time_availability_hours_per_week: 5,
  learning_preferences: [],
  past_activities: "",
  past_achievements: "",
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
