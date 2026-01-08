# SkillBridge AI

AI-powered skills analysis for high school students.

---

## Problem

High school students face a gap between their experiences and career readiness:

- **Skills are invisible on transcripts.** Leadership from running a club or problem-solving from debugging code doesn't appear on a GPA or course list.
- **Students can't objectively evaluate their real-world skill levels.** Self-assessment is unreliable, and there's no standardized way to measure soft skills.
- **No clear guidance on what to improve next.** Without knowing where gaps exist, students can't prioritize their development.
- **This creates confusion in college and career decisions.** Students apply to programs or jobs without understanding how their skills align with requirements.

---

## Solution Overview

SkillBridge AI functions as a skills "report card" for students. It analyzes free-text descriptions of activities, achievements, and experiences to produce evidence-based skill assessments across six dimensions: problem solving, communication, technical skills, creativity, leadership, and self-management.

Rather than relying on self-reported ratings, the system extracts concrete evidence from what students write, scores each skill with full reasoning transparency, identifies gaps relative to their goals, and generates a personalized 30-day action plan with specific recommendations.

---

## Technical Architecture

SkillBridge AI uses a multi-stage pipeline where each stage is validated before the next begins. This is not a single-prompt system—each component has a distinct role and validation layer.

**Pipeline stages:**

- **Evidence Extraction (Qwen)** — Analyzes student-written text to identify skill signals with source attribution. Detects both explicit statements and implicit evidence.
- **Skill Scoring and Gap Analysis (Qwen)** — Converts extracted evidence into percentage scores, compares against goal requirements, and calculates realistic improvement timelines.
- **Recommendations and 30-Day Plan (LLaMA)** — Generates personalized course, project, and competition recommendations, then structures them into a week-by-week action plan.

Each API response is schema-validated using Zod before being passed to the next stage or returned to the user.

---

## Responsible AI and Validation

The system implements several guardrails to ensure accurate and fair outputs:

- **Schema validation** — All inputs and outputs are validated against strict TypeScript schemas. Malformed AI responses are rejected.
- **Evidence-only reasoning** — Skill scores are derived only from text the student provides. The AI cannot fabricate achievements or experiences.
- **Growth caps** — Maximum skill improvement is capped at +25% over 30 days to prevent unrealistic projections.
- **Hallucination prevention** — Recommendations are checked against a database of discontinued programs (e.g., Google Code-in) and replaced with active alternatives.
- **Attribution transparency** — Every skill score includes the exact phrases used as evidence and whether the evidence was explicit, inferred, or missing.

---

## Live Demo and Validation

- **Website:** https://skillbridgeai.vercel.app
- **Validation Results:** https://skillbridgeai.vercel.app/validation
- **Visual Walkthrough:** https://skillbridgeai.vercel.app/validation-walkthrough

---

## Source Code

This repository contains the complete implementation of SkillBridge AI. Technical details including API specifications, project structure, and setup instructions are documented in [TECHNICAL_DETAILS.md](./TECHNICAL_DETAILS.md) and [API_REFERENCE.md](./API_REFERENCE.md) for transparency.
