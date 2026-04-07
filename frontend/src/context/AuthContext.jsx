import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_INIT":       return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":    return { user: action.payload, loading: false, error: null };
    case "AUTH_FAILURE":    return { user: null, loading: false, error: action.payload };
    case "AUTH_LOGOUT":     return { user: null, loading: false, error: null };
    case "UPDATE_USER":     return { ...state, user: { ...state.user, ...action.payload } };
    default:                return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ─── Bootstrap: restore session on mount ─────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        dispatch({ type: "AUTH_FAILURE", payload: null });
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        dispatch({ type: "AUTH_SUCCESS", payload: data.user });
      } catch {
        localStorage.clear();
        dispatch({ type: "AUTH_FAILURE", payload: null });
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: "AUTH_INIT" });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      dispatch({ type: "AUTH_SUCCESS", payload: data.user });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (formData) => {
    dispatch({ type: "AUTH_INIT" });
    try {
      const { data } = await authAPI.register(formData);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      dispatch({ type: "AUTH_SUCCESS", payload: data.user });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.clear();
    dispatch({ type: "AUTH_LOGOUT" });
  }, []);

  // ─── RBAC helpers ─────────────────────────────────────────────────────────
  const can = useCallback(
    (permission) => state.user?.permissions?.includes(permission) ?? false,
    [state.user]
  );

  const hasRole = useCallback(
    (...roles) => roles.includes(state.user?.role),
    [state.user]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, can, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
