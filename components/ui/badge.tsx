import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-[#e4f4ed] text-[#28785f]",
  blue: "bg-[#e6f5f8] text-[#397b84]",
  amber: "bg-[#fff2de] text-[#bf7624]",
  muted: "bg-slate-100 text-slate-500",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
