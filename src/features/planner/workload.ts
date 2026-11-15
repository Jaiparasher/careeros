export interface DailyWorkloadItem {
  title: string;
  estimated_minutes: number;
  category: string;
}

export interface CapacityEvaluation {
  isOverloaded: boolean;
  excessMinutes: number;
  utilizationPercent: number;
  warningMessage?: string;
}

export function calculateDailyWorkload(tasks: DailyWorkloadItem[]): number {
  return tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
}

export function evaluateCapacity(
  requiredMinutes: number,
  availableMinutes: number
): CapacityEvaluation {
  const safeAvailable = Math.max(1, availableMinutes);
  const excess = Math.max(0, requiredMinutes - safeAvailable);
  const isOverloaded = excess > 0;
  const utilizationPercent = (requiredMinutes / safeAvailable) * 100;

  return {
    isOverloaded,
    excessMinutes: excess,
    utilizationPercent,
    warningMessage: isOverloaded
      ? `Workload Warning: Day requires ${requiredMinutes} minutes, which exceeds your daily available study time by ${excess} minutes.`
      : undefined,
  };
}

export interface SprintDayPlan {
  dayNumber: number;
  date: string;
  focusTopic: string;
  grindProblemOrders: number[];
  estimatedMinutes: number;
  isReviewDay: boolean;
  isOverloaded: boolean;
  excessMinutes: number;
}

export interface SprintScheduleResult {
  durationDays: number;
  averageDailyMinutes: number;
  totalGrindScheduled: number;
  days: SprintDayPlan[];
}

// 30-Day Sprint Curriculum from docs/18_FIRST_30_DAY_INTERVIEW_SPRINT.md
const SPRINT_30_CURRICULUM = [
  { day: 1, focus: "Java foundations", grind: [1, 2, 3], review: false },
  { day: 2, focus: "OOP and design principles", grind: [4, 5, 6], review: false },
  { day: 3, focus: "Collections Framework", grind: [7, 8, 9], review: false },
  { day: 4, focus: "Strings, generics and exceptions", grind: [10, 11, 12], review: false },
  { day: 5, focus: "Java 8+ and functional programming", grind: [13, 14, 15], review: false },
  { day: 6, focus: "Review checkpoint 1 (Grind #01-#15)", grind: [], review: true },
  { day: 7, focus: "JVM and memory", grind: [16, 17, 18], review: false },
  { day: 8, focus: "Multithreading and concurrency", grind: [19, 20, 21], review: false },
  { day: 9, focus: "Spring Core", grind: [22, 23, 24], review: false },
  { day: 10, focus: "Spring Boot internals", grind: [25, 26, 27], review: false },
  { day: 11, focus: "REST API development", grind: [28, 29, 30], review: false },
  { day: 12, focus: "Hibernate and Spring Data JPA", grind: [31, 32, 33], review: false },
  { day: 13, focus: "Review checkpoint 2 (Grind #16-#33)", grind: [], review: true },
  { day: 14, focus: "Spring Security and JWT", grind: [34, 35, 36], review: false },
  { day: 15, focus: "Testing and production readiness", grind: [37, 38, 39], review: false },
  { day: 16, focus: "SQL fundamentals", grind: [40, 41, 42], review: false },
  { day: 17, focus: "Advanced SQL and DBMS", grind: [43, 44, 45], review: false },
  { day: 18, focus: "Database technology comparison", grind: [46, 47, 48], review: false },
  { day: 19, focus: "React foundations", grind: [49, 50, 51], review: false },
  { day: 20, focus: "React advanced and Redux", grind: [52, 53, 54], review: false },
  { day: 21, focus: "JavaScript and TypeScript", grind: [55, 56, 57], review: false },
  { day: 22, focus: "Node.js and Express", grind: [58, 59, 60], review: false },
  { day: 23, focus: "Next.js and full-stack rendering", grind: [61, 62, 63], review: false },
  { day: 24, focus: "API integration and real-time systems", grind: [64, 65, 66], review: false },
  { day: 25, focus: "Microservices, Kafka and Spring AI", grind: [67, 68, 69], review: false },
  { day: 26, focus: "Review checkpoint 3 (Grind #49-#69)", grind: [], review: true },
  { day: 27, focus: "DevOps, tools and cloud basics", grind: [70, 71, 72], review: false },
  { day: 28, focus: "System design and CS fundamentals", grind: [73, 74, 75], review: false },
  { day: 29, focus: "Mock interview day", grind: [], review: true },
  { day: 30, focus: "Final review and Day 31+ plan transition", grind: [], review: true },
];

