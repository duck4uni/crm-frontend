import { OaConnection } from "@/types/zalo-oa";

export const initialConnections: OaConnection[] = [
  {
    id: "oa-01",
    oaName: "Điện Lạnh Hà Nội",
    oaOfficialId: "OA_993821",
    owner: "leader-a",
    followers: 18240,
    syncedCustomers: 1142,
    isActive: true,
    lastSyncAt: "08/04/2026 09:12",
  },
  {
    id: "oa-02",
    oaName: "Bảo Trì Điều Hòa Miền Nam",
    oaOfficialId: "OA_220418",
    owner: "leader-b",
    followers: 9570,
    syncedCustomers: 604,
    isActive: false,
    lastSyncAt: "07/04/2026 22:18",
  },
];
