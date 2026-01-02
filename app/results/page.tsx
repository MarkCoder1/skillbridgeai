"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  ProgressBar,
  Badge,
  InfoTooltip,
  Accordion,
  AccordionItem,
  RecommendationCard,
  type Recommendation,
} from "@/components/ui";

// Import modular files
import type {
  AIAnalysisData,
  SkillGapAnalysis,
  RecommendationsData,
  ActionPlanData,
  TabType,
  RecommendationSortBy,
  RecommendationFilterLevel,
  EvidenceSource,
} from "./types";

import {
  getColorForScore,
  getPriorityColor,
  calculateCompletedTasks,
  calculateTotalTasks,
  getWeekProgress as getWeekProgressUtil,
  sortRecommendations,
  filterRecommendations,
} from "./utils";

import {
  fetchSkillGapAnalysis as fetchSkillGapAnalysisAPI,
  fetchPersonalizedRecommendations as fetchPersonalizedRecommendationsAPI,
  fetch30DayPlan as fetch30DayPlanAPI,
} from "./api";

import { generatePDFReport as generatePDF } from "./pdfGenerator";

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("courses");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AIAnalysisData | null>(null);
  const [skillGapData, setSkillGapData] = useState<SkillGapAnalysis | null>(null);
  const [isLoadingGaps, setIsLoadingGaps] = useState(false);
  const [gapError, setGapError] = useState<string | null>(null);
  const [expandedStepInsight, setExpandedStepInsight] = useState<string | null>(null);
  
  // Personalized Recommendations State
  const [recommendationsData, setRecommendationsData] = useState<RecommendationsData | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [recSortBy, setRecSortBy] = useState<RecommendationSortBy>("match");
  const [recFilterLevel, setRecFilterLevel] = useState<RecommendationFilterLevel>("all");
  
  // 30-Day Action Plan State
  const [aiActionPlan, setAiActionPlan] = useState<ActionPlanData | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  
  // PDF download state
  const [isDownloading, setIsDownloading] = useState(false);

  // Toggle step insight visibility
  const toggleStepInsight = (skillIndex: number, stepIndex: number) => {
    const key = `${skillIndex}-${stepIndex}`;
    setExpandedStepInsight(prev => prev === key ? null : key);
  };

  // Function to fetch skill gap analysis using API module
  const fetchSkillGapAnalysis = async (data: AIAnalysisData) => {
    setIsLoadingGaps(true);
    setGapError(null);

    const result = await fetchSkillGapAnalysisAPI(data);
    
    if (result.success) {
      setSkillGapData(result.data);
      console.log("Skill Gap Analysis loaded:", result.data);
    } else {
      setGapError(result.error);
    }
    
    setIsLoadingGaps(false);
  };

  // Function to fetch personalized recommendations using API module
  const fetchPersonalizedRecommendations = async (data: AIAnalysisData, gapData?: SkillGapAnalysis) => {
    setIsLoadingRecommendations(true);
    setRecommendationsError(null);

    const result = await fetchPersonalizedRecommendationsAPI(data, gapData);
    
    if (result.success) {
      setRecommendationsData(result.data);
      console.log("Personalized Recommendations loaded:", result.data);
    } else {
      setRecommendationsError(result.error);
    }
    
    setIsLoadingRecommendations(false);
  };

  // Function to fetch 30-day action plan using API module
  const fetch30DayPlan = async (
    data: AIAnalysisData, 
    gapData: SkillGapAnalysis, 
    recData: RecommendationsData
  ) => {
    setIsLoadingPlan(true);
    setPlanError(null);

    const result = await fetch30DayPlanAPI(data, gapData, recData);
    
    if (result.success) {
      setAiActionPlan(result.data);
      console.log("30-Day Action Plan loaded:", result.data);
    } else {
      setPlanError(result.error);
    }
    
    setIsLoadingPlan(false);
  };

  // Toggle task completion in AI-generated plan
  const toggleAiTask = (weekIndex: number, taskId: string) => {
    if (!aiActionPlan) return;
    setAiActionPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week, wIdx) =>
          wIdx === weekIndex
            ? {
                ...week,
                tasks: week.tasks.map(task =>
                  task.task_id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
                ),
              }
            : week
        ),
      };
    });
  };

  // Get filtered and sorted recommendations for current tab
  const getFilteredRecommendations = (): Recommendation[] => {
    if (!recommendationsData) return [];
    
    let recs: Recommendation[] = [];
    switch (activeTab) {
      case "courses":
        recs = recommendationsData.courses;
        break;
      case "projects":
        recs = recommendationsData.projects;
        break;
      case "competitions":
        recs = recommendationsData.competitions;
        break;
    }

    // Apply filter and sort using utility functions
    const filtered = filterRecommendations(recs, recFilterLevel);
    return sortRecommendations(filtered, recSortBy);
  };

  // Calculate task counts using utility functions
  const completedTasks = calculateCompletedTasks(aiActionPlan);
  const totalTasks = calculateTotalTasks(aiActionPlan);
  
  // Get week progress using utility function
  const getWeekProgress = (weekIndex: number) => getWeekProgressUtil(aiActionPlan, weekIndex);

  // PDF Generation handler
  const handleGeneratePDF = async () => {
    setIsDownloading(true);
    try {
      await generatePDF({
        analysisData,
        skillGapData,
        recommendationsData,
        aiActionPlan,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    // Load analysis data from sessionStorage
    const storedData = sessionStorage.getItem("skillAnalysisData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as AIAnalysisData;
        setAnalysisData(parsed);
        console.log("AI Analysis Data loaded:", parsed);
        
        // Fetch skill gap analysis after loading skill snapshot
        fetchSkillGapAnalysis(parsed);
      } catch (error) {
        console.error("Failed to parse analysis data:", error);
      }
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch personalized recommendations when skill gap data is available
  useEffect(() => {
    if (analysisData && skillGapData && !recommendationsData && !isLoadingRecommendations) {
      fetchPersonalizedRecommendations(analysisData, skillGapData);
    }
  }, [skillGapData, analysisData]);

  // Fetch 30-day action plan when recommendations are loaded
  useEffect(() => {
    if (analysisData && skillGapData && recommendationsData && !aiActionPlan && !isLoadingPlan) {
      fetch30DayPlan(analysisData, skillGapData, recommendationsData);
    }
  }, [recommendationsData, analysisData, skillGapData]);

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

        {/* Skill Snapshot Section - Enhanced with AI data and expandable insights */}
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
            <InfoTooltip content="Click on any skill to see AI-generated insights with reasoning and supporting evidence from your responses" />
          </h2>
          <Card padding="lg">
            {/* Use AI data if available, otherwise fall back to mock data */}
            {analysisData?.aiAnalysis ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysisData.aiAnalysis.skill_signals).map(([aiKey, signal]) => {
                    // Map AI keys (snake_case) to display names
                    const skillDisplayNames: Record<string, string> = {
                      problem_solving: "Problem Solving",
                      communication: "Communication",
                      technical_skills: "Technical Skills",
                      creativity: "Creativity",
                      leadership: "Leadership",
                      self_management: "Self-Management",
                    };
                    const skillName = skillDisplayNames[aiKey] || aiKey;
                    const score = Math.round(signal.confidence * 100);
                    
                    return (
                      <div
                        key={aiKey}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          expandedSkill === aiKey
                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                            : "border-transparent hover:border-[var(--card-border)] hover:bg-[var(--secondary)]/30"
                        }`}
                        onClick={() => setExpandedSkill(expandedSkill === aiKey ? null : aiKey)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--foreground)]">
                              {skillName}
                            </span>
                            <Badge
                              variant={signal.evidence_found ? "success" : "default"}
                              size="sm"
                            >
                              {signal.evidence_found ? "Evidence Found" : "No Evidence"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              score >= 75 ? "text-[var(--success)]" :
                              score >= 50 ? "text-[var(--warning)]" : "text-[var(--error)]"
                            }`}>
                              {score}%
                            </span>
                            <svg
                              className={`w-4 h-4 text-[var(--muted)] transition-transform ${
                                expandedSkill === aiKey ? "rotate-180" : ""
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
                          value={score}
                          color={getColorForScore(score)}
                          size="md"
                          showValue={false}
                        />
                        
                        {/* Expandable AI Insights Section */}
                        {expandedSkill === aiKey && (
                          <div className="mt-4 pt-4 border-t border-[var(--card-border)] space-y-4">
                            {/* AI Reasoning */}
                            <div className="flex items-start gap-2 bg-[var(--primary)]/5 p-3 rounded-lg">
                              <svg className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-[var(--primary)] mb-1">AI Reasoning</p>
                                <p className="text-sm text-[var(--foreground)]">
                                  {signal.reasoning || "No detailed reasoning available."}
                                </p>
                              </div>
                            </div>
                            
                            {/* Supporting Evidence with Sources */}
                            {signal.evidence_phrases.length > 0 && (
                              <div className="bg-[var(--secondary)]/30 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="text-sm font-medium text-[var(--foreground)]">Supporting Evidence</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {signal.evidence_phrases.map((phrase, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2.5 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md border border-[var(--primary)]/20"
                                    >
                                      &ldquo;{phrase}&rdquo;
                                    </span>
                                  ))}
                                </div>
                                
                                {/* Evidence Sources (Provenance) */}
                                {signal.evidence_sources && signal.evidence_sources.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-[var(--card-border)]/50">
                                    <p className="text-xs text-[var(--muted)] mb-1.5">Evidence found in:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {signal.evidence_sources.map((source, idx) => {
                                        const sourceLabels: Record<EvidenceSource, string> = {
                                          interests: "Interests",
                                          goals: "Goals",
                                          past_activities: "Past Activities",
                                          achievements: "Achievements",
                                        };
                                        return (
                                          <span
                                            key={idx}
                                            className="text-xs px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md"
                                          >
                                            {sourceLabels[source]}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* No Evidence Message */}
                            {!signal.evidence_found && signal.evidence_phrases.length === 0 && (
                              <div className="bg-[var(--muted)]/10 p-3 rounded-lg">
                                <p className="text-sm text-[var(--muted)] italic">
                                  💡 Tip: To improve this score, consider describing experiences where you demonstrated {skillName.toLowerCase()} skills in your activities and achievements.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Confidence Note - Ethical Transparency */}
                {analysisData.confidence_note && (
                  <div className="mt-4 p-3 bg-[var(--warning)]/5 border border-[var(--warning)]/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-[var(--warning)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-[var(--muted)]">
                        <strong className="text-[var(--foreground)]">Note:</strong> {analysisData.confidence_note}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Analysis Metadata */}
                <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
                  <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
                    <span>
                      <strong>Analyzed:</strong>{" "}
                      {new Date(analysisData.meta.analyzed_at).toLocaleString()}
                    </span>
                    <span>
                      <strong>Model:</strong> {analysisData.meta.model}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Error state when no AI analysis data */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-[var(--error)]/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  No Analysis Data Available
                </h3>
                <p className="text-sm text-[var(--muted)] max-w-md mb-4">
                  We couldn&apos;t find your skill analysis data. This may happen if you accessed this page directly without completing the intake form.
                </p>
                <Link href="/analyze">
                  <Button variant="primary">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Complete Skill Analysis
                  </Button>
                </Link>
              </div>
            )}
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
            <InfoTooltip content="AI-identified skills below goal level with personalized improvement paths based on your context and time availability." />
          </h2>

          {/* Loading State */}
          {isLoadingGaps && (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--muted)]">Analyzing skill gaps and generating personalized recommendations...</p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {gapError && !isLoadingGaps && (
            <Card className="p-6 border-l-4 border-l-[var(--error)]">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[var(--error)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-[var(--error)]">Failed to load skill gap analysis</h4>
                  <p className="text-sm text-[var(--muted)] mt-1">{gapError}</p>
                  <button 
                    onClick={() => analysisData && fetchSkillGapAnalysis(analysisData)}
                    className="mt-3 text-sm text-[var(--primary)] hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Success State - Dynamic Data */}
          {skillGapData && !isLoadingGaps && (
            <>
              {/* Summary Card */}
              <Card className="p-5 mb-6 bg-gradient-to-r from-[var(--warning)]/5 to-[var(--primary)]/5">
                <div className="flex flex-wrap gap-6 items-start justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      AI Summary
                    </h4>
                    <p className="text-sm text-[var(--foreground)]">{skillGapData.overall_summary}</p>
                  </div>
                  {skillGapData.priority_skills.length > 0 && (
                    <div className="flex flex-col gap-2 text-right">
                      <div>
                        <span className="text-xs text-[var(--muted)]">Priority Focus</span>
                        <div className="flex flex-wrap gap-1 mt-1 justify-end">
                          {skillGapData.priority_skills.map((skill, i) => (
                            <Badge key={i} variant="warning" size="sm">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted)]">Recommended Weekly Time</span>
                        <p className="text-sm font-semibold text-[var(--primary)]">{skillGapData.total_weekly_time_recommended}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* No Gaps State */}
              {skillGapData.skill_gaps.length === 0 && (
                <Card className="p-6 text-center bg-[var(--success)]/5 border-[var(--success)]/20">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-semibold text-[var(--success)]">All Skills Meet Your Goals!</h4>
                    <p className="text-sm text-[var(--muted)] max-w-md">
                      Your current skill levels are at or above your target levels for your stated goals. 
                      Keep up the great work! Consider setting higher targets or exploring new skill areas.
                    </p>
                  </div>
                </Card>
              )}

              {/* Skill Gap Accordions */}
              {skillGapData.skill_gaps.length > 0 && (
                <Accordion>
                  {skillGapData.skill_gaps.map((gap, index) => (
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
                              {gap.current_level}% → {gap.goal_level}%
                            </span>
                            <Badge variant="warning" size="sm">Gap: {gap.gap}%</Badge>
                            <Badge variant="success" size="sm">→ {gap.expected_level_after}%</Badge>
                          </div>
                        </div>
                      }
                    >
                      <div className="space-y-4">
                        {/* Progress visualization */}
                        <div className="relative pt-6">
                          <ProgressBar value={gap.current_level} max={100} color="warning" showValue={false} size="lg" />
                          {/* Goal marker */}
                          <div 
                          className="absolute top-0 h-full border-r-2 border-dashed border-[var(--success)]"
                          style={{ left: `${gap.goal_level}%` }}
                        >
                          <span className="absolute -top-0 left-1/2 -translate-x-1/2 text-xs text-[var(--success)] font-medium whitespace-nowrap">
                            Goal: {gap.goal_level}%
                          </span>
                        </div>
                        {/* Expected level marker */}
                        <div 
                          className="absolute top-0 h-full border-r-2 border-dotted border-[var(--primary)]"
                          style={{ left: `${gap.expected_level_after}%` }}
                        >
                          <span className="absolute top-8 left-1/2 -translate-x-1/2 text-xs text-[var(--primary)] font-medium whitespace-nowrap">
                            Expected: {gap.expected_level_after}%
                          </span>
                        </div>
                      </div>

                      {/* Timeline Badge */}
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-[var(--muted)]">Estimated timeline: <strong className="text-[var(--foreground)]">{gap.timeline}</strong></span>
                      </div>

                      {/* Why this skill matters */}
                      <div className="bg-[var(--warning)]/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Why This Matters For Your Goals
                        </h4>
                        <p className="text-sm text-[var(--foreground)]">{gap.why_it_matters}</p>
                      </div>

                      {/* AI Reasoning */}
                      <div className="bg-[var(--primary)]/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-[var(--primary)] mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          AI Analysis
                        </h4>
                        <p className="text-sm text-[var(--foreground)]">{gap.reasoning}</p>
                      </div>

                      {/* Actionable Improvement Steps */}
                      <div>
                        <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Actionable Steps ({gap.actionable_steps.length})
                        </h4>
                        <div className="space-y-3">
                          {gap.actionable_steps.map((step, stepIndex) => {
                            const insightKey = `${index}-${stepIndex}`;
                            const isInsightExpanded = expandedStepInsight === insightKey;
                            
                            return (
                              <div 
                                key={stepIndex}
                                className={`p-3 bg-white rounded-lg border border-[var(--card-border)] border-l-4 ${
                                  step.priority === "high" ? "border-l-[var(--error)]" : 
                                  step.priority === "medium" ? "border-l-[var(--warning)]" : "border-l-[var(--muted)]"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    step.priority === "high" ? "bg-[var(--error)]" : 
                                    step.priority === "medium" ? "bg-[var(--warning)]" : "bg-[var(--muted)]"
                                  }`}>
                                    {stepIndex + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm text-[var(--foreground)]">{step.step}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                      <Badge 
                                        variant={step.priority === "high" ? "error" : step.priority === "medium" ? "warning" : "default"} 
                                        size="sm"
                                      >
                                        {step.priority} priority
                                      </Badge>
                                      <span className="text-xs text-[var(--success)] font-medium">{step.expected_impact}</span>
                                      <span className="text-xs text-[var(--muted)]">⏱️ {step.time_required}</span>
                                      
                                      {/* Insight Toggle Button */}
                                      <button
                                        onClick={() => toggleStepInsight(index, stepIndex)}
                                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                                          isInsightExpanded 
                                            ? "bg-[var(--primary)] text-white" 
                                            : "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20"
                                        }`}
                                      >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        Why?
                                        <svg 
                                          className={`w-3 h-3 transition-transform ${isInsightExpanded ? "rotate-180" : ""}`} 
                                          fill="none" 
                                          viewBox="0 0 24 24" 
                                          stroke="currentColor"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Expandable Insight Section */}
                                {isInsightExpanded && step.why && (
                                  <div className="mt-3 ml-9 p-3 bg-[var(--primary)]/5 rounded-lg border border-[var(--primary)]/20">
                                    <div className="flex items-start gap-2">
                                      <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <div>
                                        <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide">AI Insight</span>
                                        <p className="text-sm text-[var(--foreground)] mt-1">{step.why}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </AccordionItem>
                ))}
                </Accordion>
              )}

              {/* Skills Without Evidence - Disclaimer Section */}
              {skillGapData.skills_without_evidence && skillGapData.skills_without_evidence.length > 0 && (
                <Card className="mt-6 p-5 border-l-4 border-l-[var(--accent)] bg-[var(--accent)]/5">
                  <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Skills Needing More Information
                  </h4>
                  <p className="text-sm text-[var(--muted)] mb-4">
                    We couldn&apos;t find enough evidence for these skills in your responses. To get personalized gap analysis for them, 
                    consider adding relevant experiences, activities, or achievements in the intake form.
                  </p>
                  <div className="space-y-3">
                    {skillGapData.skills_without_evidence.map((skill, index) => (
                      <div 
                        key={index}
                        className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                          skill.goal_relevance === "high" 
                            ? "border-[var(--error)]/30" 
                            : skill.goal_relevance === "medium" 
                            ? "border-[var(--warning)]/30" 
                            : "border-[var(--card-border)]"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          skill.goal_relevance === "high" 
                            ? "bg-[var(--error)]" 
                            : skill.goal_relevance === "medium" 
                            ? "bg-[var(--warning)]" 
                            : "bg-[var(--muted)]"
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[var(--foreground)]">{skill.display_name}</span>
                            <Badge 
                              variant={skill.goal_relevance === "high" ? "error" : skill.goal_relevance === "medium" ? "warning" : "default"} 
                              size="sm"
                            >
                              {skill.goal_relevance} relevance
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--muted)]">{skill.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                    <a 
                      href="/analyze" 
                      className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update your responses to include these skills
                    </a>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* No data state - show message when no analysis data available */}
          {!skillGapData && !isLoadingGaps && !gapError && (
            <Card padding="lg">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-[var(--warning)]/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Skill Gap Analysis Unavailable
                </h3>
                <p className="text-sm text-[var(--muted)] max-w-md mb-4">
                  We need your skill analysis data to identify gaps. Please complete the intake form to get personalized skill gap insights.
                </p>
                <Link href="/analyze">
                  <Button variant="primary">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Start Skill Analysis
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </section>

        {/* AI-Powered Personalized Recommendations Panel */}
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
            <InfoTooltip content="AI-generated recommendations based on your skills, goals, and interests. Each includes match %, reasoning, and expected skill improvements." />
          </h2>

          {/* Loading State */}
          {isLoadingRecommendations && (
            <Card padding="lg" className="mb-6">
              <div className="flex items-center justify-center gap-4 py-8">
                <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-[var(--muted)]">Generating personalized recommendations...</span>
              </div>
            </Card>
          )}

          {/* Error State */}
          {recommendationsError && !isLoadingRecommendations && (
            <Card padding="lg" className="mb-6 border-[var(--error)]/30 bg-[var(--error)]/5">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-[var(--error)]">Failed to load recommendations</p>
                  <p className="text-sm text-[var(--muted)]">{recommendationsError}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => analysisData && fetchPersonalizedRecommendations(analysisData, skillGapData || undefined)}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {/* Recommendations Content */}
          {recommendationsData && !isLoadingRecommendations && (
            <>
              {/* Match Level Legend & Filters */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-[var(--secondary)]/50 rounded-xl items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
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
                
                {/* Sort & Filter Controls */}
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">Sort:</span>
                    <select
                      value={recSortBy}
                      onChange={(e) => setRecSortBy(e.target.value as RecommendationSortBy)}
                      className="text-sm px-2 py-1 rounded-md border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)]"
                    >
                      <option value="match">Match Score</option>
                      <option value="duration">Duration</option>
                      <option value="level">Level</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">Filter:</span>
                    <select
                      value={recFilterLevel}
                      onChange={(e) => setRecFilterLevel(e.target.value as RecommendationFilterLevel)}
                      className="text-sm px-2 py-1 rounded-md border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)]"
                    >
                      <option value="all">All Levels</option>
                      <option value="high">High Match</option>
                      <option value="medium">Medium Match</option>
                      <option value="low">Low Match</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--card-border)] pb-2">
                {[
                  { key: "courses", label: "Courses", icon: "📚", count: recommendationsData.courses.length },
                  { key: "projects", label: "Projects", icon: "🛠️", count: recommendationsData.projects.length },
                  { key: "competitions", label: "Competitions", icon: "🏆", count: recommendationsData.competitions.length },
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

              {/* Dynamic Recommendation Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredRecommendations().length === 0 ? (
                  <Card padding="lg" className="lg:col-span-2">
                    <div className="text-center py-8 text-[var(--muted)]">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No recommendations match your current filter.</p>
                      <button
                        onClick={() => setRecFilterLevel("all")}
                        className="mt-2 text-[var(--primary)] hover:underline text-sm"
                      >
                        Clear filter
                      </button>
                    </div>
                  </Card>
                ) : (
                  getFilteredRecommendations().map((rec, index) => (
                    <RecommendationCard
                      key={`${rec.type}-${rec.title}-${index}`}
                      recommendation={rec}
                      expanded={expandedOpportunity === rec.title}
                      onToggleExpand={() => setExpandedOpportunity(expandedOpportunity === rec.title ? null : rec.title)}
                    />
                  ))
                )}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 p-4 bg-[var(--secondary)]/30 rounded-xl">
                <div className="flex flex-wrap gap-6 justify-center text-center">
                  <div>
                    <p className="text-2xl font-bold text-[var(--primary)]">{recommendationsData.courses.length}</p>
                    <p className="text-xs text-[var(--muted)]">Courses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--accent)]">{recommendationsData.projects.length}</p>
                    <p className="text-xs text-[var(--muted)]">Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--warning)]">{recommendationsData.competitions.length}</p>
                    <p className="text-xs text-[var(--muted)]">Competitions</p>
                  </div>
                  <div className="border-l border-[var(--card-border)] pl-6">
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {[...recommendationsData.courses, ...recommendationsData.projects, ...recommendationsData.competitions]
                        .filter(r => r.match_score >= 85).length}
                    </p>
                    <p className="text-xs text-[var(--muted)]">High Match</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* No data state */}
          {!recommendationsData && !isLoadingRecommendations && !recommendationsError && (
            <Card padding="lg">
              <div className="text-center py-8 text-[var(--muted)]">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Complete skill analysis to receive personalized recommendations.</p>
              </div>
            </Card>
          )}
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
              {aiActionPlan && (
                <Badge variant="success" size="sm" className="ml-2">AI Generated</Badge>
              )}
            </h2>
            {!isLoadingPlan && totalTasks > 0 && (
              <div className="flex items-center gap-3">
                <Badge variant="info" className="text-sm">
                  {completedTasks}/{totalTasks} Tasks Complete
                </Badge>
                <Badge variant={completedTasks === totalTasks ? "success" : "default"} className="text-sm">
                  {Math.round((completedTasks / totalTasks) * 100)}% Done
                </Badge>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoadingPlan && (
            <Card padding="lg">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Generating Your Personalized Plan...
                </h3>
                <p className="text-sm text-[var(--muted)] text-center max-w-md">
                  Our AI is analyzing your skill gaps and recommendations to create a tailored 30-day action plan.
                </p>
              </div>
            </Card>
          )}

          {/* Waiting for Recommendations State */}
          {!aiActionPlan && !isLoadingPlan && !planError && (isLoadingRecommendations || !recommendationsData) && (
            <Card padding="lg">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[var(--muted)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Waiting for Personalized Recommendations...
                </h3>
                <p className="text-sm text-[var(--muted)] text-center max-w-md">
                  Your 30-day action plan will be generated once your personalized recommendations are ready.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
                  <span>Processing recommendations...</span>
                </div>
              </div>
            </Card>
          )}

          {/* Error State */}
          {planError && !isLoadingPlan && (
            <Card padding="lg" className="border-[var(--error)]/30 bg-[var(--error)]/5">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[var(--error)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-[var(--error)] mb-1">Failed to Generate Plan</h3>
                  <p className="text-sm text-[var(--muted)] mb-3">{planError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => analysisData && skillGapData && recommendationsData && fetch30DayPlan(analysisData, skillGapData, recommendationsData)}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* AI Plan Display */}
          {aiActionPlan && !isLoadingPlan && !planError && (
            <>
              {/* AI Plan Overview */}
              <Card padding="lg" className="mb-6 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">AI Plan Summary</h3>
                    <p className="text-sm text-[var(--muted)] mb-3">{aiActionPlan.overview.reasoning_summary}</p>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        🎯 Focus: {aiActionPlan.overview.primary_focus_skill}
                      </span>
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        📋 {aiActionPlan.overview.total_tasks} Tasks
                      </span>
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        ⏱️ ~{aiActionPlan.overview.estimated_total_hours} Hours Total
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] italic bg-[var(--secondary)]/50 p-2 rounded">
                      ⚠️ {aiActionPlan.confidence_note}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Overall Progress Card */}
              <Card padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--foreground)]">Overall Progress</h3>
                  <span className="text-sm text-[var(--muted)]">
                    {completedTasks} of {totalTasks} tasks completed
                  </span>
                </div>
                <ProgressBar
                  value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
                  color="primary"
                  size="lg"
                  showValue={false}
                />
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {aiActionPlan.weeks.map((week, idx) => (
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

              {/* Weekly Tasks - AI Generated */}
              <div className="space-y-6">
                {aiActionPlan.weeks.map((week, weekIndex) => (
                  <Card key={week.week_number} padding="none" className="overflow-hidden">
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
                              week.week_number
                            )}
                          </span>
                          <div>
                            <h3 className="font-semibold text-[var(--foreground)]">Week {week.week_number}</h3>
                            <p className="text-sm text-[var(--muted)]">{week.theme}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-[var(--muted)]">
                          {week.tasks.filter(t => t.completed).length}/{week.tasks.length}
                        </span>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="p-4 space-y-3">
                      {week.tasks.map((task) => (
                        <div
                          key={task.task_id}
                          className={`p-4 rounded-xl border-l-4 transition-all ${
                            task.completed
                              ? "bg-[var(--success)]/5 border-l-[var(--success)]"
                              : `bg-[var(--secondary)]/30 hover:bg-[var(--secondary)]/50 ${getPriorityColor(task.difficulty)}`
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <label className="flex items-start gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={task.completed || false}
                                onChange={() => toggleAiTask(weekIndex, task.task_id)}
                                className="mt-1 w-5 h-5 rounded border-2 border-[var(--primary)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <span className={`text-sm font-medium ${
                                    task.completed
                                      ? "text-[var(--muted)] line-through"
                                      : "text-[var(--foreground)]"
                                  }`}>
                                    {task.title}
                                  </span>
                                  {!task.completed && (
                                    <Badge 
                                      variant={task.difficulty === "high" ? "error" : task.difficulty === "medium" ? "warning" : "default"} 
                                      size="sm"
                                    >
                                      {task.difficulty}
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Task Description */}
                                <p className="text-xs text-[var(--muted)] mb-2">{task.description}</p>
                                
                                {/* Task Details */}
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                  <span className="inline-flex items-center gap-1 text-[var(--success)]">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    +{task.expected_skill_gain}% {task.related_skill}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[var(--muted)]">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    ~{task.estimated_time_hours}h
                                  </span>
                                  <span className="text-[var(--muted)]">
                                    📋 {task.evidence_source}
                                  </span>
                                </div>
                                
                                {/* AI Reasoning - Collapsible */}
                                <details className="mt-2">
                                  <summary className="text-xs text-[var(--primary)] cursor-pointer hover:underline">
                                    Why this task?
                                  </summary>
                                  <p className="text-xs text-[var(--muted)] mt-1 pl-2 border-l-2 border-[var(--primary)]/30">
                                    {task.reasoning}
                                  </p>
                                </details>
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Difficulty Legend */}
              <div className="mt-6 p-4 bg-[var(--secondary)]/50 rounded-xl">
                <p className="text-sm font-medium text-[var(--foreground)] mb-2">Task Difficulty:</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded bg-[var(--error)]" />
                    <span className="text-sm text-[var(--muted)]">High - Challenging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded bg-[var(--warning)]" />
                    <span className="text-sm text-[var(--muted)]">Medium - Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded bg-[var(--muted)]" />
                    <span className="text-sm text-[var(--muted)]">Low - Beginner-friendly</span>
                  </div>
                </div>
              </div>
            </>
          )}
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
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">AI Summary & Next Steps</h3>
                
                {/* Dynamic content based on available data */}
                {analysisData?.aiAnalysis && skillGapData ? (
                  <>
                    <p className="text-sm text-[var(--muted)] mb-4">
                      {(() => {
                        // Get top skills (highest confidence)
                        const skillScores = Object.entries(analysisData.aiAnalysis.skill_signals)
                          .map(([key, signal]) => ({
                            name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                            score: Math.round(signal.confidence * 100)
                          }))
                          .sort((a, b) => b.score - a.score);
                        
                        const topSkills = skillScores.slice(0, 2);
                        
                        // Get priority gap skill
                        const primaryGap = skillGapData.priority_skills[0] || 
                          (skillGapData.skill_gaps[0]?.skill) || 
                          "skill development";
                        
                        // Calculate predicted improvement
                        const totalGapImprovement = skillGapData.skill_gaps.reduce((sum, gap) => 
                          sum + (gap.expected_level_after - gap.current_level), 0);
                        const avgImprovement = skillGapData.skill_gaps.length > 0 
                          ? Math.round(totalGapImprovement / skillGapData.skill_gaps.length) 
                          : 10;
                        
                        return (
                          <>
                            Based on your profile, you have strong {topSkills[0]?.name.toLowerCase()} ({topSkills[0]?.score}%)
                            {topSkills[1] && ` and ${topSkills[1].name.toLowerCase()} (${topSkills[1].score}%)`}. 
                            Your biggest opportunity for growth is in {primaryGap.toLowerCase()}, which is crucial for your stated goals. 
                            Following this 30-day plan consistently, our AI predicts you can improve your overall skill score by{' '}
                            <span className="font-semibold text-[var(--success)]">+{avgImprovement}-{avgImprovement + 5}%</span>
                            {skillGapData.skill_gaps[0] && (
                              <> and close your {skillGapData.skill_gaps[0].skill.toLowerCase()} gap by{' '}
                              <span className="font-semibold text-[var(--success)]">
                                {skillGapData.skill_gaps[0].expected_level_after - skillGapData.skill_gaps[0].current_level}%
                              </span></>
                            )}.
                          </>
                        );
                      })()}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        🎯 Focus: {skillGapData.priority_skills[0] || aiActionPlan?.overview.primary_focus_skill || "Skill Development"}
                      </span>
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        ⏱️ Timeline: 30 days
                      </span>
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        📈 Predicted Growth: +{(() => {
                          const avgImprovement = skillGapData.skill_gaps.length > 0
                            ? Math.round(skillGapData.skill_gaps.reduce((sum, gap) => 
                                sum + (gap.expected_level_after - gap.current_level), 0) / skillGapData.skill_gaps.length)
                            : 10;
                          return `${avgImprovement}-${avgImprovement + 5}%`;
                        })()}
                      </span>
                      {aiActionPlan && (
                        <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                          📋 {aiActionPlan.overview.total_tasks} Tasks Planned
                        </span>
                      )}
                    </div>
                  </>
                ) : aiActionPlan ? (
                  // Fallback if we have plan but no skill gap data
                  <>
                    <p className="text-sm text-[var(--muted)] mb-4">
                      {aiActionPlan.overview.reasoning_summary}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        🎯 Focus: {aiActionPlan.overview.primary_focus_skill}
                      </span>
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        ⏱️ Timeline: 30 days
                      </span>
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        📋 {aiActionPlan.overview.total_tasks} Tasks Planned
                      </span>
                      <span className="text-xs px-3 py-1 bg-white rounded-full text-[var(--foreground)]">
                        ⏱️ ~{aiActionPlan.overview.estimated_total_hours}h Total
                      </span>
                    </div>
                  </>
                ) : (
                  // Loading/waiting state
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[var(--muted)]">
                      Generating your personalized summary based on analysis results...
                    </p>
                  </div>
                )}
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
          <Button 
            size="lg" 
            onClick={handleGeneratePDF}
            disabled={isDownloading || (!analysisData && !skillGapData && !recommendationsData)}
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
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
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
