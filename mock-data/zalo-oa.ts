import { AutoConfig, OaConnection, ZaloConversation } from "@/types/zalo-oa";

export const initialConnections: OaConnection[] = [
  {
    id: "oa-01",
    oaName: "Điện Lạnh Hà Nội",
    oaOfficialId: "766869157880710558",
    owner: "leader-a",
    followers: 18240,
    syncedCustomers: 1142,
    isActive: true,
    lastSyncAt: "08/04/2026 09:12",
  },
  {
    id: "oa-02",
    oaName: "Bảo Trì Điều Hòa Miền Nam",
    oaOfficialId: "359273484445227048",
    owner: "leader-b",
    followers: 9570,
    syncedCustomers: 604,
    isActive: false,
    lastSyncAt: "07/04/2026 22:18",
  },
];

export const mockConversations: ZaloConversation[] = [
  { id: "c1", name: "Zalo-542576996549178921", lastMessage: "Tệp đính kèm", timestamp: "09/04 23:32", unreadCount: 1 },
  { id: "c2", name: "Zalo-326881135739109107", lastMessage: "Uike e chúc vui", timestamp: "09/04 21:59", unreadCount: 1 },
  { id: "c3", name: "Phương Dorky", lastMessage: "Tệp đính kèm", timestamp: "09/04 10:09", unreadCount: 1 },
  { id: "c4", name: "Zalo-760205566844211220", lastMessage: "🌿 Chào mừng anh/chị đến với Official Account ...", timestamp: "05/04 17:57", unreadCount: 0 },
  { id: "c5", name: "Zalo-854062044865428023", lastMessage: "Cho e xin sdt mai e liên hệ báo giá và lấy thông ti...", timestamp: "04/04 21:57", unreadCount: 0 },
  { id: "c6", name: "Zalo-102389764396748329", lastMessage: "C muốn mua để uống giảm cân", timestamp: "04/04 20:35", unreadCount: 0 },
  { id: "c7", name: "Zalo-742302455842457668", lastMessage: "Da c", timestamp: "03/04 16:06", unreadCount: 0 },
  { id: "c8", name: "Zalo-884897847772983197", lastMessage: "Tệp đính kèm", timestamp: "01/04 22:15", unreadCount: 0 },
  { id: "c9", name: "Zalo-902885364461027529", lastMessage: "", timestamp: "01/04 21:06", unreadCount: 0 },
];

export const mockAutoConfigs: AutoConfig[] = [
  { id: "ac-01", oaName: "Điện Lạnh Hà Nội", createdBy: "Admin CRM", createdByRole: "Quản trị viên hệ thống", createdAt: "04/04/2026 12:38" },
  { id: "ac-02", oaName: "Bảo Trì Điều Hòa Miền Nam", createdBy: "Admin CRM", createdByRole: "Quản trị viên hệ thống", createdAt: "06/01/2026 09:52" },
  { id: "ac-03", oaName: "Bảo Trì Điều Hòa Miền Nam", createdBy: "Admin CRM", createdByRole: "Quản trị viên hệ thống", createdAt: "31/12/2025 13:03" },
];
