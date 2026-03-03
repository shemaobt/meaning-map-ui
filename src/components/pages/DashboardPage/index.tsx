import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { booksAPI } from "../../../services/api";
import type { BibleBook, PericopeWithStatus } from "../../../types/bible";
import { useAuth } from "../../../contexts/AuthContext";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { cn } from "../../../utils/cn";

interface StatusCounts {
  total: number;
  draft: number;
  cross_check: number;
  approved: number;
  unstarted: number;
}

interface AnalystRow {
  name: string;
  assigned: number;
  draft: number;
  cross_check: number;
  approved: number;
}

function countStatuses(pericopes: PericopeWithStatus[]): StatusCounts {
  const counts: StatusCounts = { total: 0, draft: 0, cross_check: 0, approved: 0, unstarted: 0 };
  for (const p of pericopes) {
    counts.total++;
    if (!p.status) counts.unstarted++;
    else if (p.status === "draft") counts.draft++;
    else if (p.status === "cross_check") counts.cross_check++;
    else if (p.status === "approved") counts.approved++;
  }
  return counts;
}

function buildAnalystTable(pericopes: PericopeWithStatus[]): AnalystRow[] {
  const map = new Map<string, AnalystRow>();
  for (const p of pericopes) {
    const name = p.analyst_name ?? "Unassigned";
    if (!p.meaning_map_id) continue;
    let row = map.get(name);
    if (!row) {
      row = { name, assigned: 0, draft: 0, cross_check: 0, approved: 0 };
      map.set(name, row);
    }
    row.assigned++;
    if (p.status === "draft") row.draft++;
    else if (p.status === "cross_check") row.cross_check++;
    else if (p.status === "approved") row.approved++;
  }
  return Array.from(map.values()).sort((a, b) => b.assigned - a.assigned);
}

const STATUS_CARDS: { key: keyof StatusCounts; label: string; color: string; bgColor: string }[] = [
  { key: "total", label: "Total Pericopes", color: "text-preto", bgColor: "bg-areia/20" },
  { key: "draft", label: "Draft", color: "text-verde", bgColor: "bg-areia/30" },
  { key: "cross_check", label: "Cross-check", color: "text-telha", bgColor: "bg-telha/10" },
  { key: "approved", label: "Approved", color: "text-verde-claro", bgColor: "bg-verde-claro/20" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, appRole } = useAuth();
  const isAdmin = appRole === "admin";
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<StatusCounts>({ total: 0, draft: 0, cross_check: 0, approved: 0, unstarted: 0 });
  const [analysts, setAnalysts] = useState<AnalystRow[]>([]);
  const [enabledBooks, setEnabledBooks] = useState<BibleBook[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const books = await booksAPI.list();
        const enabled = books.filter((b) => b.is_enabled);
        if (cancelled) return;
        setEnabledBooks(enabled);

        const allPericopes: PericopeWithStatus[] = [];
        const results = await Promise.all(
          enabled.map((b) => booksAPI.getAllPericopes(b.id).catch(() => [] as PericopeWithStatus[]))
        );
        for (const pericopeList of results) {
          allPericopes.push(...pericopeList);
        }

        if (cancelled) return;

        // Non-admins only see their own pericopes (matched by display_name)
        const userName = user?.display_name ?? user?.email ?? "";
        const visible = isAdmin
          ? allPericopes
          : allPericopes.filter((p) => p.analyst_name === userName);

        setCounts(countStatuses(visible));
        setAnalysts(isAdmin ? buildAnalystTable(allPericopes) : []);
      } catch {
        // silently handle
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user, isAdmin]);

  if (loading) return <LoadingSpinner />;

  const approvedPct = counts.total > 0 ? Math.round((counts.approved / counts.total) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-areia/20 text-telha shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-preto">Dashboard</h2>
          <p className="text-xs sm:text-sm text-verde/70">
            {isAdmin
              ? "Overview of meaning map progress across all enabled books."
              : "Your meaning map progress across all enabled books."}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {STATUS_CARDS.map((card) => (
          <Card key={card.key}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", card.bgColor)}>
                  <span className={cn("text-lg font-bold", card.color)}>{counts[card.key]}</span>
                </div>
                <div>
                  <p className="text-xs text-verde/60 font-medium">{card.label}</p>
                  {card.key === "total" ? (
                    <p className="text-xs text-verde/40">{enabledBooks.length} books enabled</p>
                  ) : (
                    <p className="text-xs text-verde/40">
                      {counts.total > 0
                        ? `${Math.round((counts[card.key] / counts.total) * 100)}%`
                        : "0%"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Progress */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {isAdmin ? "Overall Progress" : "Your Progress"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={approvedPct} className="h-2.5 flex-1" />
            <span className="text-sm font-semibold text-verde/70 shrink-0">{approvedPct}%</span>
          </div>
          <p className="text-xs text-verde/50 mt-2">
            {counts.approved} of {counts.total} pericopes approved
          </p>
        </CardContent>
      </Card>

      {/* Per-Analyst Table (admin only) */}
      {isAdmin && analysts.length > 0 && (
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progress by Analyst</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-areia/30">
                    <th className="text-left py-2.5 pr-4 text-xs font-semibold text-verde/60 uppercase tracking-wider">Analyst</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-verde/60 uppercase tracking-wider">Assigned</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-verde/60 uppercase tracking-wider">Draft</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-verde/60 uppercase tracking-wider">Cross-check</th>
                    <th className="text-right py-2.5 pl-3 text-xs font-semibold text-verde/60 uppercase tracking-wider">Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {analysts.map((row) => (
                    <tr key={row.name} className="border-b border-areia/15 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-preto">{row.name}</td>
                      <td className="py-2.5 px-3 text-right text-verde/70">{row.assigned}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center rounded-full bg-areia/30 px-2 py-0.5 text-xs font-medium text-verde">
                          {row.draft}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center rounded-full bg-telha/10 px-2 py-0.5 text-xs font-medium text-telha">
                          {row.cross_check}
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <span className="inline-flex items-center rounded-full bg-verde-claro/20 px-2 py-0.5 text-xs font-medium text-verde-claro">
                          {row.approved}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {enabledBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => navigate(`/app/books/${book.id}`)}
                className="rounded-lg border border-areia/30 px-3 py-1.5 text-sm font-medium text-verde/70 hover:border-telha/30 hover:text-telha transition-colors"
              >
                {book.abbreviation}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
