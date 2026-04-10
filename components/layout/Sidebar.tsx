"use client";

import { useTransition } from "react";
import Link from "next/link";
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
  FiBarChart2,
} from "react-icons/fi";
import { clearAuthSession } from "@/lib/auth-session";
import { authService } from "@/services/auth";
import { useToast } from "@/components/ui/ToastProvider";

const navigation = [
  { name: "Bảng điều khiển", href: "/", icon: FiHome },
  { name: "Khách hàng", href: "/customers", icon: FiUsers },
  { name: "Người dùng", href: "/users", icon: FiUser },
  // { name: "Phân quyền", href: "/permissions", icon: FiShield },
  { name: "Công việc", href: "/tasks", icon: FiCheckSquare },
  { name: "Thông báo", href: "/notifications", icon: FiBell },
  // { name: "Quản lý Tags", href: "/tags", icon: FiTag },
  // { name: "Quản lý Files", href: "/files", icon: FiFolder },
  // { name: "Xem Logs", href: "/logs", icon: FiFileText },
  { name: "Zalo OA", href: "/zalo-oa", icon: FiLink },
  { name: "Chat", href: "/chat", icon: FiMessageCircle },
  { name: "Marketing", href: "/marketing", icon: FiSend },
  { name: "Automation", href: "/automation", icon: FiZap },
  { name: "Reports", href: "/reports", icon: FiBarChart2 },
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
        "flex h-full min-h-0 flex-col overflow-hidden bg-gray-900 transition-[width] duration-300",
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

      <nav
        className={cn(
          "sidebar-scroll min-h-0 flex-1 overflow-y-auto py-6",
          isOpen ? "space-y-1 px-4" : "space-y-2 px-1",
        )}
      >
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

      <div className={cn("shrink-0 border-t border-gray-800 pb-6 pt-4", isOpen ? "px-4" : "px-1")}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={!isOpen ? "Đăng xuất" : undefined}
          aria-label="Đăng xuất"
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium transition-colors",
            isOpen ? "px-4 py-3" : "mx-auto h-10 w-10 justify-center p-0 rounded-xl",
            "text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-60",
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
