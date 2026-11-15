"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "@/lib/utils";

function RadioGroup<Value>({
  className,
  ...props
}: RadioGroupPrimitive.Props<Value>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-1.5", className)}
      {...props}
    />
  );
}

function RadioItem<Value>({
  className,
  ...props
}: RadioPrimitive.Root.Props<Value>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-item"
      className={cn(
        "flex h-9 cursor-pointer items-center justify-center rounded-lg border border-hairline bg-canvas-soft text-body-mid transition-colors outline-none select-none hover:border-white/25 hover:text-ink focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/25 data-[checked]:border-white data-[checked]:bg-white data-[checked]:text-canvas",
        className
      )}
      {...props}
    />
  );
}

export { RadioGroup, RadioItem };
