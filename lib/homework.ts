import type { HomeworkStatus } from "@/lib/types";

export const HOMEWORK_STATUSES: HomeworkStatus[] = ["completed", "partial", "needs_support", "not_done"];

// Reuses the shared status palette; the label text always accompanies the color.
export const HOMEWORK_STATUS_CLASS: Record<HomeworkStatus, string> = {
  completed: "status-present",
  partial: "status-late",
  needs_support: "status-excused",
  not_done: "status-absent",
};
