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
  // Raw API name/id fields
  first_name?: string;
  last_name?: string;
  full_name?: string;
  assigned_user_id?: string;
  assigned_user_ids?: string[];
  assigned_users?: Array<{
    id: string;
    full_name: string;
  }>;
  customer_source_id?: string;
  // API-matched fields
  type?: string;
  company_name?: string;
  company_establish_date?: Date;
  description?: string;
  day_of_birth?: Date;
  major?: string;
  id_no?: string;
  id_issued_by?: string;
  id_issued_date?: Date;
  id_issued_place?: string;
  tax_code?: string;
  note?: string;
  website?: string;
  is_active?: boolean;
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
