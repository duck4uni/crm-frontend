export interface OaConnection {
  id: string;
  oaName: string;
  oaOfficialId: string;
  owner: string;
  followers: number;
  syncedCustomers: number;
  isActive: boolean;
  lastSyncAt: string;
}

export interface OaConnectionFormState {
  oaName: string;
  oaOfficialId: string;
  owner: string;
}

export interface ZaloConversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface AutoConfig {
  id: string;
  oaName: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

export interface AutoConfigFormState {
  oaId: string;
  showCrmUsername: boolean;
  autoCreateOpportunity: boolean;
}

export const leaderOptions = [
  { value: "leader-a", label: "Leader A" },
  { value: "leader-b", label: "Leader B" },
  { value: "owner", label: "Owner" },
];

export const ownerLabelMap: Record<string, string> = {
  "leader-a": "Leader A",
  "leader-b": "Leader B",
  owner: "Owner",
};
