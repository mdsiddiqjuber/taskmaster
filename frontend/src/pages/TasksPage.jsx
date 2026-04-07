import { useState } from "react";
import { useTasks } from "../hooks/useData";
import { useProjects } from "../hooks/useData";
import { useAuth } from "../context/AuthContext";
import { PermissionGate } from "../components/ProtectedRoute";

const STATUS_LABELS = { backlog:"Backlog", todo:"To Do", in_progress:"In Progress", in_review:"In Review", done:"Done", cancelled:"Cancelled" };
const STATUS_COLORS = { backlog:"#64748b", todo:"#3b82f6", in_progress:"#f59e0b", in_review:"#8b5cf6", done:"#10b981", cancelled:"#ef4444" };
const PRIORITY_COLORS = { low:"#64748b", medium:"#3b82f6", high:"#f59e0b", critical:"#ef4444" };

const Badge = ({ label, color }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
);

export default function TasksPage() {
  const { can, user } = useAuth();
  const { projects } = useProjects();
  const { data: tasks, loading, pagination, updateParams, goToPage, updateTask, createTask } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ status: "", priority: "", project: "", search: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", project: "", dueDate: "", estimatedHours: "" });
  const [creating, setCreating] = useState(false);

  const applyFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    const params = {};
    Object.entries(updated).forEach(([k, v]) => { if (v) params[k] = v; });
    updateParams(params);
  };

  const handleCreate = async () => {
    if (!newTask.title || !newTask.project) return;
    setCreating(true);
    try {
      await createTask({ ...newTask, estimatedHours: Number(newTask.estimatedHours) || 0 });
      setShowCreate(false);
      setNewTask({ title: "", description: "", priority: "medium", project: "", dueDate: "", estimatedHours: "" });
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const fieldStyle = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const selStyle = { ...fieldStyle, cursor: "pointer" };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #1e293b", background: "#0a0f1e", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Tasks</h1>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#334155", marginTop: 2 }}>{pagination.total} total · page {pagination.page}/{pagination.pages || 1}</div>
        </div>
        <PermissionGate permission="create:task">
          <button onClick={() => setShowCreate(true)} style={{ background: "#3b82f6", border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ New Task</button>
        </PermissionGate>
      </div>

      {/* Filters */}
      <div style={{ padding: "14px 28px", borderBottom: "1px solid #1e293b", background: "#0a0f1e", display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <input value={filters.search} onChange={e => applyFilter("search", e.target.value)} placeholder="Search tasks..."
          style={{ ...fieldStyle, width: 220 }} />
        <select value={filters.status} onChange={e => applyFilter("status", e.target.value)} style={selStyle}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.priority} onChange={e => applyFilter("priority", e.target.value)} style={selStyle}>
          <option value="">All Priorities</option>
          {["low","medium","high","critical"].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.project} onChange={e => applyFilter("project", e.target.value)} style={selStyle}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.icon} {p.name}</option>)}
        </select>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
        {loading ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#334155", padding: 20 }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#334155", fontFamily: "'Syne', sans-serif", fontSize: 14 }}>No tasks found</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map(task => {
              const isOverdue = task.dueDate && task.status !== "done" && new Date() > new Date(task.dueDate);
              return (
                <div key={task._id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: `3px solid ${task.project?.color || "#3b82f6"}`, borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#e2e8f0", flex: 1 }}>{task.title}</div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <Badge label={task.priority} color={PRIORITY_COLORS[task.priority]} />
                      <Badge label={STATUS_LABELS[task.status]} color={STATUS_COLORS[task.status]} />
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>{task.description}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}>
                      {task.project?.icon} {task.project?.name}
                      {task.dueDate && <span style={{ marginLeft: 12, color: isOverdue ? "#ef4444" : "#475569" }}>📅 {task.dueDate.split("T")[0]}</span>}
                    </div>
                    {(can("update:any") || (user.role === "developer" && task.assignees?.some(a => a._id === user._id))) && (
                      <select value={task.status} onChange={e => updateTask(task._id, { status: e.target.value })}
                        style={{ background: STATUS_COLORS[task.status] + "22", color: STATUS_COLORS[task.status], border: `1px solid ${STATUS_COLORS[task.status]}44`, borderRadius: 4, padding: "3px 8px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", outline: "none" }}>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => goToPage(page)}
                style={{ background: page === pagination.page ? "#3b82f6" : "#0f172a", border: "1px solid #1e293b", borderRadius: 6, padding: "6px 12px", color: page === pagination.page ? "#fff" : "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, cursor: "pointer" }}>
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowCreate(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: "100%", maxWidth: 520 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>New Task</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input value={newTask.title} onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))} placeholder="Task title *" style={fieldStyle} />
              <textarea value={newTask.description} onChange={e => setNewTask(n => ({ ...n, description: e.target.value }))} rows={3} placeholder="Description..." style={{ ...fieldStyle, resize: "vertical" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <select value={newTask.project} onChange={e => setNewTask(n => ({ ...n, project: e.target.value }))} style={selStyle}>
                  <option value="">Select project *</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.icon} {p.name}</option>)}
                </select>
                <select value={newTask.priority} onChange={e => setNewTask(n => ({ ...n, priority: e.target.value }))} style={selStyle}>
                  {["low","medium","high","critical"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input type="date" value={newTask.dueDate} onChange={e => setNewTask(n => ({ ...n, dueDate: e.target.value }))} style={{ ...fieldStyle, colorScheme: "dark" }} />
                <input type="number" value={newTask.estimatedHours} onChange={e => setNewTask(n => ({ ...n, estimatedHours: e.target.value }))} placeholder="Est. hours" style={fieldStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "11px", color: "#94a3b8", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreate} disabled={creating} style={{ flex: 2, background: "#3b82f6", border: "none", borderRadius: 8, padding: "11px", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {creating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
