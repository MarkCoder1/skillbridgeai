"use client";

import { useState, useCallback } from "react";
import { Button, Card, Badge, ProgressBar } from "@/components/ui";
import { SAMPLE_PROFILES } from "../testing-playground/sampleProfiles";
import type {
  PerturbationTestResult,
  VariantComparisonResult,
  PerturbationConfig,
  PerturbationType,
} from "./types";

// =============================================================================
// PERTURBATION & ROBUSTNESS TESTING PAGE
// =============================================================================
// PURPOSE: Internal page for running controlled perturbation tests
// and generating quantitative metrics for competition PDF validation
// =============================================================================

// Type badges
const VARIANT_BADGES: Record<PerturbationType, { label: string; color: string }> = {
  original: { label: "Original", color: "bg-gray-500" },
  injection: { label: "Injection (+)", color: "bg-green-500" },
  removal: { label: "Removal (-)", color: "bg-red-500" },
  rephrased: { label: "Rephrased (~)", color: "bg-blue-500" },
};

export default function PerturbationTestingPage() {
  // Profile selection state
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(
    new Set(SAMPLE_PROFILES.slice(0, 3).map((p) => p.name))
  );

  // Test configuration
  const [config, setConfig] = useState<PerturbationConfig>({
    selectedProfileIds: [],
    runInjection: true,
    runRemoval: true,
    runRephrasing: true,
    skipActionPlan: false,
  });

  // Test execution state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: "" });
  const [testResult, setTestResult] = useState<PerturbationTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"setup" | "results" | "json">("setup");

  // Toggle profile selection
  const toggleProfile = useCallback((profileName: string) => {
    setSelectedProfiles((prev) => {
      const next = new Set(prev);
      if (next.has(profileName)) {
        next.delete(profileName);
      } else {
        next.add(profileName);
      }
      return next;
    });
  }, []);

  // Select all profiles
  const selectAllProfiles = useCallback(() => {
    setSelectedProfiles(new Set(SAMPLE_PROFILES.map((p) => p.name)));
  }, []);

  // Deselect all profiles
  const deselectAllProfiles = useCallback(() => {
    setSelectedProfiles(new Set());
  }, []);

  // Run perturbation test
  const runTest = useCallback(async () => {
    if (selectedProfiles.size === 0) {
      setError("Please select at least one profile to test");
      return;
    }

    setIsRunning(true);
    setError(null);
    setTestResult(null);
    setActiveTab("results");

    // Calculate total runs
    const variantCount = 1 + 
      (config.runInjection ? 1 : 0) + 
      (config.runRemoval ? 1 : 0) + 
      (config.runRephrasing ? 1 : 0);
    const totalRuns = selectedProfiles.size * variantCount;

    setProgress({ 
      current: 0, 
      total: totalRuns, 
      message: "Starting perturbation tests..." 
    });

    try {
      // Build profiles array
      const profiles = SAMPLE_PROFILES
        .filter((p) => selectedProfiles.has(p.name))
        .map((p, index) => ({
          id: `profile-${index}`,
          name: p.name,
          profile: p.profile,
        }));

      // Run the test
      const response = await fetch("/api/perturbation-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profiles,
          config: {
            ...config,
            selectedProfileIds: profiles.map((p) => p.id),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: PerturbationTestResult = await response.json();
      setTestResult(result);
      setProgress({ current: totalRuns, total: totalRuns, message: "Complete!" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsRunning(false);
    }
  }, [selectedProfiles, config]);

  // Toggle result expansion
  const toggleResultExpansion = useCallback((resultId: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(resultId)) {
        next.delete(resultId);
      } else {
        next.add(resultId);
      }
      return next;
    });
  }, []);

  // Copy JSON to clipboard
  const copyJsonToClipboard = useCallback(() => {
    if (testResult) {
      navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
    }
  }, [testResult]);

  // Render result row
  const renderResultRow = (result: VariantComparisonResult, index: number) => {
    const resultId = `${result.profile_id}-${result.variant}-${index}`;
    const isExpanded = expandedResults.has(resultId);
    const badge = VARIANT_BADGES[result.variant];

    return (
      <div key={resultId} className="border-b border-gray-700 last:border-b-0">
        {/* Summary Row */}
        <div
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
          onClick={() => toggleResultExpansion(resultId)}
        >
          <div className="flex-shrink-0 w-6">
            <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">{result.profile_id}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${badge.color} text-white`}>
                {badge.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge
              label="Attribution"
              status={result.skill_attribution_consistency === "consistent"}
            />
            <StatusBadge
              label="Hallucination"
              status={!result.hallucinations_detected}
              invertColors
            />
            <StatusBadge
              label="Stability"
              status={result.recommendation_stability === "stable"}
            />
            <StatusBadge
              label="Sensitivity"
              status={result.action_plan_sensitivity === "appropriate"}
            />
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 bg-gray-800/30 space-y-4">
            {/* Skill Attribution Details */}
            <DetailSection title="Skill Attribution Consistency">
              <p className="text-sm text-gray-300">
                {result.skill_attribution_details.reasoning}
              </p>
              {result.skill_attribution_details.skillsChanged.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-400">Skills Changed: </span>
                  <span className="text-sm text-yellow-400">
                    {result.skill_attribution_details.skillsChanged.join(", ")}
                  </span>
                </div>
              )}
              {result.skill_attribution_details.unexpectedChanges.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-gray-400">Unexpected: </span>
                  <span className="text-sm text-red-400">
                    {result.skill_attribution_details.unexpectedChanges.join(", ")}
                  </span>
                </div>
              )}
            </DetailSection>

            {/* Hallucination Details */}
            <DetailSection title="Hallucination Detection">
              <p className="text-sm text-gray-300">
                {result.hallucination_details.reasoning}
              </p>
              {result.hallucination_details.untracedSkills.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-400">Untraced Skills: </span>
                  <span className="text-sm text-red-400">
                    {result.hallucination_details.untracedSkills.slice(0, 3).join("; ")}
                    {result.hallucination_details.untracedSkills.length > 3 && "..."}
                  </span>
                </div>
              )}
            </DetailSection>

            {/* Recommendation Stability Details */}
            <DetailSection title="Recommendation Stability">
              <p className="text-sm text-gray-300">
                {result.recommendation_stability_details.reasoning}
              </p>
              {result.recommendation_stability_details.categoriesChanged.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-400">Categories Changed: </span>
                  <span className="text-sm text-yellow-400">
                    {result.recommendation_stability_details.categoriesChanged.join(", ")}
                  </span>
                </div>
              )}
            </DetailSection>

            {/* Action Plan Sensitivity Details */}
            <DetailSection title="Action Plan Sensitivity">
              <p className="text-sm text-gray-300">
                {result.action_plan_sensitivity_details.reasoning}
              </p>
              <div className="mt-2">
                <span className="text-xs text-gray-400">Proportion: </span>
                <span className="text-sm text-blue-400">
                  {result.action_plan_sensitivity_details.planChangesProportion}
                </span>
              </div>
              {result.action_plan_sensitivity_details.unrelatedStepsAdded.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-gray-400">Unrelated Steps: </span>
                  <span className="text-sm text-red-400">
                    {result.action_plan_sensitivity_details.unrelatedStepsAdded.join(", ")}
                  </span>
                </div>
              )}
            </DetailSection>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Perturbation & Robustness Testing
          </h1>
          <p className="text-gray-400 mt-2">
            Evaluate evidence sensitivity, hallucination resistance, and recommendation stability
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          {[
            { id: "setup", label: "Test Setup" },
            { id: "results", label: "Results" },
            { id: "json", label: "JSON Output" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Setup Tab */}
        {activeTab === "setup" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Selection */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select Profiles</h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllProfiles}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Select All
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    onClick={deselectAllProfiles}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {SAMPLE_PROFILES.map((profile) => (
                  <label
                    key={profile.name}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProfiles.has(profile.name)
                        ? "bg-purple-900/30 border border-purple-500"
                        : "bg-gray-700/50 hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProfiles.has(profile.name)}
                      onChange={() => toggleProfile(profile.name)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-medium">{profile.name}</span>
                      <p className="text-xs text-gray-400 mt-1">
                        Grade {profile.profile.grade} • {profile.profile.time_availability_hours_per_week}h/week
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                {selectedProfiles.size} profile(s) selected
              </div>
            </Card>

            {/* Test Configuration */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-medium mb-3">Perturbation Types</h3>
                  <div className="space-y-2">
                    <ConfigCheckbox
                      label="Evidence Injection (+)"
                      description="Add 1-2 relevant evidence items"
                      checked={config.runInjection}
                      onChange={(v) => setConfig((c) => ({ ...c, runInjection: v }))}
                    />
                    <ConfigCheckbox
                      label="Evidence Removal (-)"
                      description="Remove 1 key evidence item"
                      checked={config.runRemoval}
                      onChange={(v) => setConfig((c) => ({ ...c, runRemoval: v }))}
                    />
                    <ConfigCheckbox
                      label="Neutral Rephrasing (~)"
                      description="Rephrase without changing meaning"
                      checked={config.runRephrasing}
                      onChange={(v) => setConfig((c) => ({ ...c, runRephrasing: v }))}
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-medium mb-3">Performance Options</h3>
                  <ConfigCheckbox
                    label="Skip Action Plan Generation"
                    description="Faster testing, but no action plan sensitivity metrics"
                    checked={config.skipActionPlan}
                    onChange={(v) => setConfig((c) => ({ ...c, skipActionPlan: v }))}
                  />
                </div>

                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <h3 className="font-medium mb-2">Estimated Runs</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {selectedProfiles.size * (1 + 
                      (config.runInjection ? 1 : 0) + 
                      (config.runRemoval ? 1 : 0) + 
                      (config.runRephrasing ? 1 : 0))}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedProfiles.size} profiles × {1 + 
                      (config.runInjection ? 1 : 0) + 
                      (config.runRemoval ? 1 : 0) + 
                      (config.runRephrasing ? 1 : 0)} variants each
                  </p>
                </div>

                <Button
                  onClick={runTest}
                  disabled={isRunning || selectedProfiles.size === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {isRunning ? "Running Tests..." : "Run Perturbation Test"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {/* Progress */}
            {isRunning && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{progress.message}</span>
                    <span className="text-purple-400">
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="bg-red-900/20 border-red-500 p-6">
                <h3 className="text-red-400 font-medium mb-2">Error</h3>
                <p className="text-gray-300">{error}</p>
              </Card>
            )}

            {/* Summary Metrics */}
            {testResult && (
              <>
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <h2 className="text-xl font-semibold mb-4">Summary Metrics</h2>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                      title="Skill Attribution Consistency"
                      value={`${testResult.metrics.skillAttributionConsistencyRate}%`}
                      subtext={`${testResult.summary.consistent_attribution_count}/${testResult.total_runs} runs`}
                      color="purple"
                    />
                    <MetricCard
                      title="Hallucination Rate"
                      value={`${testResult.metrics.hallucinationRate}%`}
                      subtext={`${testResult.summary.hallucination_count} detected`}
                      color={testResult.metrics.hallucinationRate > 10 ? "red" : "green"}
                      invert
                    />
                    <MetricCard
                      title="Recommendation Stability"
                      value={`${testResult.metrics.recommendationStabilityRate}%`}
                      subtext={`${testResult.summary.stable_recommendations_count}/${testResult.total_runs} stable`}
                      color="blue"
                    />
                    <MetricCard
                      title="Action Plan Appropriateness"
                      value={`${testResult.metrics.actionPlanAppropriatenessRate}%`}
                      subtext={`${testResult.summary.appropriate_action_plans_count}/${testResult.total_runs} appropriate`}
                      color="pink"
                    />
                  </div>

                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Profiles Tested: <strong className="text-white">{testResult.profiles_tested}</strong></span>
                    <span>Total Runs: <strong className="text-white">{testResult.total_runs}</strong></span>
                    <span>Execution Time: <strong className="text-white">{(testResult.execution_time_total_ms / 1000).toFixed(1)}s</strong></span>
                  </div>
                </Card>

                {/* Results Table */}
                <Card className="bg-gray-800 border-gray-700">
                  <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold">Detailed Results</h2>
                  </div>
                  <div className="divide-y divide-gray-700">
                    {testResult.results.map((result, index) => renderResultRow(result, index))}
                  </div>
                </Card>
              </>
            )}

            {!isRunning && !testResult && !error && (
              <Card className="bg-gray-800 border-gray-700 p-12 text-center">
                <p className="text-gray-400">
                  Configure and run a perturbation test to see results here.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* JSON Tab */}
        {activeTab === "json" && (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">JSON Output</h2>
              <Button
                onClick={copyJsonToClipboard}
                disabled={!testResult}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                Copy JSON
              </Button>
            </div>
            
            {testResult ? (
              <pre className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-[600px] text-sm text-gray-300">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            ) : (
              <div className="text-center py-12 text-gray-400">
                Run a perturbation test to generate JSON output.
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StatusBadge({
  label,
  status,
  invertColors = false,
}: {
  label: string;
  status: boolean;
  invertColors?: boolean;
}) {
  const colorClass = status
    ? invertColors
      ? "bg-green-900/50 text-green-400 border-green-500/30"
      : "bg-green-900/50 text-green-400 border-green-500/30"
    : "bg-red-900/50 text-red-400 border-red-500/30";

  return (
    <span className={`text-xs px-2 py-1 rounded border ${colorClass}`}>
      {label}: {status ? "✓" : "✗"}
    </span>
  );
}

function ConfigCheckbox({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 mt-1 text-purple-600 rounded focus:ring-purple-500"
      />
      <div>
        <span className="font-medium text-white">{label}</span>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </label>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-3 bg-gray-900/50 rounded-lg">
      <h4 className="text-sm font-medium text-purple-400 mb-2">{title}</h4>
      {children}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtext,
  color,
  invert = false,
}: {
  title: string;
  value: string;
  subtext: string;
  color: "purple" | "blue" | "green" | "red" | "pink";
  invert?: boolean;
}) {
  const colorClasses = {
    purple: "from-purple-600/20 to-purple-900/20 border-purple-500/30",
    blue: "from-blue-600/20 to-blue-900/20 border-blue-500/30",
    green: "from-green-600/20 to-green-900/20 border-green-500/30",
    red: "from-red-600/20 to-red-900/20 border-red-500/30",
    pink: "from-pink-600/20 to-pink-900/20 border-pink-500/30",
  };

  const textColors = {
    purple: "text-purple-400",
    blue: "text-blue-400",
    green: "text-green-400",
    red: "text-red-400",
    pink: "text-pink-400",
  };

  return (
    <div className={`p-4 rounded-lg border bg-gradient-to-br ${colorClasses[color]}`}>
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    </div>
  );
}
