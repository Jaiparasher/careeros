import {
  getAllSkills,
  getCategoryById,
  INTERVIEW_TAXONOMY,
  SkillInfo,
} from "@/features/interview/taxonomy";
import {
  ResumeJdAnalysis,
  SkillMatch,
  RecommendedInterviewTopic,
} from "./schema";

export const SKILL_ALIASES: Record<string, string[]> = {
  java: ["java", "core java", "jdk", "jvm", "j2ee"],
  javascript: ["javascript", "js", "es6", "es2015", "ecmascript"],
  typescript: ["typescript", "ts"],
  c: ["c language", "ansi c"],
  cpp: ["c++", "cpp"],
  "spring-framework": ["spring framework", "spring core", "spring", "dependency injection", "ioc"],
  "spring-boot": ["spring boot", "springboot"],
  "spring-security": ["spring security", "spring-security", "oauth2", "rbac"],
  "hibernate-jpa": ["hibernate", "jpa", "orm", "entity manager"],
  microservices: ["microservices", "microservice", "distributed systems", "service-oriented"],
  "apache-kafka": ["kafka", "apache kafka", "message broker", "event streaming", "event-driven"],
  "spring-ai": ["spring ai", "langchain4j", "llm integration"],
  react: ["react", "reactjs", "react.js"],
  redux: ["redux", "redux toolkit", "rtk"],
  nextjs: ["next.js", "nextjs", "next js", "app router"],
  nodejs: ["node.js", "nodejs", "node"],
  expressjs: ["express", "express.js", "expressjs"],
  sql: ["sql", "relational database", "rdbms", "queries", "joins"],
  mysql: ["mysql"],
  mongodb: ["mongodb", "mongo", "nosql", "document store"],
  firebase: ["firebase", "firestore"],
  "postgresql-pgvector": ["postgresql", "postgres", "pgvector", "psql"],
  "rest-apis": ["rest", "restful", "rest api", "rest apis", "restful api"],
  "websockets-sse": ["websocket", "websockets", "sse", "server-sent events", "socket.io"],
  jwt: ["jwt", "json web token", "bearer token"],
  postman: ["postman", "api testing"],
  "swagger-openapi": ["swagger", "openapi", "api documentation"],
  docker: ["docker", "containerization", "containers", "dockerfile"],
  kubernetes: ["kubernetes", "k8s"],
  "git-github": ["git", "github", "version control", "git flow"],
  maven: ["maven", "pom.xml", "mvn"],
  cicd: ["ci/cd", "cicd", "continuous integration", "continuous deployment", "github actions", "jenkins"],
  "agile-scrum": ["agile", "scrum", "sprints", "jira", "kanban"],
  dbms: ["dbms", "database management", "acid", "indexing", "b-tree", "normalization"],
  "operating-systems": ["operating systems", "os", "multithreading", "concurrency", "deadlock", "process scheduling"],
  "computer-networks": ["computer networks", "networking", "tcp/ip", "tcp", "udp", "http", "https", "dns", "osi model"],
  lld: ["lld", "low-level design", "low level design", "object-oriented design", "ood", "design patterns", "solid principles"],
  hld: ["hld", "high-level design", "high level design", "system design", "distributed architecture", "load balancing", "caching", "scalability"],
  "aws-foundations": ["aws", "amazon web services", "ec2", "s3", "lambda", "cloudwatch", "iam"],
  "tcs-project-deep-dive": ["tcs", "enterprise project", "legacy modernization", "production support"],
  "lovable-project-deep-dive": ["lovable", "ai architecture", "fullstack project"],
  behavioral: ["behavioral", "leadership", "stakeholder management", "cross-functional", "conflict resolution", "mentorship", "star method"],
};

export const COMMON_TECHNICAL_KEYWORDS = [
  "redis",
  "memcached",
  "elasticsearch",
  "graphql",
  "grpc",
  "protobuf",
  "prometheus",
  "grafana",
  "datadog",
  "opentelemetry",
  "junit",
  "mockito",
  "jest",
  "cypress",
  "playwright",
  "terraform",
  "ansible",
  "helm",
  "serverless",
  "event sourcing",
  "cqrs",
  "saga",
  "rate limiting",
  "circuit breaker",
  "sharding",
  "replication",
  "oauth",
  "oidc",
  "tls",
  "ssl",
  "cdn",
  "websocket",
  "agile",
  "scrum",
  "tdd",
];

/**
 * Escapes regex special characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Checks whether text contains any of the search terms as whole phrases / words.
 */
