"use client";

import {
  VALIDATION_METRICS,
  INTAKE_HISTORY,
  SKILL_GAP_HISTORY,
  RECOMMENDATIONS_HISTORY,
  COMBINED_METRICS_JSON,
} from "./data";

import {
  Accordion,
  TestHistoryTable,
  MetricsCard,
  MetricRow,
} from "./components";

// =============================================================================
// VALIDATION & TESTING RESULTS PAGE
// =============================================================================
// PURPOSE: Static, read-only page documenting testing results for judges
// This page does NOT trigger API calls or require user input
// =============================================================================

export default function ValidationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-xs font-medium text-slate-600 mb-4">
            <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
            Internal Validation • Read-Only • No Live Testing
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            SkillBridge AI — Testing &amp; Validation Results
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This page documents internal validation testing conducted to evaluate accuracy,
            hallucination prevention, and evidence alignment of SkillBridge AI.
          </p>
        </header>

        {/* Testing Methodology */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-gray-400">📋</span>
            Testing Methodology
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Tests were conducted using representative student profiles across grades 9–12.
            </p>
            <div>
              <p className="font-medium text-gray-700 mb-2">Each profile passed through:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Intake Analysis</li>
                <li>Skill Gap Analysis</li>
                <li>Personalized Recommendations</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">Outputs were evaluated for:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Evidence alignment</li>
                <li>Structural validity (JSON schema enforcement via Zod)</li>
                <li>Hallucination detection</li>
              </ul>
            </div>
            <p>
              Testing was performed using an internal playground during development.
            </p>
            <p className="text-gray-500 italic">
              This page presents static results to ensure reproducibility for judges.
            </p>
          </div>
        </section>

        {/* Validation Metrics Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-gray-400">📊</span>
            Validation Metrics Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Intake Analysis Card */}
            <MetricsCard icon="🔍" title="Intake Analysis">
              <MetricRow label="Profiles Tested" value={VALIDATION_METRICS.intake.totalProfilesTested} />
              <MetricRow label="Valid Outputs" value={VALIDATION_METRICS.intake.validOutputCount} color="green" />
              <MetricRow label="Invalid Outputs" value={VALIDATION_METRICS.intake.invalidOutputCount} color="green" />
              <MetricRow label="Hallucinations" value={VALIDATION_METRICS.intake.hallucinationCount} color="green" />
              <MetricRow 
                label="Alignment Rate" 
                value={`${VALIDATION_METRICS.intake.alignmentRatePercent}%`} 
                color="green" 
                isBold 
                hasBorder 
              />
            </MetricsCard>

            {/* Skill Gap Analysis Card */}
            <MetricsCard icon="📊" title="Skill Gap Analysis">
              <MetricRow label="Tests Run" value={VALIDATION_METRICS.skillGap.testsRun} />
              <MetricRow label="Valid Outputs" value={VALIDATION_METRICS.skillGap.validOutputs} color="green" />
              <MetricRow label="Invalid Outputs" value={VALIDATION_METRICS.skillGap.invalidOutputs} color="red" />
              <MetricRow label="With Warnings" value={VALIDATION_METRICS.skillGap.withWarnings} />
            </MetricsCard>

            {/* Recommendations Card */}
            <MetricsCard icon="💡" title="Recommendations">
              <MetricRow label="Tests Run" value={VALIDATION_METRICS.recommendations.testsRun} />
              <MetricRow label="Valid Outputs" value={VALIDATION_METRICS.recommendations.validOutputs} color="green" />
              <MetricRow label="Invalid Outputs" value={VALIDATION_METRICS.recommendations.invalidOutputs} color="green" />
              <MetricRow label="With Warnings" value={VALIDATION_METRICS.recommendations.withWarnings} />
            </MetricsCard>
          </div>
        </section>

        {/* Combined Metrics JSON */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-gray-400">📦</span>
            Combined Metrics (Raw Data)
          </h2>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {COMBINED_METRICS_JSON}
          </pre>
        </section>

        {/* Testing History */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-gray-400">📜</span>
            Testing History
          </h2>
          <div className="space-y-3">
            <Accordion title={`🔍 Intake Analysis History (${INTAKE_HISTORY.length} tests)`}>
              <TestHistoryTable data={INTAKE_HISTORY} />
            </Accordion>
            <Accordion title={`📊 Skill Gap Analysis History (${SKILL_GAP_HISTORY.length} tests)`}>
              <TestHistoryTable data={SKILL_GAP_HISTORY} />
            </Accordion>
            <Accordion title={`💡 Recommendations History (${RECOMMENDATIONS_HISTORY.length} tests)`}>
              <TestHistoryTable data={RECOMMENDATIONS_HISTORY} />
            </Accordion>
          </div>
        </section>

        {/* Playground Disclaimer */}
        <section className="bg-slate-100 border border-slate-200 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Internal Testing Only</p>
              <p className="text-sm text-slate-600">
                This validation page documents completed test results. The internal testing
                playground used during development does not persist logs and is not intended
                for judge interaction.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            These validation results demonstrate that SkillBridge AI produces reliable,
            interpretable, and evidence-based outputs suitable for student self-assessment
            and guidance.
          </p>
          <p className="text-gray-400 text-xs mt-4">
            SkillBridge AI • Presidential AI Challenge Submission • January 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
