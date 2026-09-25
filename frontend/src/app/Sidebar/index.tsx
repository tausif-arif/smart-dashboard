import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Lightbulb, BarChart2, Users, Package, Database, Menu, X, Moon, Sun } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark") || 
           (localStorage.theme === "dark") || 
           (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [isDark]);

  // Close drawer on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden h-[52px] bg-canvas-elevated border-b border-hairline flex items-center justify-between px-4 sticky top-0 z-40">
        <span className="font-semibold text-ink text-[16px] tracking-tight">
          {BRAND_CONFIG.shortName}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDark(!isDark)} className="p-1.5 text-mute hover:text-ink transition-colors">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn-ghost-sm h-[32px] px-2 flex items-center gap-1.5"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
            <span className="text-body-sm font-medium">Menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-ink/20 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Drawer / Permanent Sidebar */}
      <aside
        className={`fixed md:sticky top-[52px] md:top-0 bottom-0 left-0 w-[240px] bg-canvas-elevated border-r border-hairline z-50 flex flex-col pt-4 md:pt-6 pb-4 transform transition-transform duration-200 ease-in-out md:translate-x-0 overflow-y-auto ${
          isOpen ? "translate-x-0 shadow-floating" : "-translate-x-full md:shadow-none"
        }`}
      >
        <div className="hidden md:block px-4 mb-6 border-b border-hairline-soft pb-4">
          <span className="font-semibold text-[16px] text-ink tracking-tight">
            {BRAND_CONFIG.shortName}
          </span>
        </div>
        
        <div className="px-3 flex-1 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-sm text-body-md transition-colors ${
                  isActive
                    ? "bg-hairline-soft text-ink font-medium"
                    : "text-body hover:bg-hairline-soft/50 hover:text-ink"
                }`
              }
            >
              <div className={({ isActive }: any) => isActive ? "text-ink" : "text-mute"}>
                {item.icon}
              </div>
              {item.label}
            </NavLink>
          ))}
        </div>
        
        <div className="hidden md:flex px-4 mt-auto border-t border-hairline-soft pt-4">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-2 text-body hover:text-ink transition-colors text-body-sm font-medium"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>
    </>
  );
}
