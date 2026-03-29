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
} from "react-icons/fi";

const navigation = [
  { name: "Dashboard", href: "/", icon: FiHome },
  { name: "Customers", href: "/customers", icon: FiUsers },
  { name: "Contacts", href: "/contacts", icon: FiUsers },
  { name: "Companies", href: "/companies", icon: FiBriefcase },
  { name: "Deals", href: "/deals", icon: FiDollarSign },
  { name: "Tasks", href: "/tasks", icon: FiCheckSquare },
  { name: "Settings", href: "/settings", icon: FiSettings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <h1 className="text-2xl font-bold text-white">CRM</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
