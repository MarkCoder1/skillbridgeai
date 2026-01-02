"use client";

import React, { useState } from "react";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";

// =============================================================================
// TYPES
// =============================================================================

export interface SkillAlignment {
  skill: string;
  expected_improvement: number;
}

export interface BaseRecommendation {
  type: "course" | "project" | "competition";
  title: string;
  platform_or_provider: string;
  match_score: number;
  match_level?: "high" | "medium" | "low";
  skill_alignment: SkillAlignment[];
  duration_weeks: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  reasoning: string;
}

export interface CourseRecommendation extends BaseRecommendation {
  type: "course";
  format?: "online" | "in-person" | "hybrid";
}

export interface ProjectRecommendation extends BaseRecommendation {
  type: "project";
  project_type?: "solo" | "team" | "open-source";
  skills_used?: string[];
}

export interface CompetitionRecommendation extends BaseRecommendation {
  type: "competition";
  deadline?: string;
  prize?: string;
}

export type Recommendation = 
  | CourseRecommendation 
  | ProjectRecommendation 
  | CompetitionRecommendation;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getMatchLevel(score: number): "high" | "medium" | "low" {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function getMatchLevelColor(level: "high" | "medium" | "low") {
  switch (level) {
    case "high": return "success";
    case "medium": return "warning";
    case "low": return "error";
  }
}

function getMatchLevelBgColor(level: "high" | "medium" | "low") {
  switch (level) {
    case "high": return "bg-[var(--success)]";
    case "medium": return "bg-[var(--warning)]";
    case "low": return "bg-[var(--error)]";
  }
}

function getMatchLevelTextColor(level: "high" | "medium" | "low") {
  switch (level) {
    case "high": return "text-[var(--success)]";
    case "medium": return "text-[var(--warning)]";
    case "low": return "text-[var(--error)]";
  }
}

function getLevelColor(level: "Beginner" | "Intermediate" | "Advanced") {
  switch (level) {
    case "Beginner": return "success";
    case "Intermediate": return "warning";
    case "Advanced": return "error";
  }
}

function getTypeIcon(type: "course" | "project" | "competition") {
  switch (type) {
    case "course":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "project":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case "competition":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
  }
}

function formatSkillName(skill: string): string {
  return skill
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// =============================================================================
// SKILL IMPROVEMENT BAR COMPONENT
// =============================================================================

interface SkillImprovementBarProps {
  skill: string;
  improvement: number;
  compact?: boolean;
}

function SkillImprovementBar({ skill, improvement, compact = false }: SkillImprovementBarProps) {
  const getImprovementColor = () => {
    if (improvement >= 15) return "var(--success)";
    if (improvement >= 8) return "var(--warning)";
    return "var(--primary)";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)] min-w-[80px]">{formatSkillName(skill)}</span>
        <div className="flex-1 h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(improvement * 5, 100)}%`,
              backgroundColor: getImprovementColor()
            }}
          />
        </div>
        <span className="text-xs font-semibold" style={{ color: getImprovementColor() }}>
          +{improvement}%
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 bg-[var(--secondary)]/50 rounded-lg">
      <span className="text-sm text-[var(--foreground)]">{formatSkillName(skill)}</span>
      <Badge 
        variant={improvement >= 15 ? "success" : improvement >= 8 ? "warning" : "default"} 
        size="sm"
      >
        +{improvement}%
      </Badge>
    </div>
  );
}

// =============================================================================
// RECOMMENDATION CARD COMPONENT
// =============================================================================

