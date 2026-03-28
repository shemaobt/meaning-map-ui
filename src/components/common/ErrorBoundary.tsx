import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

function ErrorFallback() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <h2 className="text-lg font-semibold text-preto">{t("errorBoundary.title")}</h2>
            <p className="text-sm text-verde/70">{t("errorBoundary.message")}</p>
            <a
                href="/app/books"
                className="text-sm text-telha hover:underline"
            >
                {t("errorBoundary.backLink")}
            </a>
        </div>
    );
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
            return <ErrorFallback />;
        }
        return this.props.children;
    }
}
