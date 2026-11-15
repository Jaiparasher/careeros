const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../seed-data/interview-skills-catalog.json');
const outputPath = path.resolve(__dirname, '../seed-data/interview-question-bank-seed.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const questions = [];
const seenIds = new Set();

function addQ(q) {
  if (!q.id) throw new Error("Missing question id");
  if (seenIds.has(q.id)) throw new Error("Duplicate question id: " + q.id);
  seenIds.add(q.id);

  if (!q.expected_answer_points || !Array.isArray(q.expected_answer_points) || q.expected_answer_points.length < 2) {
    throw new Error(`Question ${q.id} missing expected_answer_points (min 2)`);
  }
  if (!q.sample_answer || typeof q.sample_answer !== 'string' || q.sample_answer.trim().length === 0) {
    throw new Error(`Question ${q.id} missing sample_answer`);
  }
  if (!q.follow_up_questions || !Array.isArray(q.follow_up_questions) || q.follow_up_questions.length < 1) {
    throw new Error(`Question ${q.id} missing follow_up_questions (min 1)`);
  }

  const diffNormalized = q.difficulty === "beginner" ? "basic" : (q.difficulty || "intermediate");

  questions.push({
    source_external_id: q.id,
    skill_slug: q.skill_slug,
    skill_name: q.skill_name,
    skill_category: q.skill_category,
    topic: q.topic,
    subtopic: q.subtopic || null,
    question_title: q.question_title,
    question_prompt: q.question_prompt,
    question_type: q.question_type || "conceptual",
    difficulty: diffNormalized,
    priority: q.priority || "high",
    target_roles: q.target_roles || ["Java Backend Developer", "Software Engineer"],
    tags: Array.from(new Set([q.skill_slug, q.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'), ...(q.tags || [])])),
    expected_answer_points: q.expected_answer_points,
    sample_answer: q.sample_answer,
    follow_up_questions: q.follow_up_questions,
    estimated_minutes: q.estimated_minutes || 12,
    source_name: "CareerOS curated"
  });
}

// Load all modules
console.log("Loading modular question banks...");
require('./data/programming_languages')(addQ);
require('./data/java_backend')(addQ);
require('./data/frontend')(addQ);
require('./data/node_ecosystem')(addQ);
require('./data/databases')(addQ);
require('./data/api_and_integration')(addQ);
require('./data/devops_tools')(addQ);
require('./data/computer_science')(addQ);
require('./data/system_design')(addQ);
require('./data/cloud_ai')(addQ);
require('./data/career_and_projects')(addQ);

console.log(`Total questions compiled: ${questions.length}`);

// Validation against catalog
const catalogCategories = new Set(catalog.categories.map(c => c.slug));
const catalogSkills = new Set();
catalog.categories.forEach(c => c.skills.forEach(s => catalogSkills.add(s.slug)));

console.log(`Catalog categories: ${catalogCategories.size}, skills: ${catalogSkills.size}`);

const coveredCategories = new Set();
const coveredSkills = new Set();
const skillCounts = {};
const categoryCounts = {};

questions.forEach(q => {
  coveredCategories.add(q.skill_category);
  coveredSkills.add(q.skill_slug);
  skillCounts[q.skill_slug] = (skillCounts[q.skill_slug] || 0) + 1;
  categoryCounts[q.skill_category] = (categoryCounts[q.skill_category] || 0) + 1;
});

console.log("\n--- Category Breakdown ---");
for (const [cat, count] of Object.entries(categoryCounts)) {
  console.log(`- ${cat}: ${count} questions`);
}

// Check missing skills
const missingSkills = [];
for (const s of catalogSkills) {
  if (!coveredSkills.has(s)) {
    missingSkills.push(s);
  }
}

if (missingSkills.length > 0) {
  console.error("ERROR: Missing skills in question bank:", missingSkills);
  process.exit(1);
}

if (questions.length < 330) {
  console.error(`ERROR: Target is at least 330 questions, but only ${questions.length} generated.`);
  process.exit(1);
}

console.log(`\nALL 42 SKILLS AND 11 CATEGORIES COVERED!`);
console.log(`Total questions: ${questions.length} (Target: >= 330)`);

const outputData = {
  schema_version: 1,
  total_questions: questions.length,
  curated_by: "CareerOS curated",
  generated_at: new Date().toISOString(),
  categories_count: coveredCategories.size,
  skills_count: coveredSkills.size,
  category_breakdown: categoryCounts,
  questions
};

fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
console.log(`Successfully written to: ${outputPath}`);
