import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-areia bg-surface px-3 py-2 text-sm text-preto placeholder:text-areia focus:ring-2 focus:ring-telha focus:border-telha disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
