"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ProgressBar,
  Badge,
  InfoTooltip,
  Accordion,
  AccordionItem,
} from "@/components/ui";

// Enhanced mock data for results with AI insights
const mockSkillScores = {
  problemSolving: { score: 78, trend: "+5", aiInsight: "Your problem-solving skills show strong analytical thinking. Based on your coding projects and math club participation, you excel at breaking down complex problems." },
  communication: { score: 65, trend: "+2", aiInsight: "Your written communication is developing well through blog posts. Verbal presentation skills could benefit from more practice opportunities." },
  technicalSkills: { score: 82, trend: "+8", aiInsight: "Exceptional growth in technical skills! Your GitHub contributions and completed online courses demonstrate strong coding proficiency." },
  creativity: { score: 71, trend: "+3", aiInsight: "Good creative foundation shown through your design projects. Consider exploring more innovative problem-solving approaches." },
  leadership: { score: 45, trend: "0", aiInsight: "Leadership experience is limited but shows potential. Taking on team lead roles in projects would accelerate growth significantly." },
  selfManagement: { score: 58, trend: "+1", aiInsight: "Time management is developing. Implementing structured schedules and goal-tracking systems would boost this skill." },
};

const skillLabels: Record<string, string> = {
  problemSolving: "Problem Solving",
  communication: "Communication",
  technicalSkills: "Technical Skills",
  creativity: "Creativity",
  leadership: "Leadership",
  selfManagement: "Self-Management",
};

// Enhanced skill gaps with actionable improvement steps
const mockSkillGaps = [
  {
    skill: "Leadership",
    skillKey: "leadership",
    current: 45,
    target: 70,
    importance: "Leadership skills are crucial for college applications, scholarships, and future career advancement. 78% of employers rate leadership as a top hiring criterion.",
    description: "Building leadership skills will open doors to team captain roles, club president positions, and future management opportunities.",
    aiPrediction: "AI predicts you can reach 70% leadership proficiency within 3 months with consistent effort.",
    improvementSteps: [
      { step: "Start a study group or club project as the organizer", impact: "+8% leadership", timeframe: "2 weeks" },
      { step: "Volunteer to lead a team in your next group assignment", impact: "+5% leadership", timeframe: "1 week" },
      { step: "Take the Youth Leadership online course", impact: "+12% leadership", timeframe: "4 weeks" },
      { step: "Mentor a younger student in a subject you excel at", impact: "+7% leadership", timeframe: "Ongoing" },
    ],
  },
  {
    skill: "Self-Management",
    skillKey: "selfManagement",
    current: 58,
    target: 75,
    importance: "Self-management directly correlates with academic success and stress reduction. Students with high self-management scores are 2.3x more likely to maintain high GPAs.",
    description: "Improving time management and self-discipline will help you balance academics, extracurriculars, and personal growth effectively.",
    aiPrediction: "AI predicts you can reach 75% self-management proficiency within 6 weeks with daily practice.",
    improvementSteps: [
      { step: "Use a digital planner to schedule all activities daily", impact: "+6% self-management", timeframe: "1 week" },
      { step: "Implement the Pomodoro technique for study sessions", impact: "+4% self-management", timeframe: "3 days" },
      { step: "Set weekly SMART goals and review progress every Sunday", impact: "+5% self-management", timeframe: "Ongoing" },
      { step: "Complete a time management mini-course", impact: "+8% self-management", timeframe: "2 weeks" },
    ],
  },
];

