import { useEffect, useState } from "react";
import { BookOpen, Sparkles, Brain, CheckCircle, Circle, Loader2 } from "lucide-react";

const STEPS = [
    { label: "Extracting Hebrew data...", icon: BookOpen, delay: 2000 },
    { label: "Querying methodology...", icon: Sparkles, delay: 3000 },
    { label: "Generating with AI...", icon: Brain, delay: 0 },
];

interface GenerationOverlayProps {
    isActive: boolean;
}

export function GenerationOverlay({ isActive }: GenerationOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!isActive) return;
        const timers: ReturnType<typeof setTimeout>[] = [];
        let elapsed = 0;
        for (let i = 0; i < STEPS.length - 1; i++) {
            elapsed += STEPS[i].delay;
            const step = i + 1;
            timers.push(setTimeout(() => setCurrentStep(step), elapsed));
        }
        return () => {
            timers.forEach(clearTimeout);
            setCurrentStep(0);
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="space-y-2 py-1">
            {STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isDone = i < currentStep;
                const isCurrent = i === currentStep;

                return (
                    <div
                        key={step.label}
                        className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
                            isDone || isCurrent ? "opacity-100" : "opacity-40"
                        }`}
                    >
                        {isDone ? (
                            <CheckCircle className="h-4 w-4 text-verde-claro shrink-0" />
                        ) : isCurrent ? (
                            <Loader2 className="h-4 w-4 animate-spin text-telha shrink-0" />
                        ) : (
                            <Circle className="h-4 w-4 text-areia shrink-0" />
                        )}
                        <StepIcon className={`h-3.5 w-3.5 shrink-0 ${
                            isDone ? "text-verde-claro" : isCurrent ? "text-telha" : "text-areia"
                        }`} />
                        <span className={
                            isDone ? "text-verde-claro" : isCurrent ? "text-preto font-medium" : "text-verde/50"
                        }>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
