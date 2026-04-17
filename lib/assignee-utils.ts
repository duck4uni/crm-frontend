import { AdminUserApiRow } from "@/types/api";

const LEADER_PERMISSION_NAME = "SITE LEADER";
const WORKER_PERMISSION_NAME = "SITE WORKER";

export type AssigneeRole = "leader" | "worker";

export function buildAllowedAssigneeIdSet(users: AdminUserApiRow[]): Set<string> {
  return users.reduce<Set<string>>((acc, user) => {
    const permissionNames = (user.user_permisions || [])
      .map((item) => item.permision?.name || "")
      .map((name) => name.trim())
      .filter(Boolean);

    if (
      permissionNames.includes(LEADER_PERMISSION_NAME) ||
      permissionNames.includes(WORKER_PERMISSION_NAME)
    ) {
      acc.add(user.id);
    }

    return acc;
  }, new Set<string>());
}

export function buildAssigneeRolesByUserId(
  users: AdminUserApiRow[],
): Record<string, Set<AssigneeRole>> {
  return users.reduce<Record<string, Set<AssigneeRole>>>((acc, user) => {
    const permissionNames = (user.user_permisions || [])
      .map((item) => item.permision?.name || "")
      .map((name) => name.trim());

    const roleSet = new Set<AssigneeRole>();
    if (permissionNames.includes(LEADER_PERMISSION_NAME)) {
      roleSet.add("leader");
    }

    if (permissionNames.includes(WORKER_PERMISSION_NAME)) {
      roleSet.add("worker");
    }

    if (roleSet.size > 0) {
      acc[user.id] = roleSet;
    }

    return acc;
  }, {});
}
