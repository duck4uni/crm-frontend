"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { FiSearch, FiMenu } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import {
  getCurrentUserSession,
  hasAuthSession,
  setCurrentUserSession,
} from "@/lib/auth-session";
import { MyInfoResponseData } from "@/types/api";
import { usersService } from "@/services/users";

const moduleTitleMap: Record<string, string> = {
  "/": "Bảng điều khiển",
  "/customers": "Khách hàng",
  "/contacts": "Liên hệ",
  "/companies": "Công ty",
  "/deals": "Thương vụ",
  "/tasks": "Công việc",
  "/users": "Người dùng",
  "/notifications": "Thông báo",
  "/permissions": "Phân quyền",
  "/settings": "Cài đặt",
};

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<MyInfoResponseData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      const cachedUser = getCurrentUserSession();

      if (cachedUser) {
        setCurrentUser(cachedUser);
        return;
      }

      if (!hasAuthSession()) {
        return;
      }

      try {
        const response = await usersService.getMyInfo();

        if (!isMounted || !response.responseData) {
          return;
        }

        setCurrentUserSession(response.responseData);
        setCurrentUser(response.responseData);
      } catch (error) {
        console.error("Load current user in header failed:", error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeModule = useMemo(() => {
    if (!pathname || pathname === "/") {
      return moduleTitleMap["/"];
    }

    const segments = pathname.split("/").filter(Boolean);
    const modulePath = `/${segments[0]}`;

    return moduleTitleMap[modulePath] ?? "Bảng điều khiển";
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="grid h-full grid-cols-[minmax(120px,220px)_minmax(260px,1fr)_auto] items-center gap-4 px-4 md:gap-6 md:px-6">
        <div className="min-w-0 flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
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
              placeholder="Tìm liên hệ, công ty, thương vụ..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 justify-self-end">
          <NotificationDropdown />

          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <Avatar name={currentUser?.full_name || "Người dùng hệ thống"} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.full_name || "Người dùng hệ thống"}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser?.email || "Quản lý kinh doanh"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
