import type { GradeEntry } from "@/lib/types";

export function percentOf(g: Pick<GradeEntry, "score" | "max_score">) {
  return g.max_score > 0 ? Math.round((Number(g.score) / Number(g.max_score)) * 1000) / 10 : 0;
}

export function averagePercent(entries: Pick<GradeEntry, "score" | "max_score">[]) {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, g) => acc + percentOf(g), 0);
  return Math.round((sum / entries.length) * 10) / 10;
}
