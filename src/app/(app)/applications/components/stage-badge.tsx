import { Badge } from "@/components/ui/badge";
import { type ApplicationStage, stageLabels } from "@/features/applications/schema";

const stageStyles: Record<ApplicationStage, { bg: string; text: string; border: string }> = {
  interested: {
    bg: "bg-neutral-900/80",
    text: "text-neutral-300",
    border: "border-neutral-700",
  },
  applied: {
    bg: "bg-blue-950/70",
    text: "text-blue-300",
    border: "border-blue-800/60",
  },
  referral_requested: {
    bg: "bg-purple-950/70",
    text: "text-purple-300",
    border: "border-purple-800/60",
  },
  screening: {
    bg: "bg-cyan-950/70",
    text: "text-cyan-300",
    border: "border-cyan-800/60",
  },
  technical_round_1: {
    bg: "bg-amber-950/70",
    text: "text-amber-300",
    border: "border-amber-800/60",
  },
  technical_round_2: {
    bg: "bg-amber-950/80",
    text: "text-amber-200",
    border: "border-amber-700/70",
  },
  managerial_round: {
    bg: "bg-orange-950/70",
    text: "text-orange-300",
    border: "border-orange-800/60",
  },
  hr: {
    bg: "bg-indigo-950/70",
    text: "text-indigo-300",
    border: "border-indigo-800/60",
  },
  offer: {
    bg: "bg-emerald-950/80",
    text: "text-emerald-300",
    border: "border-emerald-700/80",
  },
  rejected: {
    bg: "bg-rose-950/60",
    text: "text-rose-300",
    border: "border-rose-900/60",
  },
  on_hold: {
    bg: "bg-neutral-800/70",
    text: "text-neutral-400",
    border: "border-neutral-700",
  },
};

export function StageBadge({ stage }: { stage: ApplicationStage }) {
  const style = stageStyles[stage] || stageStyles.interested;
  const label = stageLabels[stage] || stage;

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
    >
      {label}
    </Badge>
  );
}
