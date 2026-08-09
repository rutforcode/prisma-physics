import { cn } from "@/lib/utils";

/**
 * Light glassmorphism backdrop: a bright cool-toned canvas with softly blurred
 * color fields, a faint dot grid, and a top sheen. Rendered fixed behind all
 * content so translucent panels have something luminous to blur.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className,
      )}
    >
      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.99 0.006 255) 0%, oklch(0.97 0.02 248) 45%, oklch(0.965 0.028 235) 100%)",
        }}
      />
      {/* Dot grid texture */}
      <div className="bg-dots absolute inset-0 opacity-70" />
      {/* Color fields */}
      <div className="absolute -top-32 left-1/2 h-[34rem] w-[54rem] -translate-x-1/2 rounded-full bg-sky-300/35 blur-[110px]" />
      <div className="absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-300/35 blur-[120px]" />
      <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-200/45 blur-[120px]" />
      <div className="absolute bottom-[-14rem] left-1/3 h-[26rem] w-[40rem] rounded-full bg-violet-200/35 blur-[130px]" />
      {/* Top edge sheen */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/80 to-transparent" />
    </div>
  );
}
