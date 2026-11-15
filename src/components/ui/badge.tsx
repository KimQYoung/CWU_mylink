import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-normal uppercase tracking-[1.2px] transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-hairline bg-canvas-soft text-body",
        active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        muted: "border-hairline bg-canvas text-body-mid",
        accent: "border-sunset/30 bg-sunset/10 text-sunset",
        outline: "border-white/25 bg-transparent text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
