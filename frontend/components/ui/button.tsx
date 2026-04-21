import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const styles = {
    primary: "bg-accent-blue text-slate-950 hover:bg-sky-300",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    ghost: "bg-transparent text-slate-300 hover:bg-white/5",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-200",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
