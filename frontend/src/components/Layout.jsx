import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_COLORS = { admin: "#ef4444", manager: "#8b5cf6", developer: "#3b82f6", viewer: "#64748b" };
const ROLE_ICONS  = { admin: "👑", manager: "🎯", developer: "💻", viewer: "👁" };

const NAV = [
  { to: "/dashboard", icon: "▣", label: "Dashboard", minRole: "viewer" },
  { to: "/tasks",     icon: "✓", label: "Tasks",     minRole: "viewer" },
  { to: "/board",     icon: "⊞", label: "Board",     minRole: "viewer" },
  { to: "/projects",  icon: "◈", label: "Projects",  minRole: "viewer" },
  { to: "/users",     icon: "◎", label: "Users & Roles", permission: "manage:roles" },
];

const ROLE_RANK = { viewer: 0, developer: 1, manager: 2, admin: 3 };

export default function Layout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const navLinkStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    borderRadius: 8, textDecoration: "none", fontFamily: "'Syne', sans-serif",
    fontSize: 13, fontWeight: 600, transition: "all 0.15s", marginBottom: 2,
    background: isActive ? "#1e3a5f" : "transparent",
    color: isActive ? "#93c5fd" : "#64748b",
  });

  const visibleNav = NAV.filter((item) => {
    if (item.permission) return can(item.permission);
    if (item.minRole) return ROLE_RANK[user?.role] >= ROLE_RANK[item.minRole];
    return true;
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: "#060b14", color: "#e2e8f0", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#0a0f1e", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>
            Task<span style={{ color: "#3b82f6" }}>Master</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#334155", marginTop: 2 }}>MERN · RBAC · v1.0</div>
        </div>

        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {visibleNav.map((item) => (
            <NavLink key={item.to} to={item.to} style={navLinkStyle}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: ROLE_COLORS[user?.role] || "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
              {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <span style={{ background: ROLE_COLORS[user?.role] + "22", color: ROLE_COLORS[user?.role], border: `1px solid ${ROLE_COLORS[user?.role]}44`, padding: "1px 6px", borderRadius: 3, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase" }}>
                {ROLE_ICONS[user?.role]} {user?.role}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, padding: "7px", color: "#64748b", fontFamily: "'Syne', sans-serif", fontSize: 12, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
    </div>
  );
}
