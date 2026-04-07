// BoardPage.jsx
import { useTasks, useProjects } from "../hooks/useData";

const STATUSES = ["backlog","todo","in_progress","in_review","done"];
const STATUS_LABELS = { backlog:"Backlog", todo:"To Do", in_progress:"In Progress", in_review:"In Review", done:"Done" };
const STATUS_COLORS = { backlog:"#64748b", todo:"#3b82f6", in_progress:"#f59e0b", in_review:"#8b5cf6", done:"#10b981" };
const PRIORITY_COLORS = { low:"#64748b", medium:"#3b82f6", high:"#f59e0b", critical:"#ef4444" };

export function BoardPage() {
  const { data: tasks, loading, updateTask } = useTasks({ limit: 100 });
  const { projects } = useProjects();

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  if (loading) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#334155" }}>Loading board...</div>;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #1e293b", background: "#0a0f1e", flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Kanban Board</h1>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#334155", marginTop: 2 }}>{tasks.length} tasks across {STATUSES.length} columns</div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", display: "flex", gap: 14 }}>
        {STATUSES.map(status => (
          <div key={status} style={{ minWidth: 270, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#0f172a", borderRadius: 8, border: "1px solid #1e293b", borderTop: `3px solid ${STATUS_COLORS[status]}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[status] }} />
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{STATUS_LABELS[status]}</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#475569" }}>{byStatus[status].length}</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
              {byStatus[status].map(task => (
                <div key={task._id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: `3px solid ${task.project?.color || "#3b82f6"}`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "#e2e8f0", flex: 1, lineHeight: 1.4 }}>{task.title}</div>
                    <span style={{ background: PRIORITY_COLORS[task.priority] + "22", color: PRIORITY_COLORS[task.priority], border: `1px solid ${PRIORITY_COLORS[task.priority]}44`, padding: "1px 6px", borderRadius: 3, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase", flexShrink: 0 }}>{task.priority}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#475569" }}>{task.project?.icon} {task.project?.name}</div>
                  {task.dueDate && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#334155", marginTop: 4 }}>📅 {task.dueDate.split("T")[0]}</div>}
                  {task.estimatedHours > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 2, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((task.loggedHours / task.estimatedHours) * 100, 100)}%`, background: "#10b981", borderRadius: 2 }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {byStatus[status].length === 0 && (
                <div style={{ border: "1px dashed #1e293b", borderRadius: 8, padding: "20px", textAlign: "center", color: "#1e293b", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// UsersPage.jsx
import { useUsers } from "../hooks/useData";
import { useAuth } from "../context/AuthContext";
import { RoleGate } from "../components/ProtectedRoute";

const ROLE_COLORS = { admin:"#ef4444", manager:"#8b5cf6", developer:"#3b82f6", viewer:"#64748b" };
const ROLE_ICONS  = { admin:"👑", manager:"🎯", developer:"💻", viewer:"👁" };

export function UsersPage() {
  const { data: users, loading, updateRole, deactivate } = useUsers();
  const { user: currentUser, can } = useAuth();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #1e293b", background: "#0a0f1e", flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Users & Roles</h1>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#334155", marginTop: 2 }}>RBAC role management · {users.length} users</div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
        {loading ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#334155" }}>Loading users...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr 80px 120px", gap: 12, padding: "8px 16px" }}>
              {["USER","ROLE","PERMISSIONS","STATUS","ACTION"].map(h => (
                <div key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</div>
              ))}
            </div>
            {users.map(u => (
              <div key={u._id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 100px 1fr 80px 120px", gap: 12, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: ROLE_COLORS[u.role], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", flexShrink: 0 }}>
                    {u.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{u.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}>{u.email}</div>
                  </div>
                </div>
                <span style={{ background: ROLE_COLORS[u.role] + "22", color: ROLE_COLORS[u.role], border: `1px solid ${ROLE_COLORS[u.role]}44`, padding: "3px 8px", borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {ROLE_ICONS[u.role]} {u.role}
                </span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(u.permissions || []).slice(0, 3).map(p => (
                    <span key={p} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#475569", background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 3, padding: "1px 5px" }}>{p}</span>
                  ))}
                  {(u.permissions || []).length > 3 && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3b82f6" }}>+{u.permissions.length - 3}</span>}
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: u.isActive ? "#10b981" : "#ef4444" }}>● {u.isActive ? "Active" : "Off"}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {can("manage:roles") && u._id !== currentUser?._id && (
                    <select value={u.role} onChange={e => updateRole(u._id, e.target.value)}
                      style={{ background: "#0a0f1e", border: `1px solid ${ROLE_COLORS[u.role]}44`, borderRadius: 6, padding: "4px 6px", color: ROLE_COLORS[u.role], fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: "pointer", outline: "none" }}>
                      {["admin","manager","developer","viewer"].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ProjectsPage.jsx
import { useAuth as useAuthProjects } from "../context/AuthContext";

export function ProjectsPage() {
  const { projects, loading } = useProjects();
  const { can } = useAuthProjects();
  const STATUS_BG = { active:"#10b981", on_hold:"#f59e0b", completed:"#3b82f6", archived:"#64748b" };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #1e293b", background: "#0a0f1e", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Projects</h1>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#334155", marginTop: 2 }}>{projects.length} projects</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
        {loading ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#334155" }}>Loading projects...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {projects.map(p => (
              <div key={p._id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderTop: `4px solid ${p.color || "#3b82f6"}`, borderRadius: 12, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 28 }}>{p.icon}</div>
                  <span style={{ background: STATUS_BG[p.status] + "22", color: STATUS_BG[p.status], border: `1px solid ${STATUS_BG[p.status]}44`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase" }}>{p.status}</span>
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>{p.description}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}>
                    {p.memberCount || p.members?.length || 0} members
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#334155" }}>
                    owner: {p.owner?.name?.split(" ")[0] || "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardPage;