// Enhanced opportunities with AI reasoning and expected benefits
const mockOpportunities = {
  courses: [
    {
      id: 1,
      title: "Introduction to Web Development",
      provider: "Codecademy",
      match: 95,
      matchLevel: "high" as const,
      reason: "Aligns with your strong technical skills and interest in coding. Perfect for building your portfolio.",
      aiReasoning: "AI selected this because: Your technical skills score (82%) and interest in coding indicate high success probability. Students with similar profiles complete this course 94% of the time and report 23% skill improvement.",
      expectedBenefits: [
        { skill: "Technical Skills", improvement: "+12%" },
        { skill: "Problem Solving", improvement: "+5%" },
        { skill: "Creativity", improvement: "+3%" },
      ],
      duration: "8 weeks",
      level: "Beginner",
      link: "https://codecademy.com",
    },
    {
      id: 2,
      title: "Public Speaking Fundamentals",
      provider: "Coursera",
      match: 88,
      matchLevel: "high" as const,
      reason: "Will strengthen your communication skills, complementing your technical abilities.",
      aiReasoning: "AI selected this because: Your communication score (65%) has room for growth. This course addresses verbal presentation—your identified weak area. Completing this typically raises communication scores by 15-20%.",
      expectedBenefits: [
        { skill: "Communication", improvement: "+18%" },
        { skill: "Leadership", improvement: "+7%" },
        { skill: "Self-Management", improvement: "+3%" },
      ],
      duration: "4 weeks",
      level: "Beginner",
      link: "https://coursera.org",
    },
  ],
  projects: [
    {
      id: 1,
      title: "Build a Personal Portfolio Website",
      type: "Solo Project",
      match: 92,
      matchLevel: "high" as const,
      reason: "Combines your creativity and technical skills while creating something valuable for college applications.",
      aiReasoning: "AI selected this because: Portfolio projects have the highest ROI for students with your profile. This leverages your top skills (Technical: 82%, Creativity: 71%) while providing tangible evidence for college applications.",
      expectedBenefits: [
        { skill: "Technical Skills", improvement: "+8%" },
        { skill: "Creativity", improvement: "+10%" },
        { skill: "Self-Management", improvement: "+5%" },
      ],
      duration: "2-3 weeks",
      skills: ["HTML/CSS", "JavaScript", "Design"],
      difficulty: "Intermediate",
    },
    {
      id: 2,
      title: "Community Service App",
      type: "Team Project",
      match: 85,
      matchLevel: "high" as const,
      reason: "Great opportunity to practice leadership while solving real problems in your community.",
      aiReasoning: "AI selected this because: Team projects directly address your leadership gap (45%). Leading or co-leading this project could improve leadership skills by 15-20% while applying your strong technical abilities.",
      expectedBenefits: [
        { skill: "Leadership", improvement: "+15%" },
        { skill: "Technical Skills", improvement: "+6%" },
        { skill: "Communication", improvement: "+8%" },
      ],
      duration: "4-6 weeks",
      skills: ["App Development", "Teamwork", "Problem Solving"],
      difficulty: "Advanced",
    },
  ],
  competitions: [
    {
      id: 1,
      title: "Congressional App Challenge",
      organizer: "U.S. House of Representatives",
      match: 90,
      matchLevel: "high" as const,
      reason: "National recognition opportunity that matches your technical skills and creativity.",
      aiReasoning: "AI selected this because: Your technical skills (82%) exceed the typical winner profile (75%). Combined with your creativity score, you have a 34% higher chance of placing than average participants.",
      expectedBenefits: [
        { skill: "Technical Skills", improvement: "+10%" },
        { skill: "Problem Solving", improvement: "+8%" },
        { skill: "Communication", improvement: "+5%" },
      ],
      deadline: "November 2024",
      prize: "Recognition + Prizes",
      registrationLink: "https://congressionalappchallenge.us",
    },
    {
      id: 2,
      title: "DECA Business Competition",
      organizer: "DECA Inc.",
      match: 78,
      matchLevel: "medium" as const,
      reason: "Will help develop leadership and communication skills while exploring business concepts.",
      aiReasoning: "AI selected this because: This competition specifically targets your skill gaps (Leadership: 45%, Communication: 65%). Participants typically see 12% improvement in these areas.",
      expectedBenefits: [
        { skill: "Leadership", improvement: "+12%" },
        { skill: "Communication", improvement: "+10%" },
        { skill: "Self-Management", improvement: "+6%" },
      ],
      deadline: "January 2024",
      prize: "Scholarships Available",
      registrationLink: "https://deca.org",
    },
  ],
  internships: [
    {
      id: 1,
      title: "Summer Tech Internship Program",
      company: "Local Tech Startup",
      match: 88,
      matchLevel: "high" as const,
      reason: "Hands-on experience aligned with your technical interests. Great for building real-world skills.",
      aiReasoning: "AI selected this because: Your technical profile matches 88% of successful interns at similar companies. This role will provide professional experience highly valued by colleges and future employers.",
      expectedBenefits: [
        { skill: "Technical Skills", improvement: "+15%" },
        { skill: "Communication", improvement: "+10%" },
        { skill: "Self-Management", improvement: "+12%" },
      ],
      duration: "8 weeks",
      type: "Paid",
      applicationLink: "#",
    },
    {
      id: 2,
      title: "Youth Volunteer Coordinator",
      company: "Community Center",
      match: 82,
      matchLevel: "high" as const,
      reason: "Perfect for developing leadership skills while making a positive community impact.",
      aiReasoning: "AI selected this because: This role directly addresses your biggest skill gap (Leadership: 45%). Students in similar coordinator roles report average leadership improvement of 20%.",
      expectedBenefits: [
        { skill: "Leadership", improvement: "+20%" },
        { skill: "Communication", improvement: "+12%" },
        { skill: "Self-Management", improvement: "+8%" },
      ],
      duration: "Flexible",
      type: "Volunteer",
      applicationLink: "#",
    },
  ],
};

