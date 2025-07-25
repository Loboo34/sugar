import { NavLink } from "react-router-dom";
import {
  Asterisk as CashRegister,
  Settings,
  BarChart3,
  ArrowRightLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useState } from "react";

const Navigation = () => {
  const user = { role: "admin" };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      to: "/",
      icon: CashRegister,
      label: "Sales Terminal",
      roles: ["admin", "cashier"],
    },
    {
      to: "/transfers",
      icon: ArrowRightLeft,
      label: "Transfers",
      roles: ["admin", "cashier"],
    },
    {
      to: "/management",
      icon: Settings,
      label: "Admin",
      roles: ["admin"],
    },
    {
      to: "/reports",
      icon: BarChart3,
      label: "Reports",
      roles: ["admin", "cashier"],
    },
  ];
  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-amber-600 text-white rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <nav
        className={cn(
          "bg-white border-r border-amber-300 min-h-screen transition-transform duration-300 ease-in-out z-40",
          "lg:relative lg:translate-x-0 lg:w-64",
          "fixed top-0 left-0 w-64",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 pt-16 lg:pt-4">
          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200",
                        isActive
                          ? "bg-amber-900 text-amber-50 font-medium"
                          : "text-amber-800 hover:bg-amber-100"
                      )
                    }
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navigation;