function findMatchingTerms(text: string, terms: string[]): string[] {
  const matched: string[] = [];
  const lowerText = text.toLowerCase();

  for (const term of terms) {
    const escaped = escapeRegex(term.toLowerCase());
    // For single word or phrase with symbols (e.g. c++, c#, .net)
    const pattern = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, "i");
    if (pattern.test(lowerText)) {
      matched.push(term);
    }
  }

  return matched;
}

/**
 * Related skill fallbacks to determine partial demonstration
 */
const RELATED_SKILLS_MAP: Record<string, string[]> = {
  "spring-security": ["java", "spring-boot", "jwt", "rest-apis"],
  "apache-kafka": ["microservices", "spring-boot", "java", "websockets-sse"],
  kubernetes: ["docker", "devops-tools"],
  mongodb: ["sql", "mysql", "postgresql-pgvector", "databases"],
  "spring-ai": ["java", "spring-boot", "rest-apis"],
  redux: ["react", "javascript", "typescript"],
  nextjs: ["react", "javascript", "typescript"],
  expressjs: ["nodejs", "javascript", "typescript"],
  "websockets-sse": ["rest-apis", "nodejs", "java"],
  hld: ["microservices", "databases", "system-design", "rest-apis"],
  lld: ["java", "typescript", "cpp"],
};

/**
 * Deterministically analyzes resume text against a job description.
 */
