import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-card/90 p-5 shadow-glow transition duration-200 hover:-translate-y-0.5 hover:border-white/20",
        className,
      )}
    >
      {children}
    </div>
  );
}
