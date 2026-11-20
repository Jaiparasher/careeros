import "server-only";

import { geminiService } from "@/features/ai";
import {
  type StudyActionCandidate,
  type RawGeminiAdvisorOutput,
  type StudyRecommendation,
  rawGeminiAdvisorOutputSchema,
} from "./recommendation-schema";

const ADVISOR_SYSTEM_INSTRUCTION = `You are the CareerOS Adaptive Study Advisor for software engineers preparing for Java Backend, Full-Stack, and SDE-I technical interviews.

YOUR MISSION:
Review the candidate's eligible study candidates (due spaced revisions, weak topics, incomplete modules, and interview question gaps) and select at most 3 prioritized, actionable recommendations that fit within the user's remaining study capacity and maximize their interview readiness for their target role.

CRITICAL INSTRUCTIONS & ARCHITECTURAL CONSTRAINTS:
1. DETERMINISTIC SCHEDULING RULE: You do NOT calculate or dictate dates, calendar scheduling, or task durations. All candidate actions, estimated durations, and capacity metrics have already been calculated deterministically by the system.
2. NO HALLUCINATION OF CANDIDATES: You MUST choose ONLY from the provided <candidate_pool>. Every recommendation's "candidateId" MUST strictly match an existing "id" in <candidate_pool>. Do NOT invent new candidate IDs.
3. SELECT AT MOST 3: Select 1 to 3 items. Prioritize overdue revisions first, followed by weak concepts that match the target role, followed by high-yield incomplete modules.
4. PRACTICAL & ACTIONABLE:
   - "reason": 1-2 concise sentences explaining why this specific activity is prioritized now based on spaced repetition urgency or target role relevance.
   - "expectedOutcome": 1 concise sentence describing the concrete skill or mastery achieved upon completion.
5. JSON ONLY: Return strictly a valid JSON object matching the requested schema.`;