// Enhanced action plan with resources, skill targets, and measurable outcomes
const mockActionPlan = [
  {
    week: "Week 1",
    focus: "Foundation & Setup",
    skillTargets: ["Technical Skills", "Self-Management"],
    tasks: [
      {
        id: 1,
        task: "Sign up for Introduction to Web Development course on Codecademy",
        completed: false,
        skillImpact: "Technical Skills +2%",
        resourceLink: "https://codecademy.com",
        measurable: "Complete account setup and first lesson",
        priority: "high" as const,
      },
      {
        id: 2,
        task: "Research Congressional App Challenge requirements and create project ideas document",
        completed: false,
        skillImpact: "Problem Solving +1%",
        resourceLink: "https://congressionalappchallenge.us",
        measurable: "Document with 3+ app ideas",
        priority: "high" as const,
      },
      {
        id: 3,
        task: "Set up VS Code and coding environment with necessary extensions",
        completed: false,
        skillImpact: "Technical Skills +1%",
        resourceLink: "https://code.visualstudio.com",
        measurable: "Working development environment",
        priority: "medium" as const,
      },
    ],
  },
  {
    week: "Week 2",
    focus: "Skill Building",
    skillTargets: ["Technical Skills", "Communication"],
    tasks: [
      {
        id: 4,
        task: "Complete modules 1-3 of web development course (HTML & CSS basics)",
        completed: false,
        skillImpact: "Technical Skills +4%",
        measurable: "3 modules completed with passing quizzes",
        priority: "high" as const,
      },
      {
        id: 5,
        task: "Finalize app idea and create a 1-page project proposal",
        completed: false,
        skillImpact: "Communication +2%, Problem Solving +2%",
        measurable: "Written proposal document",
        priority: "high" as const,
      },
      {
        id: 6,
        task: "Join Discord coding community and introduce yourself",
        completed: false,
        skillImpact: "Communication +1%",
        resourceLink: "https://discord.com",
        measurable: "Posted introduction in community",
        priority: "low" as const,
      },
    ],
  },
  {
    week: "Week 3",
    focus: "Leadership Development",
    skillTargets: ["Leadership", "Technical Skills"],
    tasks: [
      {
        id: 7,
        task: "Begin building your portfolio website - set up project structure",
        completed: false,
        skillImpact: "Technical Skills +3%",
        measurable: "Basic HTML structure with navigation",
        priority: "high" as const,
      },
      {
        id: 8,
        task: "Apply for Youth Volunteer Coordinator role at Community Center",
        completed: false,
        skillImpact: "Leadership +3%",
        measurable: "Submitted application",
        priority: "high" as const,
      },
      {
        id: 9,
        task: "Practice public speaking: Record yourself presenting your app idea for 5 minutes",
        completed: false,
        skillImpact: "Communication +2%, Leadership +1%",
        measurable: "5-minute recorded presentation",
        priority: "medium" as const,
      },
    ],
  },
  {
    week: "Week 4",
    focus: "Integration & Review",
    skillTargets: ["Self-Management", "All Skills"],
    tasks: [
      {
        id: 10,
        task: "Complete portfolio website first draft with at least 3 sections",
        completed: false,
        skillImpact: "Technical Skills +4%, Creativity +2%",
        measurable: "Live website with Home, About, Projects sections",
        priority: "high" as const,
      },
      {
        id: 11,
        task: "Submit Congressional App Challenge registration",
        completed: false,
        skillImpact: "Self-Management +2%",
        resourceLink: "https://congressionalappchallenge.us",
        measurable: "Confirmation email received",
        priority: "high" as const,
      },
      {
        id: 12,
        task: "Complete weekly reflection: Document progress, challenges, and next month's goals",
        completed: false,
        skillImpact: "Self-Management +3%",
        measurable: "Written reflection document (300+ words)",
        priority: "medium" as const,
      },
    ],
  },
];

