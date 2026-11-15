import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border border-hairline bg-canvas-soft px-3.5 py-2 text-sm font-normal text-ink placeholder:text-body-mid transition-colors outline-none shadow-none focus-visible:border-white/35 aria-invalid:border-red-500/60 aria-invalid:focus-visible:border-red-400 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
