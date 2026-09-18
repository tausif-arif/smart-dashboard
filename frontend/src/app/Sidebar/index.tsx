import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Lightbulb, BarChart2, Users, Package, Database, Settings } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

const NAV = [
  { to: "/", icon: <LayoutDashboard size={16} />, label: "Overview", end: true },
  { to: "/ask", icon: <MessageSquare size={16} />, label: "Ask Anything" },
  { to: "/insights", icon: <Lightbulb size={16} />, label: "Insights" },
  { to: "/sales", icon: <BarChart2 size={16} />, label: "Sales" },
  { to: "/customers", icon: <Users size={16} />, label: "Customers" },
  { to: "/products", icon: <Package size={16} />, label: "Products" },
  { to: "/data-status", icon: <Database size={16} />, label: "Data Status" },
];

export function Sidebar() {
  return (
    <nav style={{
      width: 220,
      minWidth: 220,
      background: "var(--canvas-elevated)",
      borderRight: "1px solid var(--hairline)",
      display: "flex",
      flexDirection: "column",
      padding: "20px 0",
      height: "100vh",
      position: "sticky",
      top: 0,
      overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "0 16px 20px", borderBottom: "1px solid var(--hairline)", marginBottom: 8 }}>
        <span style={{ fontWeight: 900, fontSize: "0.95rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>
          {BRAND_CONFIG.shortName}
        </span>
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px" }}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8rem",
              fontWeight: isActive ? 700 : 400,
              color: isActive ? "var(--ink)" : "var(--body)",
              background: isActive ? "var(--hairline-soft)" : "transparent",
              textDecoration: "none",
              transition: "background 0.1s, color 0.1s",
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
