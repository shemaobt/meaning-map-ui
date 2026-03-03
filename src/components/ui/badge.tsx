import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-areia/30 text-verde",
        draft: "bg-areia/30 text-verde",
        inReview: "bg-azul/20 text-azul",
        crossCheck: "bg-telha/10 text-telha",
        approved: "bg-verde-claro/20 text-verde-claro",
        locked: "bg-red-100 text-red-700",
        ot: "bg-verde-claro/20 text-verde-claro",
        nt: "bg-areia/20 text-areia",
        warning: "bg-amber-100 text-amber-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
