"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Select, Slider, Card, Badge, InfoTooltip } from "@/components/ui";
import type { FormData } from "./types";
import { initialFormData } from "./types";
import {
  gradeOptions,
  timeAvailabilityOptions,
  learningModes,
  goalOptions,
  interestCategories,
  skillLabels,
  stepLabels,
  parseTimeAvailability,
} from "./data";

export default function AnalyzePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const totalSteps = 4;

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateSkill = (skillKey: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillKey]: value,
      },
    }));
  };

  const toggleArrayItem = (field: keyof FormData, item: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i) => i !== item)
        : [...currentArray, item];
      return { ...prev, [field]: newArray };
    });
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.grade) {
        newErrors.grade = "Please select your grade";
      }
      if (!formData.interests.trim() && formData.interestCategories.length === 0) {
        newErrors.interests = "Please enter your interests or select at least one category";
      }
    }

    if (step === 2) {
      if (formData.goals.length === 0 && !formData.customGoal.trim()) {
        newErrors.goals = "Please select at least one goal or enter a custom goal";
      }
      if (!formData.timeAvailability) {
        newErrors.timeAvailability = "Please select your time availability";
      }
      if (formData.preferredLearningModes.length === 0) {
        newErrors.preferredLearningModes = "Please select at least one learning mode";
      }
    }

    if (step === 3) {
      if (!formData.activities.trim()) {
        newErrors.activities = "Please describe your activities or experiences";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    // Transform form data to match API schema
    const apiPayload = {
      grade: parseInt(formData.grade, 10),
      interests_free_text: formData.interests,
      interests_by_category: {
        academic: formData.interestCategories.includes("academic"),
        creative: formData.interestCategories.includes("creative"),
        social: formData.interestCategories.includes("social"),
        technical: formData.interestCategories.includes("technical"),
        sports: formData.interestCategories.includes("sports"),
        music: formData.interestCategories.includes("music"),
        business: formData.interestCategories.includes("business"),
        health_wellness: formData.interestCategories.includes("health"),
        other: formData.interestCategories.includes("other"),
      },
      goals_selected: formData.goals,
      goals_free_text: formData.customGoal || undefined,
      time_availability_hours_per_week: parseTimeAvailability(formData.timeAvailability),
      learning_preferences: formData.preferredLearningModes,
      past_activities: formData.activities,
      past_achievements: formData.pastAchievements || undefined,
    };

    try {
      const response = await fetch("/api/analyze-student-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.details || result.error || "Analysis failed");
      }

      // Store both the form data and AI analysis results for the results page
      const resultsData = {
        formData: {
          grade: formData.grade,
          interests: formData.interests,
          interestCategories: formData.interestCategories,
          goals: formData.goals,
          customGoal: formData.customGoal,
          timeAvailability: formData.timeAvailability,
          preferredLearningModes: formData.preferredLearningModes,
          activities: formData.activities,
          pastAchievements: formData.pastAchievements,
          challenges: formData.challenges,
          skillSelfRatings: formData.skills,
        },
        confidence_note: result.confidence_note,
        aiAnalysis: result.data,
        meta: result.meta,
        submittedAt: new Date().toISOString(),
      };

      sessionStorage.setItem("skillAnalysisData", JSON.stringify(resultsData));
      router.push("/results");
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalyzeError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)]/5 via-white to-[var(--accent)]/5 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
            Skill Analysis
          </h1>
          <p className="text-[var(--muted)]">
            Tell us about yourself so our AI can find the best opportunities for
            you.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 flex-shrink-0 ${
                    step <= currentStep
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--secondary)] text-[var(--muted)]"
                  }`}
                >
                  {step < currentStep ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                      step < currentStep
                        ? "bg-[var(--primary)]"
                        : "bg-[var(--secondary)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-[var(--muted)]">
            {stepLabels.map((label, idx) => (
              <span key={idx} className={`text-center ${idx === 0 ? 'text-left' : ''} ${idx === stepLabels.length - 1 ? 'text-right' : ''}`} style={{ width: '25%' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card padding="lg" className="shadow-lg">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-1">
                  Basic Information
                </h2>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Let&apos;s start with some basics about you.
                </p>
              </div>

              <Select
                label="What grade are you in? *"
                options={gradeOptions}
                value={formData.grade}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, grade: e.target.value }))
                }
                error={errors.grade}
              />

              <Input
                label="What are your interests?"
                placeholder="e.g., coding, music, sports, art, science, writing..."
                value={formData.interests}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, interests: e.target.value }))
                }
                error={errors.interests}
                helperText="List things you're passionate about or enjoy doing"
              />

              {/* Interest Categories - Multi-select Tags */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    Interests by Category
                  </label>
                  <InfoTooltip content="Select categories that best describe your interests. This helps us match you with relevant opportunities." />
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleArrayItem("interestCategories", category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                        formData.interestCategories.includes(category.id)
                          ? `${category.color} border-current shadow-sm`
                          : "bg-white border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--primary)]/50"
                      }`}
                    >
                      <span className="mr-1.5">{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </div>
                {formData.interestCategories.length > 0 && (
                  <p className="mt-2 text-xs text-[var(--success)]">
                    ✓ {formData.interestCategories.length} categor{formData.interestCategories.length === 1 ? 'y' : 'ies'} selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Goals & Learning Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-1">
                  Goals & Learning Preferences
                </h2>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Tell us what you want to achieve and how you learn best.
                </p>
              </div>

              {/* Goals Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    What are your goals? *
                  </label>
                  <InfoTooltip content="Select all goals that apply. Our AI will prioritize opportunities that align with your goals." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleArrayItem("goals", goal.id)}
                      className={`p-3 rounded-xl text-left text-sm font-medium border-2 transition-all duration-200 ${
                        formData.goals.includes(goal.id)
                          ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                          : "bg-white border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
                      }`}
                    >
                      <span className="mr-2">{goal.icon}</span>
                      {goal.label}
                    </button>
                  ))}
                </div>
                {errors.goals && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.goals}</p>
                )}
              </div>

              <Input
                label="Other goals (optional)"
                placeholder="Any specific goals not listed above..."
                value={formData.customGoal}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customGoal: e.target.value }))
                }
                helperText="Tell us about any specific goals you have in mind"
              />

              {/* Time Availability */}
              <Select
                label="Time Availability *"
                options={timeAvailabilityOptions}
                value={formData.timeAvailability}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, timeAvailability: e.target.value }))
                }
                error={errors.timeAvailability}
                helperText="How many hours per week can you dedicate to skill-building?"
              />

              {/* Preferred Learning Modes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    How do you learn best? *
                  </label>
                  <InfoTooltip content="We'll recommend resources that match your preferred learning style." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {learningModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => toggleArrayItem("preferredLearningModes", mode.id)}
                      className={`p-4 rounded-xl text-left border-2 transition-all duration-200 ${
                        formData.preferredLearningModes.includes(mode.id)
                          ? "bg-[var(--accent)]/10 border-[var(--accent)] shadow-sm"
                          : "bg-white border-[var(--card-border)] hover:border-[var(--accent)]/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{mode.icon}</span>
                        <span className={`font-medium ${
                          formData.preferredLearningModes.includes(mode.id)
                            ? "text-[var(--accent)]"
                            : "text-[var(--foreground)]"
                        }`}>
                          {mode.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)]">{mode.description}</p>
                    </button>
                  ))}
                </div>
                {errors.preferredLearningModes && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.preferredLearningModes}</p>
                )}
                {formData.preferredLearningModes.length > 0 && (
                  <p className="mt-2 text-xs text-[var(--success)]">
                    ✓ {formData.preferredLearningModes.length} learning mode{formData.preferredLearningModes.length === 1 ? '' : 's'} selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Experience & Achievements */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-1">
                  Your Experience
                </h2>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Tell us about activities and experiences that have shaped you.
                </p>
              </div>

              <Textarea
                label="Past Activities & Experiences *"
                placeholder="Examples:
• School clubs (debate team, robotics club, band)
• Sports teams
• Volunteer work
• Part-time jobs
• Personal projects (YouTube channel, app, art portfolio)
• Online courses or certifications"
                value={formData.activities}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    activities: e.target.value,
                  }))
                }
                error={errors.activities}
                rows={6}
                helperText="The more detail you provide, the better our recommendations will be"
              />

              {/* Past Achievements */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    Past Achievements (Optional)
                  </label>
                  <InfoTooltip content="Include awards, certifications, competitions, or any recognition you've received. This helps us understand your strengths." />
                </div>
                <Textarea
                  placeholder="Examples:
• Honor Roll 2024
• Science Fair 2nd Place
• Google IT Support Certificate
• Debate Team Regional Finalist
• Eagle Scout"
                  value={formData.pastAchievements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pastAchievements: e.target.value,
                    }))
                  }
                  rows={5}
                  helperText="List any awards, certifications, or competitions you've participated in"
                />
              </div>
            </div>
          )}

          {/* Step 4: Self-Assessment */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-1">
                  Self-Assessment
                </h2>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Rate your skills and share any challenges you want to work on.
                </p>
              </div>

              {/* Challenges / Weak Points */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    Challenges or Areas to Improve (Optional)
                  </label>
                  <InfoTooltip content="Being honest about challenges helps our AI provide better recommendations for growth. This information is confidential." />
                </div>
                <Textarea
                  placeholder="Examples:
• I struggle with public speaking
• Time management is difficult for me
• I want to improve my coding skills
• I find it hard to stay organized"
                  value={formData.challenges}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      challenges: e.target.value,
                    }))
                  }
                  rows={4}
                  helperText="Share any weaknesses or areas where you'd like to improve"
                />
              </div>

              {/* Skill Self-Rating */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    Rate Your Skills (Optional)
                  </label>
                  <InfoTooltip content="Rate yourself from 0 (beginner) to 5 (expert). This helps us personalize your recommendations." />
                </div>
                <div className="space-y-6 p-4 bg-[var(--secondary)]/30 rounded-xl">
                  {skillLabels.map((skill) => (
                    <div key={skill.key}>
                      <div className="mb-1">
                        <span className="text-xs text-[var(--muted)]">
                          {skill.description}
                        </span>
                      </div>
                      <Slider
                        label={skill.label}
                        value={
                          formData.skills[skill.key as keyof typeof formData.skills]
                        }
                        onChange={(value) => updateSkill(skill.key, value)}
                        min={0}
                        max={5}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Card */}
              <Card padding="md" className="bg-[var(--primary)]/5 border-[var(--primary)]/20">
                <h3 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ready to Analyze
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.grade ? "success" : "default"} size="sm">
                      {formData.grade ? "✓" : "○"}
                    </Badge>
                    <span className="text-[var(--muted)]">Grade selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.goals.length > 0 ? "success" : "default"} size="sm">
                      {formData.goals.length > 0 ? "✓" : "○"}
                    </Badge>
                    <span className="text-[var(--muted)]">{formData.goals.length} goals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.preferredLearningModes.length > 0 ? "success" : "default"} size="sm">
                      {formData.preferredLearningModes.length > 0 ? "✓" : "○"}
                    </Badge>
                    <span className="text-[var(--muted)]">{formData.preferredLearningModes.length} learning modes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.timeAvailability ? "success" : "default"} size="sm">
                      {formData.timeAvailability ? "✓" : "○"}
                    </Badge>
                    <span className="text-[var(--muted)]">{formData.timeAvailability || "No"} time set</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {analyzeError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">Analysis Failed</p>
                  <p className="text-sm text-red-600 mt-1">{analyzeError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[var(--card-border)]">
            {currentStep > 1 ? (
              <Button variant="ghost" onClick={handleBack}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Continue
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isAnalyzing} className="group">
                {isAnalyzing ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze My Skills
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Info Note */}
        <div className="mt-6 flex items-start gap-3 text-sm text-[var(--muted)]">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>
            Your information is used only to provide personalized
            recommendations. We never share your data with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
