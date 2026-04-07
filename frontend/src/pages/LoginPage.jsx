import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "" });
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    const result = mode === "login"
      ? await login(form.email, form.password)
      : await register(form);

    if (result.success) {
      navigate("/");
    } else {
      setLocalError(result.message);
    }
  };

  const s = {
    page: { minHeight: "100vh", background: "#060b14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", padding: 20 },
    card: { background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 25px 80px rgba(0,0,0,0.6)" },
    logo: { fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 },
    sub: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#334155", marginBottom: 32 },
    label: { display: "block", fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 },
    input: { width: "100%", background: "#060b14", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
    btn: { width: "100%", background: "#3b82f6", border: "none", borderRadius: 8, padding: "13px", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 },
    error: { background: "#2a0f0f", border: "1px solid #ef444444", borderRadius: 8, padding: "10px 14px", color: "#fc8181", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginBottom: 16 },
    toggle: { textAlign: "center", marginTop: 20, fontFamily: "'Syne', sans-serif", fontSize: 13, color: "#64748b" },
    toggleLink: { color: "#3b82f6", cursor: "pointer", fontWeight: 600, textDecoration: "none", background: "none", border: "none" },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Task<span style={{ color: "#3b82f6" }}>Master</span></div>
        <div style={s.sub}>MERN · RBAC · Scalable API</div>

        {(error || localError) && <div style={s.error}>⚠ {localError || error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <>
              <div>
                <label style={s.label}>Full Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Siddiq Ahmed" style={s.input} />
              </div>
              <div>
                <label style={s.label}>Department</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  placeholder="Engineering" style={s.input} />
              </div>
            </>
          )}
          <div>
            <label style={s.label}>Email</label>
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@company.io" style={s.input} />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" style={s.input} />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={s.toggle}>
          {mode === "login" ? "No account?" : "Already registered?"}{" "}
          <button style={s.toggleLink} onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </div>

        {mode === "login" && (
          <div style={{ marginTop: 24, padding: "14px", background: "#060b14", border: "1px solid #1e293b", borderRadius: 8 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#334155", marginBottom: 8 }}>DEMO CREDENTIALS</div>
            {[
              { label: "Admin", email: "arjun@taskmaster.io" },
              { label: "Manager", email: "priya@taskmaster.io" },
              { label: "Developer", email: "rahul@taskmaster.io" },
            ].map(({ label, email }) => (
              <button key={email} onClick={() => setForm({ ...form, email, password: "password123" })}
                style={{ display: "block", width: "100%", background: "none", border: "none", textAlign: "left", padding: "4px 0", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}>
                → [{label}] {email}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