export function generateSprintSchedule(opts: {
  durationDays: 30 | 45 | 60;
  dailyAvailableMinutes: number;
  startDate: Date;
  targetRole?: string;
}): SprintScheduleResult {
  const { durationDays, dailyAvailableMinutes, startDate } = opts;
  const days: SprintDayPlan[] = [];

  if (durationDays === 30) {
    let totalMinutesAcrossSprint = 0;

    SPRINT_30_CURRICULUM.forEach((c) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + (c.day - 1));
      const dateStr = dayDate.toISOString().slice(0, 10);

      // Estimate:
      // Grind 75: ~20-25 mins per problem
      // Questions: 4 questions * 15 mins = 60 mins
      // Review / Recap: 15 mins
      const grindMinutes = c.grind.length * 25;
      const questionMinutes = c.review ? 40 : 60;
      const recapMinutes = 15;
      const estimatedMinutes = grindMinutes + questionMinutes + recapMinutes;
      totalMinutesAcrossSprint += estimatedMinutes;

      const evalResult = evaluateCapacity(estimatedMinutes, dailyAvailableMinutes);

      days.push({
        dayNumber: c.day,
        date: dateStr,
        focusTopic: c.focus,
        grindProblemOrders: c.grind,
        estimatedMinutes,
        isReviewDay: c.review,
        isOverloaded: evalResult.isOverloaded,
        excessMinutes: evalResult.excessMinutes,
      });
    });

    const averageDailyMinutes = Math.round(totalMinutesAcrossSprint / 30);

    return {
      durationDays: 30,
      averageDailyMinutes,
      totalGrindScheduled: 75,
      days,
    };
  }

  // 45-day or 60-day capacity-adjusted distribution
  // Distribute all 75 Grind 75 problems more gently across non-review days
  const practiceDaysCount = Math.floor(durationDays * 0.75); // ~34 days for 45d, ~45 days for 60d
  const grindPerDay = 75 / practiceDaysCount;

  let currentProblemIdx = 1;
  let totalMinutesAcrossSprint = 0;

  for (let i = 1; i <= durationDays; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + (i - 1));
    const dateStr = dayDate.toISOString().slice(0, 10);

    // Every 7th day is a review checkpoint
    const isReview = i % 7 === 0 || i === durationDays;
    const assignedGrind: number[] = [];

    if (!isReview && currentProblemIdx <= 75) {
      const takeCount = Math.max(1, Math.min(Math.round(grindPerDay), 76 - currentProblemIdx));
      for (let k = 0; k < takeCount && currentProblemIdx <= 75; k++) {
        assignedGrind.push(currentProblemIdx++);
      }
    }

    // Workload in capacity-adjusted plan is scaled down
    const grindMinutes = assignedGrind.length * 25;
    const questionMinutes = isReview ? 30 : 45;
    const recapMinutes = 10;
    const estimatedMinutes = grindMinutes + questionMinutes + recapMinutes;
    totalMinutesAcrossSprint += estimatedMinutes;

    const evalResult = evaluateCapacity(estimatedMinutes, dailyAvailableMinutes);

    // Associate topic focus rotating through curriculum
    const curriculumIdx = ((i - 1) % SPRINT_30_CURRICULUM.length);
    const focusTopic = isReview
      ? `Review & Practice Checkpoint (${assignedGrind.length > 0 ? "DSA & " : ""}Concepts)`
      : SPRINT_30_CURRICULUM[curriculumIdx]!.focus;

    days.push({
      dayNumber: i,
      date: dateStr,
      focusTopic,
      grindProblemOrders: assignedGrind,
      estimatedMinutes,
      isReviewDay: isReview,
      isOverloaded: evalResult.isOverloaded,
      excessMinutes: evalResult.excessMinutes,
    });
  }

  // Ensure any remainder problems are assigned if needed
  while (currentProblemIdx <= 75) {
    // Put remaining into last practice day
    const lastPractice = days.filter((d) => !d.isReviewDay).pop();
    if (lastPractice) {
      lastPractice.grindProblemOrders.push(currentProblemIdx);
      lastPractice.estimatedMinutes += 25;
    }
    currentProblemIdx++;
  }

  const averageDailyMinutes = Math.round(totalMinutesAcrossSprint / durationDays);

  return {
    durationDays,
    averageDailyMinutes,
    totalGrindScheduled: 75,
    days,
  };
}

