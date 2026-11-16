"use client";

import * as React from "react";
import { useTransition } from "react";
import { Sparkles, Clock, Target, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createMockInterviewAction } from "@/features/interview/mock-actions";

const INTERVIEW_PRESETS = [
  {
    id: "Java Backend",
    title: "Java Backend",
    description: "Core Java, Spring Boot, JPA/Hibernate, Concurrency, Microservices & SQL",
    badge: "Most Popular",
    badgeVariant: "default" as const,
  },
  {
    id: "Technical",
    title: "Technical (Broad)",
    description: "CS fundamentals, DBMS, Operating Systems, Computer Networks & REST APIs",
    badge: "Comprehensive",
    badgeVariant: "secondary" as const,
  },
  {
    id: "Full Stack",
    title: "Full Stack",
    description: "Java Backend + React, TypeScript, Next.js, Node.js & Database design",
    badge: "Web & API",
    badgeVariant: "secondary" as const,
  },
  {
    id: "Project-Based",
    title: "Project Defense",
    description: "Lovable AI Builder, TCS E-Procurement, Microservices & Architecture",
    badge: "Resume Deep Dive",
    badgeVariant: "outline" as const,
  },
  {
    id: "DSA",
    title: "DSA & System Design",
    description: "Data Structures, Algorithmic thinking, LLD & High-Level Design",
    badge: "Problem Solving",
    badgeVariant: "outline" as const,
  },
  {
    id: "Mixed",
    title: "Adaptive Mixed",
    description: "Balanced selection across all 42 interview question-bank skills",
    badge: "Unpredictable",
    badgeVariant: "outline" as const,
  },
];

const AVAILABLE_SKILLS = [
  "Java",
  "Spring Boot",
  "Spring Framework / Spring Core",
  "Spring Security",
  "Hibernate and JPA",
  "Microservices",
  "REST APIs",
  "SQL",
  "MySQL",
  "PostgreSQL / pgvector (project experience)",
  "Apache Kafka",
  "Docker",
  "Kubernetes",
  "DBMS Fundamentals",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Low-Level Design",
  "High-Level Design",
  "Operating Systems",
  "Computer Networks",
  "Lovable AI Builder Project Deep Dive",
  "TCS E-Procurement Project Deep Dive",
];

export function MockInterviewSetupForm() {
  const [isPending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = React.useState<string>("Java Backend");
  const [difficulty, setDifficulty] = React.useState<string>("medium");
  const [questionCount, setQuestionCount] = React.useState<number>(5);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [showSkillPicker, setShowSkillPicker] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const durationEstimate = questionCount * 3;

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("interviewType", selectedType);
    formData.set("difficulty", difficulty);
    formData.set("questionCount", String(questionCount));
    selectedSkills.forEach((s) => formData.append("skills", s));

    startTransition(async () => {
      try {
        await createMockInterviewAction(formData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to launch interview session.");
      }
    });
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Configure Technical Mock Interview</CardTitle>
            <CardDescription className="text-sm">
              Practice real interview questions scored objectively by Google Gemini against curated rubrics.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
              {error}
            </div>
          )}

          {/* 1. Track / Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" />
              1. Choose Interview Track
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTERVIEW_PRESETS.map((preset) => {
                const isSelected = selectedType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(preset.id);
                      setSelectedSkills([]); // reset custom overrides
                    }}
                    className={`p-3.5 text-left rounded-lg border transition-all text-sm relative flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {preset.title}
                        </span>
                        <Badge variant={preset.badgeVariant} className="text-[10px] px-1.5 py-0 h-4">
                          {preset.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-indigo-600 dark:text-indigo-400 text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Difficulty & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                2. Target Difficulty
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {[
                  { id: "easy", label: "Easy" },
                  { id: "medium", label: "Medium" },
                  { id: "hard", label: "Hard" },
                  { id: "mixed", label: "Mixed" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                      difficulty === d.id
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                3. Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {[
                  { count: 5, label: "5 Questions" },
                  { count: 10, label: "10 Questions" },
                  { count: 15, label: "15 Questions" },
                ].map((qc) => (
                  <button
                    key={qc.count}
                    type="button"
                    onClick={() => setQuestionCount(qc.count)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                      questionCount === qc.count
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {qc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Skill Customization Toggle */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/30">
            <button
              type="button"
              onClick={() => setShowSkillPicker(!showSkillPicker)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600"
            >
              <span>
                Optional: Target specific skills ({selectedSkills.length > 0 ? `${selectedSkills.length} selected` : "default for track"})
              </span>
              {showSkillPicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSkillPicker && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-2">
                  Select specific technologies you want included in this mock session:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Duration Summary & Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Estimated duration: <strong className="text-slate-700 dark:text-slate-300">~{durationEstimate} minutes</strong> ({questionCount} questions × ~3 mins)
              </span>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Workspace...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start Mock Interview
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
