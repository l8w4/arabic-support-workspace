"use client";

import { useLang } from "@/lib/i18n/context";
import type { ProgressRating } from "@/lib/types";

export default function ProgressBadge({ rating }: { rating: ProgressRating | null }) {
  const { t } = useLang();

  if (!rating) {
    return (
      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t("noRatingYet")}</span>
    );
  }

  return (
    <span className={`status-${rating} text-xs px-2 py-0.5 rounded-full font-medium`}>
      {t(`progress_${rating}` as any)}
    </span>
  );
}