export interface AdaptiveCandidateItem {
  id: string;
  title: string;
  type: "dsa" | "interview_question" | "learning_topic";
  roleRelevance: number; // 0.0 to 1.0 based on target roles
  confidenceScore?: number | null; // 1 to 5, where 1 or null is highest knowledge gap
  skillImportance: "critical" | "high" | "medium" | "low";
  isRevisionDue: boolean;
  isOverdueRevision?: boolean;
  daysUntilInterview?: number | null; // e.g. within 7 days is high urgency
}

export interface PrioritizedAdaptiveItem extends AdaptiveCandidateItem {
  finalScore: number; // 0 to 100
  scoreBreakdown: {
    roleRelevanceScore: number;
    knowledgeGapScore: number;
    skillImportanceScore: number;
    revisionScore: number;
    interviewScore: number;
  };
  reasoning: string;
}

/**
 * Dynamic planning priority after Day 30:
 * Weights:
 * - Role relevance: 30%
 * - Knowledge gaps: 25%
 * - Resume skill importance: 20%
 * - Due revisions: 15%
 * - Upcoming interviews: 10%
 */
export function calculateDay31Prioritization(
  items: AdaptiveCandidateItem[]
): PrioritizedAdaptiveItem[] {
  const scored = items.map((item) => {
    // 1. Role relevance (30% weight)
    const roleScore = Math.min(1, Math.max(0, item.roleRelevance)) * 30;

    // 2. Knowledge gap (25% weight)
    // Low confidence (1) or unattempted (null) gives max knowledge gap score (25 pts)
    // High confidence (5) gives minimum (5 pts)
    const conf = item.confidenceScore ?? 1;
    const knowledgeGapScore = ((6 - conf) / 5) * 25;

    // 3. Resume skill importance (20% weight)
    const importanceWeight =
      item.skillImportance === "critical"
        ? 1.0
        : item.skillImportance === "high"
        ? 0.8
        : item.skillImportance === "medium"
        ? 0.5
        : 0.25;
    const skillScore = importanceWeight * 20;

    // 4. Due revisions (15% weight)
    const revisionScore = item.isOverdueRevision
      ? 15
      : item.isRevisionDue
      ? 12
      : 0;

    // 5. Upcoming interviews proximity (10% weight)
    let interviewScore = 0;
    if (item.daysUntilInterview !== undefined && item.daysUntilInterview !== null) {
      if (item.daysUntilInterview <= 3) interviewScore = 10;
      else if (item.daysUntilInterview <= 7) interviewScore = 8;
      else if (item.daysUntilInterview <= 14) interviewScore = 5;
      else interviewScore = 2;
    }

    const finalScore = Math.round(
      roleScore + knowledgeGapScore + skillScore + revisionScore + interviewScore
    );

    // Build transparent rationale string
    const reasons: string[] = [];
    if (roleScore >= 24) reasons.push("High target role alignment (30%)");
    if (knowledgeGapScore >= 20) reasons.push("High knowledge gap / unmastered (25%)");
    if (skillScore >= 16) reasons.push(`Critical resume skill: ${item.skillImportance} (20%)`);
    if (revisionScore > 0) reasons.push(item.isOverdueRevision ? "Overdue spaced revision (15%)" : "Due revision (12%)");
    if (interviewScore >= 8) reasons.push("Upcoming interview proximity (10%)");

    return {
      ...item,
      finalScore,
      scoreBreakdown: {
        roleRelevanceScore: Math.round(roleScore),
        knowledgeGapScore: Math.round(knowledgeGapScore),
        skillImportanceScore: Math.round(skillScore),
        revisionScore,
        interviewScore,
      },
      reasoning: reasons.length > 0 ? reasons.join(" • ") : "Standard curriculum priority",
    };
  });

  return scored.sort((a, b) => b.finalScore - a.finalScore);
}

