// src/pages/DashboardPage.jsx
import { useTaskStats } from "../hooks/useData";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = { backlog: "#64748b", todo: "#3b82f6", in_progress: "#f59e0b", in_review: "#8b5cf6", done: "#10b981", cancelled: "#ef4444" };
const STATUS_LABELS = { backlog: "Backlog", todo: "To Do", in_progress: "In Progress", in_review: "In Review", done: "Done", cancelled: "Cancelled" };
const PRIORITY_COLORS = { low: "#64748b", medium: "#3b82f6", high: "#f59e0b", critical: "#ef4444" };

export function DashboardPage() {
  const { stats, loading } = useTaskStats();
  const { user } = useAuth();

  const byStatus = stats?.byStatus || [];
  const byPriority = stats?.byPriority || [];
  const overdue = stats?.overdue?.[0]?.count || 0;
  const completedThisWeek = stats?.completedThisWeek?.[0]?.count || 0;
  const total = byStatus.reduce((s, x) => s + x.count, 0);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Dashboard</h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#334155", marginTop: 4 }}>
          Welcome back, {user?.name} · {user?.role} view
        </p>
      </div>

      {loading ? (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#334155" }}>Loading stats...</div>
      ) : (
        <>
          {/* KPI Row */}
          <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
            {[
              { label: "Total Tasks", value: total, color: "#e2e8f0" },
              { label: "Completed (7d)", value: completedThisWeek, color: "#10b981" },
              { label: "Overdue", value: overdue, color: overdue > 0 ? "#ef4444" : "#64748b" },
              { label: "Critical Open", value: byPriority.find(p => p._id === "critical")?.count || 0, color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 140 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#64748b", marginTop: 6, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Status Distribution</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Object.entries(STATUS_LABELS).map(([key, label]) => {
                const entry = byStatus.find(s => s._id === key);
                const count = entry?.count || 0;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={key} style={{ flex: 1, minWidth: 90, textAlign: "center", background: "#0a0f1e", borderTop: `3px solid ${STATUS_COLORS[key]}`, borderRadius: 8, padding: "12px 8px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: STATUS_COLORS[key] }}>{count}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#334155", marginTop: 2 }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority breakdown */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Priority Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["critical", "high", "medium", "low"].map(priority => {
                const count = byPriority.find(p => p._id === priority)?.count || 0;
                const pct = total ? (count / total) * 100 : 0;
                return (
                  <div key={priority} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 64, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: PRIORITY_COLORS[priority], textTransform: "uppercase" }}>{priority}</div>
                    <div style={{ flex: 1, height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: PRIORITY_COLORS[priority], borderRadius: 3, transition: "width 0.4s ease" }} />
                    </div>
                    <div style={{ width: 28, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#475569", textAlign: "right" }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
