export interface Customer {
  id: string;
  orderNumber: number;
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  salutation: string;
  mobilePhone: string;
  source: string;
  assignee: string;
  relationship: string;
  lastContactDate?: Date;
  createdDate: Date;
  customerSource: string;
  gender: "Male" | "Female" | "Other";
  sessionCount?: number;
  remainingSessions?: number;
  status: CustomerStatus;
  avatar?: string;
  groups?: string[];
}

export enum CustomerStatus {
  NEW = "new",
  QUOTED = "quoted",
  CONTACTED = "contacted",
  NOT_CONTACTED = "not_contacted",
  TESTED = "tested",
  REGISTERED = "registered",
  CONSIDERING = "considering",
  UPSELL = "upsell",
  APPROACHED = "approached",
  SURVEYED = "surveyed",
}
