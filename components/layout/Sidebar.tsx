"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FiHome,
  FiUsers,
  FiCheckSquare,
  FiSettings,
  FiUser,
  FiBell,
  FiShield,
  FiLogOut,
  FiTag,
  FiFolder,
  FiFileText,
  FiLink,
  FiMessageCircle,
  FiSend,
  FiZap,
  FiChevronDown,
} from "react-icons/fi";
import { clearAuthSession } from "@/lib/auth-session";
import { authService } from "@/services/auth";
import { useToast } from "@/components/ui/ToastProvider";

interface NavChild {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
}

const navigation: NavItem[] = [
  { name: "Bảng điều khiển", href: "/", icon: FiHome },
  {
    name: "Khách hàng",
    icon: FiUsers,
    children: [
      { name: "Quản lý khách hàng", href: "/customers" },
      { name: "Quản lý nhóm", href: "/customers/groups" },
    ],
  },
  { name: "Người dùng", href: "/users", icon: FiUser },
  { name: "Công việc", href: "/tasks", icon: FiCheckSquare },
  { name: "Thông báo", href: "/notifications", icon: FiBell },
  { name: "Zalo OA", href: "/zalo-oa", icon: FiLink },
  { name: "Chat", href: "/chat", icon: FiMessageCircle },
  { name: "Marketing", href: "/marketing", icon: FiSend },
  { name: "Automation", href: "/automation", icon: FiZap },
  { name: "Cài đặt", href: "/settings", icon: FiSettings },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    // Auto-expand if any child is active
    const expanded = new Set<string>();
    navigation.forEach((item) => {
      if (item.children?.some((child) => pathname === child.href)) {
        expanded.add(item.name);
      }
    });
    return expanded;
  });

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const isChildActive = (item: NavItem) =>
    item.children?.some((child) => pathname === child.href) ?? false;

  const handleLogout = () => {
    startLogoutTransition(async () => {
      try {
        await authService.logout();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Đăng xuất thất bại";
        toast.warning("Không thể xác nhận đăng xuất", message);
      } finally {
        clearAuthSession();
        router.replace("/login");
      }
    });
  };

  return (
    <aside
      aria-label="Thanh điều hướng"
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-indigo-950 transition-[width] duration-300",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-16 items-center justify-center bg-gray-50 border-b border-gray-200 border-r">
        {isOpen ? (
          <Image
            src="/logo.png"
            alt="CRM Logo"
            width={120}
            height={36}
            className="object-contain"
            priority
          />
        ) : (
          <Image
            src="/logo.png"
            alt="CRM"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
        )}
      </div>

      <nav
        className={cn(
          "sidebar-scroll min-h-0 flex-1 overflow-y-auto py-6",
          isOpen ? "space-y-1 px-4" : "space-y-2 px-1",
        )}
      >
        {navigation.map((item) => {
          const Icon = item.icon;

          // Nav item with children (expandable group)
          if (item.children) {
            const isExpanded = expandedItems.has(item.name);
            const hasActiveChild = isChildActive(item);

            if (!isOpen) {
              // Collapsed sidebar: clicking the icon navigates to first child
              return (
                <Link
                  key={item.name}
                  href={item.children[0].href}
                  title={item.name}
                  aria-label={item.name}
                  className={cn(
                    "flex items-center text-sm font-medium rounded-xl transition-colors",
                    "mx-auto h-10 w-10 justify-center p-0",
                    hasActiveChild
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/50"
                      : "text-indigo-200 hover:bg-indigo-800/60 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              );
            }

            return (
              <div key={item.name}>
                {/* Group toggle button */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.name)}
                  className={cn(
                    "flex w-full items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    hasActiveChild && !isExpanded
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/50"
                      : "text-indigo-200 hover:bg-indigo-800/60 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0 mr-3" />
                  <span className="flex-1 truncate text-left">{item.name}</span>
                  <FiChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>

                {/* Children */}
                {isExpanded && (
                  <div className="mt-1 ml-4 pl-4 border-l border-indigo-700/50 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                            isActive
                              ? "bg-indigo-600 text-white font-medium"
                              : "text-indigo-300 hover:bg-indigo-800/60 hover:text-white",
                          )}
                        >
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular nav item (no children) - exclude paths that are child paths of expandable items
          const isActive = item.href
            ? item.href === "/"
              ? pathname === "/"
              : pathname === item.href
            : false;

          return (
            <Link
              key={item.name}
              href={item.href!}
              title={!isOpen ? item.name : undefined}
              aria-label={item.name}
              className={cn(
                "flex items-center text-sm font-medium rounded-lg transition-colors",
                isOpen ? "px-4 py-3" : "mx-auto h-10 w-10 justify-center p-0 rounded-xl",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/50"
                  : "text-indigo-200 hover:bg-indigo-800/60 hover:text-white",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isOpen ? "mr-3" : "mr-0")} />
              {isOpen ? <span className="truncate">{item.name}</span> : <span className="sr-only">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("shrink-0 border-t border-indigo-800/50 pb-6 pt-4", isOpen ? "px-4" : "px-1")}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={!isOpen ? "Đăng xuất" : undefined}
          aria-label="Đăng xuất"
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium transition-colors",
            isOpen ? "px-4 py-3" : "mx-auto h-10 w-10 justify-center p-0 rounded-xl",
            "text-indigo-200 hover:bg-indigo-800/60 hover:text-white disabled:opacity-60",
          )}
        >
          <FiLogOut className={cn("h-5 w-5 shrink-0", isOpen ? "mr-3" : "mr-0")} />
          {isOpen ? (
            <span className="truncate">{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          ) : (
            <span className="sr-only">Đăng xuất</span>
          )}
        </button>
      </div>
    </aside>
  );
}
