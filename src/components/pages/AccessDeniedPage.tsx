import { useAuth } from "../../contexts/AuthContext";

export function AccessDeniedPage() {
    const { user, accessRequestStatus, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    const isPending = accessRequestStatus === "pending";

    return (
        <div className="min-h-screen bg-branco flex items-center justify-center p-4 sm:p-6">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 rounded-full bg-areia/30 flex items-center justify-center mx-auto mb-4">
                        {isPending ? (
                            <svg
                                className="w-8 h-8 text-azul"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-8 h-8 text-telha"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                />
                            </svg>
                        )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-preto mb-2">
                        {isPending ? "Access Pending" : "Access Restricted"}
                    </h1>
                    <p className="text-verde/70 text-sm leading-relaxed">
                        {isPending
                            ? "Your access request has been submitted and is awaiting admin approval. You'll be able to use the app once approved."
                            : "Your account doesn't have access to the Meaning Map application. Please contact support to request access."}
                    </p>
                </div>

                {user && (
                    <div className="bg-areia/20 rounded-lg p-4 mb-6 text-left">
                        <p className="text-xs text-verde/60 mb-1">Signed in as</p>
                        <p className="text-sm font-medium text-preto">{user.email}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleLogout}
                        className="block w-full rounded-md border border-areia/40 px-4 py-2.5 text-sm font-medium text-preto hover:bg-areia/10 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
