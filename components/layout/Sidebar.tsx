"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiCheckSquare,
  FiSettings,
  FiUser,
  FiBell,
  FiShield,
} from "react-icons/fi";

const navigation = [
  { name: "Dashboard", href: "/", icon: FiHome },
  { name: "Customers", href: "/customers", icon: FiUsers },
  { name: "Contacts", href: "/contacts", icon: FiUsers },
  { name: "Companies", href: "/companies", icon: FiBriefcase },
  { name: "Deals", href: "/deals", icon: FiDollarSign },
  { name: "Tasks", href: "/tasks", icon: FiCheckSquare },
  { name: "Users", href: "/users", icon: FiUser },
  { name: "Notifications", href: "/notifications", icon: FiBell },
  { name: "Permissions", href: "/permissions", icon: FiShield },
  { name: "Settings", href: "/settings", icon: FiSettings },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "flex h-screen flex-col overflow-hidden bg-gray-900 transition-[width] duration-300",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-16 items-center justify-center bg-gray-800">
        <h1
          className={cn(
            "font-bold text-white transition-all",
            isOpen ? "text-2xl" : "text-lg",
          )}
        >
          {isOpen ? "CRM" : "C"}
        </h1>
      </div>

      <nav className={cn("flex-1 py-6", isOpen ? "space-y-1 px-4" : "space-y-2 px-1")}>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isOpen ? item.name : undefined}
              aria-label={item.name}
              className={cn(
                "flex items-center text-sm font-medium rounded-lg transition-colors",
                isOpen ? "px-4 py-3" : "mx-auto h-10 w-10 justify-center p-0 rounded-xl",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isOpen ? "mr-3" : "mr-0")} />
              {isOpen ? <span className="truncate">{item.name}</span> : <span className="sr-only">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
