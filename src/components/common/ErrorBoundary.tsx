import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <h2 className="text-lg font-semibold text-preto">Something went wrong</h2>
                    <p className="text-sm text-verde/70">An unexpected error occurred.</p>
                    <a
                        href="/app/books"
                        className="text-sm text-telha hover:underline"
                    >
                        Back to Books
                    </a>
                </div>
            );
        }
        return this.props.children;
    }
}
