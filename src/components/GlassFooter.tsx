import { Atom } from "lucide-react";
import { Link } from "react-router";

export function GlassFooter() {
  return (
    <footer className="border-t border-white/50 bg-white/25 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="glass-chip flex size-8 items-center justify-center rounded-lg text-primary">
            <Atom className="size-4" />
          </span>
          <span className="font-display font-semibold tracking-tight">
            Prism
          </span>
          <span className="text-xs text-muted-foreground">
            Physics, made clear.
          </span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Built by <span className="font-semibold text-foreground">Rutforcode</span>{" "}
          with 🩷
        </p>
      </div>
    </footer>
  );
}
