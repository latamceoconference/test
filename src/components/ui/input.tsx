import * as React from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-black/10 bg-white/70 px-3 text-sm text-black outline-none placeholder:text-black/35 focus:ring-2 focus:ring-black/10",
        className
      )}
      {...props}
    />
  );
}




