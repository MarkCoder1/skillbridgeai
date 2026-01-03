// =============================================================================
// HOW IT WORKS PAGE DATA - Static content for the how-it-works page
// =============================================================================

import React from "react";

export interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

// Steps data with icons
export const steps: Step[] = [
  {
    number: "01",
    title: "Enter Your Information",
    description:
      "Share your grade level, interests, past activities, and self-rate your skills. The more information you provide, the better our AI can understand your unique profile.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
    details: [
      "Grade level (9th-12th)",
      "Personal interests and passions",
      "School clubs and extracurriculars",
      "Optional skill self-assessment",
    ],
  },
  {
    number: "02",
    title: "AI Analyzes Your Skills",
    description:
      "Our advanced AI engine processes your information to identify your strengths, natural abilities, and unique skill combinations that set you apart.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    details: [
      "Pattern recognition across experiences",
      "Skill level assessment",
      "Strength identification",
      "Comparison with success profiles",
    ],
  },
  {
    number: "03",
    title: "Skill Gaps Identified",
    description:
      "We identify areas where you have room for growth—skills that, once developed, will significantly boost your career readiness and opportunities.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    details: [
      "Gap analysis vs. career goals",
      "Priority ranking of improvements",
      "Actionable growth areas",
      "Realistic development timeline",
    ],
  },
  {
    number: "04",
    title: "Personalized Opportunities",
    description:
      "Receive tailored recommendations for courses, projects, competitions, and internships that match your skills, interests, and growth areas.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
    details: [
      "Curated online courses",
      "Hands-on project ideas",
      "Relevant competitions",
      "Internship opportunities",
    ],
  },
];

export const benefits: Benefit[] = [
  {
    icon: "🎯",
    title: "Personalized for You",
    description: "Every recommendation is tailored to your unique profile and goals.",
  },
  {
    icon: "⚡",
    title: "Quick & Easy",
    description: "Get comprehensive results in just 5 minutes of your time.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description: "Your data is never shared and used only for your recommendations.",
  },
  {
    icon: "🚀",
    title: "Actionable Results",
    description: "Receive a concrete 30-day plan to start improving immediately.",
  },
];

export const faqs: FAQ[] = [
  {
    question: "How accurate is the skill analysis?",
    answer:
      "Our AI uses advanced pattern recognition and has been trained on successful student profiles. The more detailed information you provide, the more accurate your results will be.",
  },
  {
    question: "Is SkillBridge AI free to use?",
    answer:
      "Yes! The skill analysis and personalized recommendations are completely free for all students.",
  },
  {
    question: "How long does the analysis take?",
    answer:
      "The input form takes about 5 minutes to complete, and you'll receive your results instantly after submission.",
  },
  {
    question: "Can I retake the analysis?",
    answer:
      "Absolutely! We encourage you to retake the analysis every few months as your skills and experiences grow.",
  },
  {
    question: "What data do you collect?",
    answer:
      "We collect only the information you provide in the form (grade, interests, activities, skill ratings). We never share this data with third parties.",
  },
];
