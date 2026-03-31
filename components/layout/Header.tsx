"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { FiSearch, FiMenu } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

const moduleTitleMap: Record<string, string> = {
  "/": "Dashboard",
  "/customers": "Customers",
  "/contacts": "Contacts",
  "/companies": "Companies",
  "/deals": "Deals",
  "/tasks": "Tasks",
  "/users": "Users",
  "/notifications": "Notifications",
  "/permissions": "Permissions",
  "/settings": "Settings",
};

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();

  const activeModule = useMemo(() => {
    if (!pathname || pathname === "/") {
      return moduleTitleMap["/"];
    }

    const segments = pathname.split("/").filter(Boolean);
    const modulePath = `/${segments[0]}`;

    return moduleTitleMap[modulePath] ?? "Dashboard";
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="grid h-full grid-cols-[minmax(120px,220px)_minmax(260px,1fr)_auto] items-center gap-4 px-4 md:gap-6 md:px-6">
        <div className="min-w-0 flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <p className="truncate text-lg font-semibold text-gray-900">{activeModule}</p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-xl">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contacts, companies, deals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 justify-self-end">
          <NotificationDropdown />

          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <Avatar name="John Doe" size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Sales Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
