import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function getDashboardByRole(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "teacher") return "/teacher/dashboard";
  return "/student/dashboard";
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  const token = localStorage.getItem("token");

  let role = localStorage.getItem("role");

  if (!role) {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        role = user?.role || "";
      }
    } catch (err) {
      console.error("Error parsing user data from local storage", err);
    }
  }

  role = String(role || "").toLowerCase().trim();

  // 1. Not authenticated
  if (!token || !role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("rememberMe");

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated but unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.warn(`Access denied: ${role} attempted to access ${location.pathname}`);
    return <Navigate to={getDashboardByRole(role)} replace />;
  }

  // 3. Authorized
  return children;
}