type TabType = "courses" | "projects" | "competitions" | "internships";
type MatchLevel = "high" | "medium" | "low";
type Priority = "high" | "medium" | "low";

interface ActionTask {
  id: number;
  task: string;
  completed: boolean;
  skillImpact: string;
  resourceLink?: string;
  measurable: string;
  priority: Priority;
}

interface ActionWeek {
  week: string;
  focus: string;
  skillTargets: string[];
  tasks: ActionTask[];
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("courses");
  const [actionPlan, setActionPlan] = useState<ActionWeek[]>(mockActionPlan);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [expandedOpportunity, setExpandedOpportunity] = useState<number | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleTask = (weekIndex: number, taskId: number) => {
    setActionPlan((prev) =>
      prev.map((week, wIndex) =>
        wIndex === weekIndex
          ? {
              ...week,
              tasks: week.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : week
      )
    );
  };

  const getColorForScore = (score: number): "success" | "warning" | "error" => {
    if (score >= 75) return "success";
    if (score >= 50) return "warning";
    return "error";
  };

  const getMatchLevelColor = (level: MatchLevel) => {
    switch (level) {
      case "high": return "bg-[var(--success)]";
      case "medium": return "bg-[var(--warning)]";
      case "low": return "bg-[var(--error)]";
    }
  };

  const getMatchLevelBadge = (level: MatchLevel) => {
    switch (level) {
      case "high": return "success";
      case "medium": return "warning";
      case "low": return "error";
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "border-l-[var(--error)]";
      case "medium": return "border-l-[var(--warning)]";
      case "low": return "border-l-[var(--muted)]";
    }
  };

  const completedTasks = actionPlan.reduce(
    (acc, week) => acc + week.tasks.filter((t) => t.completed).length,
    0
  );
  const totalTasks = actionPlan.reduce((acc, week) => acc + week.tasks.length, 0);

  // Calculate week progress
  const getWeekProgress = (weekIndex: number) => {
    const week = actionPlan[weekIndex];
    const completed = week.tasks.filter((t) => t.completed).length;
    return (completed / week.tasks.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--primary)]/5 via-white to-[var(--accent)]/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Analyzing Your Skills...
          </h2>
          <p className="text-[var(--muted)]">
            Our AI is finding the best opportunities for you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)]/5 via-white to-[var(--accent)]/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--success)]/10 text-[var(--success)] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Analysis Complete
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
            Your Personalized Results
          </h1>
          <p className="text-[var(--muted)] max-w-2xl mx-auto">
            Based on your profile, our AI has identified your strengths, areas for
            growth, and matched opportunities with detailed reasoning.
          </p>
        </div>

        {/* Skill Snapshot Section - Enhanced with clickable skills and AI insights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Your Skill Snapshot
            <InfoTooltip content="Click on any skill to see AI-generated insights and personalized recommendations" />
          </h2>
          <Card padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(mockSkillScores).map(([key, data]) => (
                <div
                  key={key}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    expandedSkill === key
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-transparent hover:border-[var(--card-border)] hover:bg-[var(--secondary)]/30"
                  }`}
                  onClick={() => setExpandedSkill(expandedSkill === key ? null : key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--foreground)]">
                        {skillLabels[key]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        data.trend.startsWith("+") 
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--muted)]/10 text-[var(--muted)]"
                      }`}>
                        {data.trend}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        data.score >= 75 ? "text-[var(--success)]" :
                        data.score >= 50 ? "text-[var(--warning)]" : "text-[var(--error)]"
                      }`}>
                        {data.score}%
                      </span>
                      <svg
                        className={`w-4 h-4 text-[var(--muted)] transition-transform ${
                          expandedSkill === key ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <ProgressBar
                    value={data.score}
                    color={getColorForScore(data.score)}
                    size="md"
                    showValue={false}
                  />
                  {expandedSkill === key && (
                    <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                      <div className="flex items-start gap-2 bg-[var(--primary)]/5 p-3 rounded-lg">
                        <svg className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-[var(--primary)] mb-1">AI Insight</p>
                          <p className="text-sm text-[var(--foreground)]">{data.aiInsight}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                  <span className="text-sm text-[var(--muted)]">Strong (75%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
                  <span className="text-sm text-[var(--muted)]">Developing (50-74%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
                  <span className="text-sm text-[var(--muted)]">Needs Growth (&lt;50%)</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Enhanced Skill Gap Analysis Panel */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[var(--warning)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            Skill Gap Analysis
            <InfoTooltip content="Skills below 70% that have high impact on your goals. Each gap includes actionable steps to improve." />
          </h2>
          
          <Accordion>
            {mockSkillGaps.map((gap, index) => (
              <AccordionItem
                key={index}
                defaultOpen={index === 0}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                title={
                  <div className="flex items-center justify-between flex-1 mr-4">
                    <span>{gap.skill}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--muted)]">
                        {gap.current}% → {gap.target}%
                      </span>
                      <Badge variant="warning" size="sm">Gap: {gap.target - gap.current}%</Badge>
                    </div>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Progress visualization */}
                  <div className="relative">
                    <ProgressBar value={gap.current} max={100} color="warning" showValue={false} size="lg" />
                    <div 
                      className="absolute top-0 h-full border-r-2 border-dashed border-[var(--success)]"
                      style={{ left: `${gap.target}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[var(--success)] font-medium whitespace-nowrap">
                        Target: {gap.target}%
                      </span>
                    </div>
                  </div>

                  {/* Why this skill matters */}
                  <div className="bg-[var(--warning)]/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Why This Matters
                    </h4>
                    <p className="text-sm text-[var(--foreground)]">{gap.importance}</p>
                  </div>

                  {/* AI Prediction */}
                  <div className="bg-[var(--primary)]/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-[var(--primary)] mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Prediction
                    </h4>
                    <p className="text-sm text-[var(--foreground)]">{gap.aiPrediction}</p>
                  </div>

                  {/* Actionable Improvement Steps */}
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      How to Improve (Actionable Steps)
                    </h4>
                    <div className="space-y-3">
                      {gap.improvementSteps.map((step, stepIndex) => (
                        <div 
                          key={stepIndex}
                          className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[var(--card-border)]"
                        >
                          <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {stepIndex + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-[var(--foreground)]">{step.step}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="success" size="sm">{step.impact}</Badge>
                              <span className="text-xs text-[var(--muted)]">⏱️ {step.timeframe}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Enhanced Personalized Recommendations Panel */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[var(--accent)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            Personalized Recommendations
            <InfoTooltip content="Each recommendation includes match %, AI reasoning, and expected skill improvements" />
          </h2>

          {/* Match Level Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-[var(--secondary)]/50 rounded-xl">
            <span className="text-sm text-[var(--muted)]">Match Level:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
              <span className="text-sm text-[var(--foreground)]">High (85%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
              <span className="text-sm text-[var(--foreground)]">Medium (70-84%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
              <span className="text-sm text-[var(--foreground)]">Low (&lt;70%)</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--card-border)] pb-2">
            {[
              { key: "courses", label: "Courses", icon: "📚", count: mockOpportunities.courses.length },
              { key: "projects", label: "Projects", icon: "🛠️", count: mockOpportunities.projects.length },
              { key: "competitions", label: "Competitions", icon: "🏆", count: mockOpportunities.competitions.length },
              { key: "internships", label: "Internships", icon: "💼", count: mockOpportunities.internships.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--secondary)] text-[var(--muted)] hover:bg-[var(--primary)]/10"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.key 
                    ? "bg-white/20 text-white" 
                    : "bg-[var(--muted)]/20"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Enhanced Opportunity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockOpportunities[activeTab].map((item) => (
              <Card 
                key={item.id} 
                padding="none" 
                hover 
                className={`overflow-hidden ${
                  expandedOpportunity === item.id ? "ring-2 ring-[var(--primary)]" : ""
                }`}
              >
                {/* Match Level Indicator Bar */}
                <div className={`h-1 ${getMatchLevelColor(item.matchLevel)}`} />
                
                <div className="p-6">
                  <CardHeader className="mb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${getMatchLevelColor(item.matchLevel)}`} />
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <CardDescription>
                          {"provider" in item && item.provider}
                          {"type" in item && item.type}
                          {"organizer" in item && item.organizer}
                          {"company" in item && item.company}
                        </CardDescription>
                      </div>
                      <Badge variant={getMatchLevelBadge(item.matchLevel)} className="flex-shrink-0">
                        {item.match}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="mt-4">
                    {/* Why it matches */}
                    <div className="mb-4">
                      <p className="text-sm text-[var(--foreground)]">{item.reason}</p>
                    </div>

                    {/* Expected Benefits */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[var(--muted)] uppercase mb-2">Expected Skill Improvements</p>
                      <div className="flex flex-wrap gap-2">
                        {item.expectedBenefits.map((benefit, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--success)]/10 text-[var(--success)] text-xs rounded-full"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            {benefit.skill} {benefit.improvement}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)] mb-4">
                      {"duration" in item && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item.duration}
                        </span>
                      )}
                      {"level" in item && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {item.level}
                        </span>
                      )}
                      {"deadline" in item && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {item.deadline}
                        </span>
                      )}
                      {"difficulty" in item && (
                        <Badge variant="info" size="sm">{item.difficulty}</Badge>
                      )}
                      {"skills" in item && item.skills.map((skill: string) => (
                        <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                      ))}
                    </div>

                    {/* Expandable AI Reasoning */}
                    <button
                      onClick={() => setExpandedOpportunity(expandedOpportunity === item.id ? null : item.id)}
                      className="w-full text-left"
                    >
                      <div className={`p-3 rounded-lg border transition-all ${
                        expandedOpportunity === item.id 
                          ? "border-[var(--primary)] bg-[var(--primary)]/5" 
                          : "border-[var(--card-border)] hover:border-[var(--primary)]/50"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[var(--primary)] flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            View AI Reasoning
                          </span>
                          <svg 
                            className={`w-4 h-4 text-[var(--primary)] transition-transform ${
                              expandedOpportunity === item.id ? "rotate-180" : ""
                            }`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {expandedOpportunity === item.id && (
                          <p className="mt-3 text-sm text-[var(--foreground)] border-t border-[var(--card-border)] pt-3">
                            {item.aiReasoning}
                          </p>
                        )}
                      </div>
                    </button>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Enhanced 30-Day Action Plan Panel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <svg
                className="w-6 h-6 text-[var(--primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Your 30-Day Action Plan
              <InfoTooltip content="Tasks are specific, measurable, and directly linked to skill improvements. Complete tasks to track your progress." />
            </h2>
            <div className="flex items-center gap-3">
              <Badge variant="info" className="text-sm">
                {completedTasks}/{totalTasks} Tasks Complete
              </Badge>
              <Badge variant={completedTasks === totalTasks ? "success" : "default"} className="text-sm">
                {Math.round((completedTasks / totalTasks) * 100)}% Done
              </Badge>
            </div>
          </div>

          {/* Overall Progress Card */}
          <Card padding="lg" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Overall Progress</h3>
              <span className="text-sm text-[var(--muted)]">
                {completedTasks} of {totalTasks} tasks completed
              </span>
            </div>
            <ProgressBar
              value={(completedTasks / totalTasks) * 100}
              color="primary"
              size="lg"
              showValue={false}
            />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {actionPlan.map((week, idx) => (
                <div key={idx} className="text-center">
                  <div className={`text-xs font-medium mb-1 ${
                    getWeekProgress(idx) === 100 ? "text-[var(--success)]" : "text-[var(--muted)]"
                  }`}>
                    Week {idx + 1}
                  </div>
                  <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        getWeekProgress(idx) === 100 ? "bg-[var(--success)]" : "bg-[var(--primary)]"
                      }`}
                      style={{ width: `${getWeekProgress(idx)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Tasks */}
          <div className="space-y-6">
            {actionPlan.map((week, weekIndex) => (
              <Card key={week.week} padding="none" className="overflow-hidden">
                {/* Week Header */}
                <div className={`px-6 py-4 border-b border-[var(--card-border)] ${
                  getWeekProgress(weekIndex) === 100 
                    ? "bg-[var(--success)]/10" 
                    : "bg-[var(--secondary)]/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        getWeekProgress(weekIndex) === 100
                          ? "bg-[var(--success)] text-white"
                          : "bg-[var(--primary)]/10 text-[var(--primary)]"
                      }`}>
                        {getWeekProgress(weekIndex) === 100 ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          weekIndex + 1
                        )}
                      </span>
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">{week.week}</h3>
                        <p className="text-sm text-[var(--muted)]">{week.focus}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {week.skillTargets.map((skill, idx) => (
                          <Badge key={idx} variant="info" size="sm">{skill}</Badge>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-[var(--muted)]">
                        {week.tasks.filter(t => t.completed).length}/{week.tasks.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-4 space-y-3">
                  {week.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border-l-4 transition-all ${
                        task.completed
                          ? "bg-[var(--success)]/5 border-l-[var(--success)]"
                          : `bg-[var(--secondary)]/30 hover:bg-[var(--secondary)]/50 ${getPriorityColor(task.priority)}`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(weekIndex, task.id)}
                            className="mt-1 w-5 h-5 rounded border-2 border-[var(--primary)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-sm font-medium ${
                                task.completed
                                  ? "text-[var(--muted)] line-through"
                                  : "text-[var(--foreground)]"
                              }`}>
                                {task.task}
                              </span>
                              {!task.completed && (
                                <Badge 
                                  variant={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "default"} 
                                  size="sm"
                                >
                                  {task.priority}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Task Details */}
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="inline-flex items-center gap-1 text-[var(--success)]">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                {task.skillImpact}
                              </span>
                              <span className="text-[var(--muted)]">
                                📋 {task.measurable}
                              </span>
                              {task.resourceLink && (
                                <a
                                  href={task.resourceLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Resource
                                </a>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Priority Legend */}
          <div className="mt-6 p-4 bg-[var(--secondary)]/50 rounded-xl">
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">Task Priority:</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded bg-[var(--error)]" />
                <span className="text-sm text-[var(--muted)]">High - Do first</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded bg-[var(--warning)]" />
                <span className="text-sm text-[var(--muted)]">Medium - Important</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded bg-[var(--muted)]" />
                <span className="text-sm text-[var(--muted)]">Low - When time permits</span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Summary Section */}
        <section className="mb-12">
          <Card padding="lg" className="bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">AI Summary & Next Steps</h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Based on your profile, you have strong technical foundations (82%) and problem-solving abilities (78%). 
                  Your biggest opportunity for growth is in leadership skills, which are crucial for college applications 
                  and future career success. Following this 30-day plan consistently, our AI predicts you can improve 
                  your overall skill score by <span className="font-semibold text-[var(--success)]">18-22%</span> and 
                  close your leadership gap by <span className="font-semibold text-[var(--success)]">15%</span>.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                    🎯 Focus: Leadership Development
                  </span>
                  <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                    ⏱️ Timeline: 30 days
                  </span>
                  <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                    📈 Predicted Growth: +18-22%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/analyze">
            <Button variant="outline" size="lg">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Analyze Again
            </Button>
          </Link>
          <Button size="lg">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Results
          </Button>
          <Button variant="secondary" size="lg">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
}