export function extractJsonFromAdvisorText(rawText: string): string {
  const trimmed = rawText.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export interface GenerateRecommendationsAdvisorParams {
  targetRoles: string[];
  dailyAvailableMinutes: number;
  remainingCapacityMinutes: number;
  candidates: StudyActionCandidate[];
}

export interface RankCandidatesResult {
  recommendations: StudyRecommendation[];
  generationSource: "gemini" | "deterministic_fallback";
  fallbackReason?: string | null;
  advisorHeadline: string;
}

export async function rankAndExplainStudyCandidates(
  params: GenerateRecommendationsAdvisorParams
): Promise<RankCandidatesResult> {
  const { targetRoles, dailyAvailableMinutes, remainingCapacityMinutes, candidates } = params;

  if (candidates.length === 0) {
    return {
      recommendations: [],
      generationSource: "gemini",
      fallbackReason: null,
      advisorHeadline: "All Scheduled Topics Up To Date",
    };
  }

  // Pre-sort candidates by deterministic urgency score so highest urgency items are evaluated first
  const sortedCandidates = [...candidates].sort((a, b) => b.urgencyScore - a.urgencyScore);
  const candidateMap = new Map<string, StudyActionCandidate>();
  sortedCandidates.forEach((c) => candidateMap.set(c.id, c));

  // Truncate candidate list to top 12 to maintain compact prompt within token limits
  const topCandidatesForAi = sortedCandidates.slice(0, 12).map((c) => ({
    id: c.id,
    type: c.type,
    title: c.title,
    topicOrSkill: c.topicOrSkill,
    estimatedMinutes: c.estimatedMinutes,
    urgencyScore: c.urgencyScore,
    context: c.context,
  }));

  const promptContent = `Target Job Roles: ${targetRoles.join(", ") || "Java Backend Engineer, SDE-I"}
Daily Available Study Time: ${dailyAvailableMinutes} minutes
Remaining Study Capacity Today: ${remainingCapacityMinutes} minutes

<candidate_pool>
${JSON.stringify(topCandidatesForAi, null, 2)}
</candidate_pool>

Select at most 3 prioritized recommendations from the candidate pool above that best prepare the candidate for their target role within their remaining time. Return JSON with the exact structure:
{
  "advisorHeadline": "Short punchy overview headline (e.g. Focus on Overdue Concurrency & Spring Security)",
  "recommendations": [
    {
      "candidateId": "id-from-candidate-pool",
      "priority": "high" | "medium" | "low",
      "reason": "Clear explanation of why this matters today.",
      "expectedOutcome": "Concrete readiness outcome."
    }
  ]
}`;

  let parsedOutput: RawGeminiAdvisorOutput | null = null;
  let fallbackReason: string | null = null;

  try {
    const aiResult = await geminiService.generateContent({
      prompt: promptContent,
      systemInstruction: ADVISOR_SYSTEM_INSTRUCTION,
      temperature: 0.2,
      maxOutputTokens: 2048,
      timeoutMs: 45_000,
    });

    const jsonText = extractJsonFromAdvisorText(aiResult.text);
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      fallbackReason = "AI returned malformed JSON output.";
    }

    if (parsed) {
      const validated = rawGeminiAdvisorOutputSchema.safeParse(parsed);
      if (validated.success) {
        parsedOutput = validated.data;
      } else {
        fallbackReason = "AI output did not match expected schema constraints.";
      }
    }
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    if (errMessage.includes("GEMINI_API_KEY is not configured") || errMessage.includes("API key")) {
      fallbackReason = "Gemini API key is not configured.";
    } else if (errMessage.includes("timed out") || errMessage.includes("TIMEOUT")) {
      fallbackReason = "AI generation timed out after 45s.";
    } else if (errMessage.includes("rate limit") || errMessage.includes("429")) {
      fallbackReason = "AI provider rate limit reached.";
    } else {
      fallbackReason = `AI service unavailable (${errMessage.slice(0, 80)}).`;
    }
    parsedOutput = null;
  }

  // If Gemini produced valid recommendations, map them against verified deterministic candidates
  if (parsedOutput && parsedOutput.recommendations.length > 0) {
    const validRecommendations: StudyRecommendation[] = [];
    const seenRecTitles = new Set<string>();

    for (const rec of parsedOutput.recommendations) {
      const candidate = candidateMap.get(rec.candidateId);
      if (candidate && !seenRecTitles.has(candidate.title.trim().toLowerCase())) {
        seenRecTitles.add(candidate.title.trim().toLowerCase());
        validRecommendations.push({
          id: `rec_${candidate.id}_${Date.now()}`,
          candidateId: candidate.id,
          type: candidate.type,
          title: candidate.title,
          topicOrSkill: candidate.topicOrSkill,
          category: candidate.category,
          entityId: candidate.entityId,
          priority: rec.priority,
          reason: rec.reason,
          expectedOutcome: rec.expectedOutcome,
          estimatedMinutes: candidate.estimatedMinutes,
          context: candidate.context,
          source: "gemini",
          isAccepted: false,
          isDismissed: false,
        });
      }
      if (validRecommendations.length >= 3) break;
    }

    if (validRecommendations.length > 0) {
      return {
        recommendations: validRecommendations,
        generationSource: "gemini",
        fallbackReason: null,
        advisorHeadline: parsedOutput.advisorHeadline,
      };
    } else {
      fallbackReason = "AI recommendations did not match candidate pool.";
    }
  }

  // Deterministic fallback: select top 3 unique candidates by urgencyScore
  const fallbackRecs: StudyRecommendation[] = [];
  const seenFallbackTitles = new Set<string>();

  for (const candidate of sortedCandidates) {
    const normTitle = candidate.title.trim().toLowerCase();
    if (seenFallbackTitles.has(normTitle)) continue;
    seenFallbackTitles.add(normTitle);

    const idx = fallbackRecs.length;
    fallbackRecs.push({
      id: `rec_det_${candidate.id}_${Date.now()}_${idx}`,
      candidateId: candidate.id,
      type: candidate.type,
      title: candidate.title,
      topicOrSkill: candidate.topicOrSkill,
      category: candidate.category,
      entityId: candidate.entityId,
      priority: idx === 0 ? "high" : idx === 1 ? "medium" : "low",
      reason: candidate.context || `Prioritized based on spaced repetition and skill readiness for ${targetRoles[0] || "Backend Engineer"}.`,
      expectedOutcome: `Solidify retention and demonstrated competency in ${candidate.topicOrSkill}.`,
      estimatedMinutes: candidate.estimatedMinutes,
      context: candidate.context,
      source: "deterministic_fallback",
      isAccepted: false,
      isDismissed: false,
    });

    if (fallbackRecs.length >= 3) break;
  }

  return {
    recommendations: fallbackRecs,
    generationSource: "deterministic_fallback",
    fallbackReason: fallbackReason || "Deterministic priority ranking active.",
    advisorHeadline: `Top Focus: ${fallbackRecs[0]?.topicOrSkill || "Priority Review"} (Deterministic Plan)`,
  };
}
