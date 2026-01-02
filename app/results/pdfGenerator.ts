import { jsPDF } from "jspdf";
import type {
  AIAnalysisData,
  SkillGapAnalysis,
  RecommendationsData,
  ActionPlanData,
} from "./types";
import { skillDisplayNames } from "./utils";

interface PDFReportData {
  analysisData: AIAnalysisData | null;
  skillGapData: SkillGapAnalysis | null;
  recommendationsData: RecommendationsData | null;
  aiActionPlan: ActionPlanData | null;
}

/**
 * Generate a comprehensive PDF report of the student's skill analysis
 */
export async function generatePDFReport(data: PDFReportData): Promise<void> {
  const { analysisData, skillGapData, recommendationsData, aiActionPlan } = data;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number = 30) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246); // Primary blue
    doc.text(title, margin, yPos);
    yPos += 8;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
  };

  // Helper function to add text with word wrap
  const addWrappedText = (
    text: string,
    fontSize: number = 10,
    isBold: boolean = false,
    color: [number, number, number] = [51, 51, 51]
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.5;
    checkPageBreak(lines.length * lineHeight + 5);
    doc.text(lines, margin, yPos);
    yPos += lines.length * lineHeight + 3;
  };

  // ===== TITLE PAGE =====
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("SkillBridge AI", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(18);
  doc.setTextColor(51, 51, 51);
  doc.text("Personal Skill Analysis Report", pageWidth / 2, 65, { align: "center" });

  // Student info
  if (analysisData) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Grade: ${analysisData.formData.grade}`, pageWidth / 2, 85, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 95, {
      align: "center",
    });

    if (analysisData.formData.goals.length > 0) {
      doc.setFontSize(10);
      doc.text(`Goals: ${analysisData.formData.goals.join(", ")}`, pageWidth / 2, 110, {
        align: "center",
      });
    }
  }

  yPos = 130;

  // ===== SKILL SNAPSHOT SECTION =====
  if (analysisData?.aiAnalysis?.skill_signals) {
    addSectionHeader("Skill Snapshot");

    const skillSignals = analysisData.aiAnalysis.skill_signals;
    Object.entries(skillSignals).forEach(([skillKey, signal]) => {
      const displayName = skillDisplayNames[skillKey] || skillKey;
      const confidence = Math.round(signal.confidence * 100);
      const evidenceFound = signal.evidence_found ? "Yes" : "No";

      checkPageBreak(25);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 51, 51);
      doc.text(`${displayName}`, margin, yPos);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Confidence: ${confidence}% | Evidence Found: ${evidenceFound}`, margin + 80, yPos);
      yPos += 6;

      if (signal.reasoning) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const reasoningLines = doc.splitTextToSize(signal.reasoning, contentWidth - 10);
        doc.text(reasoningLines, margin + 5, yPos);
        yPos += reasoningLines.length * 4 + 5;
      }
    });
  }

  // ===== SKILL GAP ANALYSIS SECTION =====
  if (skillGapData?.skill_gaps && skillGapData.skill_gaps.length > 0) {
    doc.addPage();
    yPos = margin;
    addSectionHeader("Skill Gap Analysis");

    // Overall summary
    if (skillGapData.overall_summary) {
      addWrappedText(skillGapData.overall_summary, 10, false, [80, 80, 80]);
      yPos += 5;
    }

    // Priority skills
    if (skillGapData.priority_skills.length > 0) {
      addWrappedText(`Priority Skills: ${skillGapData.priority_skills.join(", ")}`, 10, true);
      yPos += 5;
    }

    // Individual skill gaps
    skillGapData.skill_gaps.forEach((gap) => {
      checkPageBreak(45);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(skillDisplayNames[gap.skill] || gap.skill, margin, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 51, 51);
      doc.text(
        `Current: ${gap.current_level}/10 | Goal: ${gap.goal_level}/10 | Gap: ${gap.gap} | Timeline: ${gap.timeline}`,
        margin + 5,
        yPos
      );
      yPos += 5;

      if (gap.why_it_matters) {
        doc.setTextColor(100, 100, 100);
        const lines = doc.splitTextToSize(gap.why_it_matters, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 4 + 3;
      }

      // Action steps
      if (gap.actionable_steps && gap.actionable_steps.length > 0) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Action Steps:", margin + 5, yPos);
        yPos += 4;

        gap.actionable_steps.slice(0, 3).forEach((step, idx) => {
          checkPageBreak(15);
          doc.setFont("helvetica", "normal");
          const stepText = `${idx + 1}. ${step.step} (${step.time_required})`;
          const stepLines = doc.splitTextToSize(stepText, contentWidth - 15);
          doc.text(stepLines, margin + 10, yPos);
          yPos += stepLines.length * 4 + 2;
        });
      }
      yPos += 5;
    });
  }

  // ===== RECOMMENDATIONS SECTION =====
  if (recommendationsData) {
    doc.addPage();
    yPos = margin;
    addSectionHeader("Personalized Recommendations");

    if (recommendationsData.summary) {
      addWrappedText(recommendationsData.summary, 10, false, [80, 80, 80]);
      yPos += 5;
    }

    // Courses (replaced emoji with text)
    if (recommendationsData.courses && recommendationsData.courses.length > 0) {
      checkPageBreak(15);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("[Courses] Recommended Courses", margin, yPos);
      yPos += 8;

      recommendationsData.courses.slice(0, 5).forEach((course) => {
        checkPageBreak(25);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 51, 51);
        doc.text(course.title, margin + 5, yPos);
        yPos += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Provider: ${course.platform_or_provider} | Duration: ${course.duration_weeks} weeks`, margin + 5, yPos);
        yPos += 4;

        if (course.reasoning) {
          doc.setTextColor(100, 100, 100);
          const descLines = doc.splitTextToSize(course.reasoning, contentWidth - 15);
          doc.text(descLines.slice(0, 2), margin + 5, yPos);
          yPos += descLines.slice(0, 2).length * 4 + 3;
        }
        yPos += 3;
      });
    }

    // Projects (replaced emoji with text)
    if (recommendationsData.projects && recommendationsData.projects.length > 0) {
      checkPageBreak(15);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("[Projects] Recommended Projects", margin, yPos);
      yPos += 8;

      recommendationsData.projects.slice(0, 5).forEach((project) => {
        checkPageBreak(25);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 51, 51);
        doc.text(project.title, margin + 5, yPos);
        yPos += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Duration: ${project.duration_weeks} weeks | Level: ${project.level}`, margin + 5, yPos);
        yPos += 4;

        if (project.reasoning) {
          doc.setTextColor(100, 100, 100);
          const descLines = doc.splitTextToSize(project.reasoning, contentWidth - 15);
          doc.text(descLines.slice(0, 2), margin + 5, yPos);
          yPos += descLines.slice(0, 2).length * 4 + 3;
        }
        yPos += 3;
      });
    }

    // Competitions (replaced emoji with text)
    if (recommendationsData.competitions && recommendationsData.competitions.length > 0) {
      checkPageBreak(15);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("[Competitions] Recommended Competitions", margin, yPos);
      yPos += 8;

      recommendationsData.competitions.slice(0, 5).forEach((competition) => {
        checkPageBreak(25);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 51, 51);
        doc.text(competition.title, margin + 5, yPos);
        yPos += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(
          `Duration: ${competition.duration_weeks} weeks | Level: ${competition.level}`,
          margin + 5,
          yPos
        );
        yPos += 4;

        if (competition.reasoning) {
          doc.setTextColor(100, 100, 100);
          const descLines = doc.splitTextToSize(competition.reasoning, contentWidth - 15);
          doc.text(descLines.slice(0, 2), margin + 5, yPos);
          yPos += descLines.slice(0, 2).length * 4 + 3;
        }
        yPos += 3;
      });
    }
  }

  // ===== 30-DAY ACTION PLAN SECTION =====
  if (aiActionPlan?.weeks && aiActionPlan.weeks.length > 0) {
    doc.addPage();
    yPos = margin;
    addSectionHeader("30-Day Action Plan");

    // Overview
    if (aiActionPlan.overview) {
      addWrappedText(
        `Primary Focus: ${skillDisplayNames[aiActionPlan.overview.primary_focus_skill] || aiActionPlan.overview.primary_focus_skill}`,
        10,
        true
      );
      addWrappedText(
        `Total Tasks: ${aiActionPlan.overview.total_tasks} | Estimated Hours: ${aiActionPlan.overview.estimated_total_hours}`,
        10
      );
      if (aiActionPlan.overview.reasoning_summary) {
        addWrappedText(aiActionPlan.overview.reasoning_summary, 9, false, [100, 100, 100]);
      }
      yPos += 5;
    }

    // Weeks
    aiActionPlan.weeks.forEach((week) => {
      checkPageBreak(20);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(`Week ${week.week_number}: ${week.theme}`, margin, yPos);
      yPos += 7;

      week.tasks.forEach((task, idx) => {
        checkPageBreak(20);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 51, 51);
        const taskTitle = `${idx + 1}. ${task.title}`;
        const titleLines = doc.splitTextToSize(taskTitle, contentWidth - 10);
        doc.text(titleLines, margin + 5, yPos);
        yPos += titleLines.length * 4 + 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Skill: ${skillDisplayNames[task.related_skill] || task.related_skill} | Time: ${task.estimated_time_hours}h | Difficulty: ${task.difficulty}`,
          margin + 5,
          yPos
        );
        yPos += 5;
      });
      yPos += 5;
    });
  }

  // ===== AI SUMMARY & NEXT STEPS =====
  doc.addPage();
  yPos = margin;
  addSectionHeader("AI Summary & Next Steps");

  // Generate dynamic summary based on available data
  const summaryPoints: string[] = [];

  if (analysisData?.aiAnalysis?.skill_signals) {
    const signals = analysisData.aiAnalysis.skill_signals;
    const strongSkills = Object.entries(signals)
      .filter(([, signal]) => signal.confidence >= 0.7 && signal.evidence_found)
      .map(([key]) => skillDisplayNames[key] || key);
    
    const developingSkills = Object.entries(signals)
      .filter(([, signal]) => signal.confidence < 0.5 || !signal.evidence_found)
      .map(([key]) => skillDisplayNames[key] || key);

    if (strongSkills.length > 0) {
      summaryPoints.push(`Strong Skills Identified: ${strongSkills.join(", ")}`);
    }
    if (developingSkills.length > 0) {
      summaryPoints.push(`Areas for Development: ${developingSkills.join(", ")}`);
    }
  }

  if (skillGapData?.priority_skills && skillGapData.priority_skills.length > 0) {
    const priorityDisplay = skillGapData.priority_skills
      .map((s) => skillDisplayNames[s] || s)
      .join(", ");
    summaryPoints.push(`Priority Focus Areas: ${priorityDisplay}`);
  }

  if (skillGapData?.total_weekly_time_recommended) {
    summaryPoints.push(`Recommended Weekly Time Investment: ${skillGapData.total_weekly_time_recommended}`);
  }

  if (aiActionPlan?.overview) {
    summaryPoints.push(
      `30-Day Plan: ${aiActionPlan.overview.total_tasks} tasks over ${aiActionPlan.overview.estimated_total_hours} hours`
    );
  }

  // Add summary points to PDF
  if (summaryPoints.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 51, 51);
    doc.text("Key Highlights:", margin, yPos);
    yPos += 7;

    summaryPoints.forEach((point) => {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(`• ${point}`, contentWidth - 10);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 5 + 3;
    });
  }

  // Next Steps Section
  yPos += 10;
  checkPageBreak(50);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Recommended Next Steps:", margin, yPos);
  yPos += 8;

  const nextSteps = [
    "Review your skill gaps and prioritize the areas most relevant to your goals",
    "Start with the first week of your 30-day action plan",
    "Explore the recommended courses and projects that match your interests",
    "Track your progress weekly and adjust your plan as needed",
    "Revisit SkillBridge AI monthly to update your skill profile",
  ];

  nextSteps.forEach((step, idx) => {
    checkPageBreak(12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 51, 51);
    const lines = doc.splitTextToSize(`${idx + 1}. ${step}`, contentWidth - 10);
    doc.text(lines, margin + 5, yPos);
    yPos += lines.length * 4 + 4;
  });

  // Growth Projection
  if (skillGapData?.skill_gaps && skillGapData.skill_gaps.length > 0) {
    yPos += 10;
    checkPageBreak(40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text("Projected Growth (if plan is followed):", margin, yPos);
    yPos += 8;

    skillGapData.skill_gaps.slice(0, 4).forEach((gap) => {
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 51, 51);
      const growthText = `${skillDisplayNames[gap.skill] || gap.skill}: ${gap.current_level}/10 → ${gap.expected_level_after}/10 (${gap.timeline})`;
      doc.text(growthText, margin + 5, yPos);
      yPos += 6;
    });
  }

  // Footer note
  yPos += 15;
  checkPageBreak(20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text(
    "This report was generated by SkillBridge AI. Results are based on self-reported information.",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `SkillBridge_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
