"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-hairline bg-canvas-soft p-0.5 transition-colors outline-none focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-45 data-[checked]:border-white/40 data-[checked]:bg-white",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-3.5 rounded-full bg-body-mid transition-transform data-[checked]:translate-x-4 data-[checked]:bg-canvas"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