interface RecommendationCardProps {
  recommendation: Recommendation;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function RecommendationCard({ 
  recommendation, 
  expanded = false,
  onToggleExpand 
}: RecommendationCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const matchLevel = recommendation.match_level || getMatchLevel(recommendation.match_score);

  return (
    <Card 
      className={`transition-all duration-300 ${
        expanded ? 'ring-2 ring-[var(--primary)] shadow-lg' : ''
      }`}
      hover
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Type Icon */}
          <div className={`p-2 rounded-lg ${getMatchLevelBgColor(matchLevel)}/10 ${getMatchLevelTextColor(matchLevel)}`}>
            {getTypeIcon(recommendation.type)}
          </div>
          
          {/* Title & Provider */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[var(--foreground)] text-lg leading-tight">
              {recommendation.title}
            </h4>
            <p className="text-sm text-[var(--muted)] mt-1">
              {recommendation.platform_or_provider}
            </p>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="flex flex-col items-end gap-1">
          <Badge variant={getMatchLevelColor(matchLevel)} size="md" className="text-base px-4 py-1.5">
            {recommendation.match_score}% Match
          </Badge>
          <span className="text-xs text-[var(--muted)] capitalize">
            {matchLevel} fit
          </span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge variant={getLevelColor(recommendation.level)} size="sm">
          {recommendation.level}
        </Badge>
        <Badge variant="default" size="sm">
          {recommendation.duration_weeks} week{recommendation.duration_weeks > 1 ? 's' : ''}
        </Badge>
        <Badge variant="default" size="sm" className="capitalize">
          {recommendation.type}
        </Badge>
        
        {/* Type-specific badges */}
        {recommendation.type === "course" && recommendation.format && (
          <Badge variant="default" size="sm" className="capitalize">
            {recommendation.format}
          </Badge>
        )}
        {recommendation.type === "project" && recommendation.project_type && (
          <Badge variant="default" size="sm" className="capitalize">
            {recommendation.project_type}
          </Badge>
        )}
        {recommendation.type === "competition" && recommendation.prize && (
          <Badge variant="warning" size="sm">🏆 {recommendation.prize}</Badge>
        )}
      </div>

      {/* Skill Improvements */}
      <div className="mt-4">
        <h5 className="text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Expected Skill Improvements
        </h5>
        <div className="space-y-2">
          {recommendation.skill_alignment.slice(0, expanded ? undefined : 3).map((alignment, index) => (
            <SkillImprovementBar 
              key={index} 
              skill={alignment.skill} 
              improvement={alignment.expected_improvement}
              compact
            />
          ))}
          {!expanded && recommendation.skill_alignment.length > 3 && (
            <button 
              onClick={onToggleExpand}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              +{recommendation.skill_alignment.length - 3} more skills
            </button>
          )}
        </div>
      </div>

      {/* Type-specific details */}
      {recommendation.type === "competition" && recommendation.deadline && (
        <div className="mt-4 p-3 bg-[var(--warning)]/10 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-[var(--foreground)]">
            <strong>Deadline:</strong> {recommendation.deadline}
          </span>
        </div>
      )}

      {recommendation.type === "project" && recommendation.skills_used && recommendation.skills_used.length > 0 && (
        <div className="mt-4">
          <span className="text-xs text-[var(--muted)]">Skills used:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {recommendation.skills_used.map((skill, index) => (
              <span key={index} className="text-xs px-2 py-0.5 bg-[var(--secondary)] rounded-full text-[var(--foreground)]">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Reasoning Toggle */}
      <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            showReasoning 
              ? "bg-[var(--primary)] text-white" 
              : "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            View AI Reasoning
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${showReasoning ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showReasoning && (
          <div className="mt-3 p-4 bg-[var(--primary)]/5 rounded-lg border border-[var(--primary)]/20">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide">
                  Why This Fits You
                </span>
                <p className="text-sm text-[var(--foreground)] mt-1 leading-relaxed">
                  {recommendation.reasoning}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// =============================================================================
// RECOMMENDATION GRID COMPONENT
// =============================================================================

interface RecommendationGridProps {
  recommendations: Recommendation[];
  title: string;
  icon?: React.ReactNode;
  emptyMessage?: string;
}

export function RecommendationGrid({ 
  recommendations, 
  title, 
  icon,
  emptyMessage = "No recommendations available"
}: RecommendationGridProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        {icon}
        {title}
        <Badge variant="default" size="sm">{recommendations.length}</Badge>
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={`${rec.type}-${index}`} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default RecommendationCard;