export function analyzeResumeAgainstJd(
  resumeText: string,
  jdText: string,
  metadata?: {
    company?: string;
    roleTitle?: string;
    resumeVersion?: string;
  }
): ResumeJdAnalysis {
  const allSkills = getAllSkills();
  const jdLower = (jdText || "").toLowerCase();
  const resumeLower = (resumeText || "").toLowerCase();

  // 1. Identify which taxonomy skills appear in the Job Description
  const jdSkills: Array<{ skill: SkillInfo; matchedTerms: string[] }> = [];

  for (const skill of allSkills) {
    const aliases = SKILL_ALIASES[skill.slug] || [skill.name.toLowerCase()];
    const termsToMatch = Array.from(new Set([skill.name.toLowerCase(), skill.slug, ...aliases]));
    const matched = findMatchingTerms(jdLower, termsToMatch);

    if (matched.length > 0) {
      jdSkills.push({ skill, matchedTerms: matched });
    }
  }

  // If JD is very short or didn't explicitly match 3 skills, also scan for category terms
  if (jdSkills.length < 3) {
    for (const category of INTERVIEW_TAXONOMY) {
      if (jdLower.includes(category.name.toLowerCase())) {
        for (const skill of category.skills.slice(0, 2)) {
          if (!jdSkills.some((item) => item.skill.slug === skill.slug)) {
            jdSkills.push({ skill, matchedTerms: [category.name] });
          }
        }
      }
    }
  }

  // 2. Classify each JD skill against the candidate's resume
  const explicitSkills: SkillMatch[] = [];
  const partialSkills: SkillMatch[] = [];
  const missingSkills: SkillMatch[] = [];

  for (const { skill, matchedTerms: jdTerms } of jdSkills) {
    const skillAliases = SKILL_ALIASES[skill.slug] || [skill.name.toLowerCase()];
    const termsToCheck = Array.from(new Set([skill.name.toLowerCase(), skill.slug, ...skillAliases]));
    const resumeMatches = findMatchingTerms(resumeLower, termsToCheck);

    if (resumeMatches.length > 0) {
      // Explicit match
      explicitSkills.push({
        slug: skill.slug,
        name: skill.name,
        category: skill.category,
        priority: skill.priority,
        matchType: "explicit",
        matchedKeywords: resumeMatches,
      });
      continue;
    }

    // Check for partial demonstration via related skills or category demonstration
    const relatedSlugs = RELATED_SKILLS_MAP[skill.slug] || [];
    const relatedFound: string[] = [];

    for (const relSlug of relatedSlugs) {
      const relAliases = SKILL_ALIASES[relSlug] || [relSlug];
      const relMatches = findMatchingTerms(resumeLower, relAliases);
      if (relMatches.length > 0) {
        relatedFound.push(relSlug);
      }
    }

    // Check if category has other skills present in resume
    const categoryObj = getCategoryById(skill.category);
    let categoryDemonstrated = false;
    if (categoryObj) {
      for (const sibling of categoryObj.skills) {
        if (sibling.slug !== skill.slug) {
          const sibAliases = SKILL_ALIASES[sibling.slug] || [sibling.name.toLowerCase()];
          if (findMatchingTerms(resumeLower, sibAliases).length > 0) {
            categoryDemonstrated = true;
            break;
          }
        }
      }
    }

    if (relatedFound.length > 0 || categoryDemonstrated) {
      partialSkills.push({
        slug: skill.slug,
        name: skill.name,
        category: skill.category,
        priority: skill.priority,
        matchType: "partial",
        matchedKeywords: jdTerms,
        explanation:
          relatedFound.length > 0
            ? `Found related competencies (${relatedFound.join(", ")}), but specific mention of ${skill.name} is missing.`
            : `Candidate demonstrates other skills in the ${categoryObj?.name || skill.category} domain, but ${skill.name} is not explicitly named.`,
      });
    } else {
      missingSkills.push({
        slug: skill.slug,
        name: skill.name,
        category: skill.category,
        priority: skill.priority,
        matchType: "missing",
        matchedKeywords: jdTerms,
        explanation: `Required by job description, but not evidenced in resume text.`,
      });
    }
  }

  // 3. Extract common technical keywords in JD absent in resume
  const missingKeywords: string[] = [];
  for (const kw of COMMON_TECHNICAL_KEYWORDS) {
    const inJd = findMatchingTerms(jdLower, [kw]).length > 0;
    const inResume = findMatchingTerms(resumeLower, [kw]).length > 0;
    if (inJd && !inResume) {
      missingKeywords.push(kw);
    }
  }

  // 4. Calculate deterministic match percentage
  const totalEvaluated = jdSkills.length;
  let matchPercentage = 0;
  if (totalEvaluated > 0) {
    const rawScore =
      (explicitSkills.length * 1.0 + partialSkills.length * 0.5) /
      totalEvaluated;
    matchPercentage = Math.min(100, Math.max(0, Math.round(rawScore * 100)));
  } else {
    // If no specific taxonomy skills were found in JD, check general technical density
    matchPercentage = resumeLower.length > 100 ? 70 : 30;
  }

  // 5. Generate deterministic actionable bullet improvement suggestions
  const bulletSuggestions: string[] = [];

  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3).map((s) => s.name).join(", ");
    bulletSuggestions.push(
      `Incorporate explicit keywords for ${topMissing} in your technical skills inventory and project bullets if you have relevant experience.`
    );
  }

  if (partialSkills.length > 0) {
    const topPartial = partialSkills[0];
    bulletSuggestions.push(
      `Clarify your depth in ${topPartial.name}: you show foundational experience in its domain, but mentioning ${topPartial.name} directly will improve search visibility.`
    );
  }

  if (missingKeywords.length > 0) {
    const topKeywords = missingKeywords.slice(0, 4).join(", ");
    bulletSuggestions.push(
      `The job description emphasizes domain concepts (${topKeywords}). Consider highlighting relevant metrics or implementations involving these concepts.`
    );
  }

  bulletSuggestions.push(
    `Use the Google X-Y-Z formula for project bullets: "Accomplished [X] as measured by [Y], by doing [Z]" to pair technical keywords with quantifiable impact.`
  );

  // 6. Map missing/partial skills to CareerOS Interview Question Bank recommendations
  const recommendedInterviewTopics: RecommendedInterviewTopic[] = [];
  const targetSkills = [...missingSkills, ...partialSkills].slice(0, 5);

  for (const match of targetSkills) {
    const cat = getCategoryById(match.category);
    recommendedInterviewTopics.push({
      topicSlug: match.slug,
      topicName: match.name,
      categoryId: match.category,
      categoryName: cat?.name || match.category,
      reason:
        match.matchType === "missing"
          ? `Missing from resume; prepare for questions if asked during screening.`
          : `Partially demonstrated; review fundamentals to speak with confidence.`,
      interviewBankUrl: `/interview-questions?category=${match.category}`,
    });
  }

  return {
    company: metadata?.company || "Target Company",
    roleTitle: metadata?.roleTitle || "Target Role",
    resumeVersion: metadata?.resumeVersion || "Active Resume",
    matchPercentage,
    totalSkillsEvaluated: totalEvaluated,
    explicitSkills,
    partialSkills,
    missingSkills,
    missingKeywords,
    bulletSuggestions,
    recommendedInterviewTopics,
    disclaimer:
      "Deterministic Keyword & Skill Analysis — This is a deterministic skill taxonomy alignment tool based on resume text and JD keywords. It is not an official proprietary ATS score or predictor.",
  };
}
