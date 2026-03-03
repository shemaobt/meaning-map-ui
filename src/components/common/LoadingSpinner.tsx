import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={cn("animate-spin text-telha", className)} size={size} />
    </div>
  );
}
