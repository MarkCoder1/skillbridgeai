# SkillBridge AI - Responsible AI Improvements

## Overview

This document summarizes the responsible AI calibration improvements implemented to make SkillBridge AI more realistic, defensible, and aligned with responsible AI practices.

## Changes Implemented

### 1️⃣ Inferred Skill Evidence (Problem Solving Fix)

**Location:** `app/api/lib/responsible-ai.ts`, `app/api/analyze-student-intake/route.ts`

**Problem:** Problem Solving was often scored as "No Evidence / ~10%" even when strong implicit evidence existed (e.g., teaching coding, winning app competitions).

**Solution:**
- Implemented derived evidence rules that detect implicit problem-solving signals
- If a student has **any two of the following**, baseline problem-solving evidence is inferred:
  - Technical teaching or mentoring (keywords: taught, mentor, tutored, coached, etc.)
  - Competitive awards (keywords: hackathon, won, award, competition, etc.)
  - Complex project-based activities (keywords: app, robot, research, software, etc.)
- Inferred score range: **40-55%** (not higher to avoid inflation)
- Evidence labeled as `attribution_type: "inferred"` with explicit `inference_sources`
- Includes `inference_justification` explaining why the inference was made

**New Fields Added:**
```typescript
{
  attribution_type: "explicit" | "inferred" | "missing",
  inference_sources?: string[],
  inference_justification?: string
}
```

---

### 2️⃣ Cap Short-Term Skill Growth (Unrealistic Projections Fix)

**Location:** `app/api/lib/responsible-ai.ts`, `app/api/skill-gap-analysis/route.ts`, `app/api/generate-30-day-plan/route.ts`

**Problem:** Skills like Leadership and Self-Management jumped unrealistically (e.g., 20% → 85% in 30 days).

**Solution:**
- Maximum 30-day improvement per skill: **+25%**
- Values beyond this cap are classified as **long-term potential**, not expected 30-day gain
- Caps enforced at both Gap Analysis and Action Plan layers
- Reasoning updated to explain when caps are applied

**Constant:**
```typescript
export const MAX_30_DAY_IMPROVEMENT = 25;
```

---

### 3️⃣ Separate Short-Term vs Long-Term Targets

**Location:** `app/api/lib/responsible-ai.ts`, `app/api/skill-gap-analysis/route.ts`

**Problem:** Goals and expected outcomes were conflated.

**Solution:**
For each skill with a gap, output now includes:
```typescript
{
  current_score: number,         // Current skill level (%)
  expected_30_day_score: number, // Realistic 30-day target (capped)
  long_term_target_score: number // Aspirational goal (uncapped)
}
```

- Only `expected_30_day_score` is used to evaluate plan feasibility
- Long-term targets are clearly labeled as aspirational

---

### 4️⃣ Recommendation Freshness Guardrail

**Location:** `app/api/lib/responsible-ai.ts`, `app/api/personalized-recommendations/route.ts`

**Problem:** Some recommendations referenced outdated or discontinued programs (e.g., Google Code-in).

**Solution:**
- Implemented recommendation validation layer
- Each recommendation checked against known discontinued programs:
  - Google Code-in (discontinued 2020)
  - Facebook University (discontinued 2022)
  - Uber Career Prep (discontinued 2023)
  - Twitter University (discontinued 2022)
- Invalid recommendations replaced with functionally equivalent alternatives
- Replacement logged for audit/debugging

**New Response Fields:**
```typescript
{
  freshness_validation: {
    all_active: boolean,
    replacements: RecommendationValidation[]
  }
}
```

---

### 5️⃣ Explainability Improvements (Transparency)

**Location:** All API routes, `app/results/types.ts`

**Solution:**
For every skill score, the output now explicitly states:
- **Evidence Type:** `explicit` | `inferred` | `missing`
- **Attribution Summary:** Count of skills by type
- **Justification:** For inferred scores, includes explanation of inference logic

Example:
```typescript
{
  attribution_summary: {
    explicit_count: 4,
    inferred_count: 1,
    missing_count: 1,
    skills_by_type: {
      explicit: ["communication", "technical_skills", "creativity", "leadership"],
      inferred: ["problem_solving"],
      missing: ["self_management"]
    }
  }
}
```

---

### 6️⃣ Updated Validation Logic

**Location:** `app/testing-playground/validation.ts`, `app/testing-playground/responsibleAITests.ts`

**New Validation Functions:**
1. `validateGrowthCaps()` - Ensures no skill exceeds +25% improvement in 30 days
2. `validateTargetSeparation()` - Checks for proper short/long-term field separation
3. `validateNoOutdatedRecommendations()` - Detects discontinued programs
4. `validateInferredEvidence()` - Ensures inferred evidence doesn't hallucinate
5. `validateResponsibleAI()` - Comprehensive validation runner

**Test Assertions:**
- Inferred skills don't trigger hallucinations
- Growth caps are never exceeded
- Short-term and long-term targets are correctly separated
- Outdated recommendations never appear in final output

---

## API Version Updates

| API | Old Version | New Version |
|-----|-------------|-------------|
| analyze-student-intake | 1.1 | 1.2 |
| skill-gap-analysis | 1.1 | 1.2 |
| personalized-recommendations | 1.0 | 1.1 |
| generate-30-day-plan | 1.0 | 1.1 |

---

## Files Modified

### New Files
- `app/api/lib/responsible-ai.ts` - Central responsible AI utilities
- `app/testing-playground/responsibleAITests.ts` - Test scenarios and runner

### Modified Files
- `app/api/analyze-student-intake/route.ts` - Inferred evidence, attribution types
- `app/api/skill-gap-analysis/route.ts` - Growth caps, target separation
- `app/api/personalized-recommendations/route.ts` - Freshness validation
- `app/api/generate-30-day-plan/route.ts` - Growth caps on tasks
- `app/testing-playground/validation.ts` - New validation functions
- `app/testing-playground/data.ts` - New constants for validation
- `app/results/types.ts` - New type definitions

---

## Backwards Compatibility

All changes maintain backwards compatibility:
- Original API response fields preserved
- New fields added as extensions
- UI contracts unchanged
- Schema names unchanged

---

## Constraints Met

✅ Did not change existing API contracts  
✅ Did not hardcode values per user  
✅ Did not reduce explainability  
✅ Did not remove conservative behavior  
✅ All outputs include required fields  
✅ Growth caps enforced  
✅ Long-term targets labeled separately  
✅ No discontinued programs in recommendations  
