import { Loader2 } from "lucide-react";

// Shown instantly by Next.js the moment a sidebar link is clicked, while
// the target page's own data is still loading on the server — without
// this, the browser just sits on the old page with no feedback until the
// whole navigation finishes, which reads as the app being frozen.
export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      <Loader2 size={22} className="animate-spin" />
    </div>
  );
}
