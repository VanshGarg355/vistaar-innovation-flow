import logo from "@/assets/vistaar-logo.png";
import { cn } from "@/lib/utils";

export function VistaarLogo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <img
      src={logo}
      alt="VISTAAR logo"
      width={size}
      height={size}
      className={cn("shrink-0 drop-shadow-[0_0_18px_rgba(124,58,237,0.45)]", className)}
    />
  );
}

export function VistaarWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <VistaarLogo size={compact ? 28 : 34} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-[0.22em] gradient-text">
          VISTAAR
        </span>
        {!compact && (
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Innovation Lifecycle OS
          </span>
        )}
      </span>
    </span>
  );
}
