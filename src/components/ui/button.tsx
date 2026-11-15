import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-normal whitespace-nowrap transition-colors outline-none select-none shadow-none cursor-pointer focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/25 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-white bg-primary text-primary-foreground hover:bg-neutral-200",
        outline:
          "border-white/25 bg-transparent text-ink hover:border-white hover:bg-canvas-soft/60",
        secondary:
          "border-hairline bg-canvas-soft text-body hover:border-white/25 hover:text-ink",
        ghost:
          "border-transparent bg-transparent text-body-mid hover:bg-canvas-soft hover:text-ink",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/60 hover:bg-red-500/20",
        link: "border-transparent text-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-2 px-5 py-2",
        xs: "h-7 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-4 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-6 text-sm",
        icon: "size-9 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "outline",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
