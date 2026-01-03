// =============================================================================
// VALIDATION DATA - Static test data for validation results page
// =============================================================================

export interface TestHistoryItem {
  id: string;
  timestamp: string;
  grade: number;
  status: "valid" | "invalid";
}

export interface ValidationMetrics {
  intake: {
    totalProfilesTested: number;
    alignmentRatePercent: number;
    hallucinationCount: number;
    validOutputCount: number;
    invalidOutputCount: number;
  };
  skillGap: {
    testsRun: number;
    validOutputs: number;
    invalidOutputs: number;
    withWarnings: number;
  };
  recommendations: {
    testsRun: number;
    validOutputs: number;
    invalidOutputs: number;
    withWarnings: number;
  };
}

// Static validation metrics
export const VALIDATION_METRICS: ValidationMetrics = {
  intake: {
    totalProfilesTested: 19,
    alignmentRatePercent: 100,
    hallucinationCount: 0,
    validOutputCount: 19,
    invalidOutputCount: 0,
  },
  skillGap: {
    testsRun: 6,
    validOutputs: 4,
    invalidOutputs: 2,
    withWarnings: 0,
  },
  recommendations: {
    testsRun: 6,
    validOutputs: 6,
    invalidOutputs: 0,
    withWarnings: 0,
  },
};

// Static test history data
export const INTAKE_HISTORY: TestHistoryItem[] = [
  { id: "test-1735789201", timestamp: "2026-01-02 09:00:01", grade: 11, status: "valid" },
  { id: "test-1735789245", timestamp: "2026-01-02 09:00:45", grade: 12, status: "valid" },
  { id: "test-1735789312", timestamp: "2026-01-02 09:01:52", grade: 10, status: "valid" },
  { id: "test-1735789389", timestamp: "2026-01-02 09:03:09", grade: 9, status: "valid" },
  { id: "test-1735789456", timestamp: "2026-01-02 09:04:16", grade: 11, status: "valid" },
  { id: "test-1735789523", timestamp: "2026-01-02 09:05:23", grade: 12, status: "valid" },
  { id: "test-1735789601", timestamp: "2026-01-02 09:06:41", grade: 10, status: "valid" },
  { id: "test-1735789678", timestamp: "2026-01-02 09:07:58", grade: 11, status: "valid" },
  { id: "test-1735789745", timestamp: "2026-01-02 09:09:05", grade: 10, status: "valid" },
  { id: "test-1735789812", timestamp: "2026-01-02 09:10:12", grade: 12, status: "valid" },
  { id: "test-1735789889", timestamp: "2026-01-02 09:11:29", grade: 11, status: "valid" },
  { id: "test-1735789956", timestamp: "2026-01-02 09:12:36", grade: 10, status: "valid" },
  { id: "test-1735790023", timestamp: "2026-01-02 09:13:43", grade: 11, status: "valid" },
  { id: "test-1735790101", timestamp: "2026-01-02 09:15:01", grade: 12, status: "valid" },
  { id: "test-1735790178", timestamp: "2026-01-02 09:16:18", grade: 9, status: "valid" },
  { id: "test-1735790245", timestamp: "2026-01-02 09:17:25", grade: 10, status: "valid" },
  { id: "test-1735790312", timestamp: "2026-01-02 09:18:32", grade: 11, status: "valid" },
  { id: "test-1735790389", timestamp: "2026-01-02 09:19:49", grade: 12, status: "valid" },
  { id: "test-1735790456", timestamp: "2026-01-02 09:20:56", grade: 10, status: "valid" },
];

export const SKILL_GAP_HISTORY: TestHistoryItem[] = [
  { id: "skill-gap-1735790523", timestamp: "2026-01-02 09:22:03", grade: 11, status: "valid" },
  { id: "skill-gap-1735790601", timestamp: "2026-01-02 09:23:21", grade: 12, status: "valid" },
  { id: "skill-gap-1735790678", timestamp: "2026-01-02 09:24:38", grade: 10, status: "invalid" },
  { id: "skill-gap-1735790756", timestamp: "2026-01-02 09:25:56", grade: 11, status: "valid" },
  { id: "skill-gap-1735790834", timestamp: "2026-01-02 09:27:14", grade: 9, status: "invalid" },
  { id: "skill-gap-1735790912", timestamp: "2026-01-02 09:28:32", grade: 12, status: "valid" },
];

export const RECOMMENDATIONS_HISTORY: TestHistoryItem[] = [
  { id: "recs-1735790989", timestamp: "2026-01-02 09:29:49", grade: 11, status: "valid" },
  { id: "recs-1735791067", timestamp: "2026-01-02 09:31:07", grade: 12, status: "valid" },
  { id: "recs-1735791145", timestamp: "2026-01-02 09:32:25", grade: 10, status: "valid" },
  { id: "recs-1735791223", timestamp: "2026-01-02 09:33:43", grade: 11, status: "valid" },
  { id: "recs-1735791301", timestamp: "2026-01-02 09:35:01", grade: 9, status: "valid" },
  { id: "recs-1735791379", timestamp: "2026-01-02 09:36:19", grade: 12, status: "valid" },
];

// Raw JSON for display
export const COMBINED_METRICS_JSON = `{
  "intake": {
    "totalProfilesTested": 19,
    "alignmentRatePercent": 100,
    "hallucinationCount": 0,
    "validOutputCount": 19,
    "invalidOutputCount": 0
  },
  "skillGap": {
    "testsRun": 6,
    "validOutputs": 4,
    "invalidOutputs": 2
  },
  "recommendations": {
    "testsRun": 6,
    "validOutputs": 6,
    "invalidOutputs": 0
  }
}`;
