import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-areia bg-surface px-3 py-2 text-sm text-preto placeholder:text-areia focus:ring-2 focus:ring-telha focus:border-telha disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
