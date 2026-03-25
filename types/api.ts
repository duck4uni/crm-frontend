import { Contact, Company, Deal, Task } from "./index";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterParams {
  search?: string;
  status?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      message: string;
    };

export interface ContactsFilters
  extends FilterParams, SortParams, PaginationParams {
  companyId?: string;
}

export interface CompaniesFilters
  extends FilterParams, SortParams, PaginationParams {
  industry?: string;
  size?: string;
}

export interface DealsFilters
  extends FilterParams, SortParams, PaginationParams {
  stage?: string;
  ownerId?: string;
  minValue?: number;
  maxValue?: number;
}

export interface TasksFilters
  extends FilterParams, SortParams, PaginationParams {
  assignedTo?: string;
  priority?: string;
  relatedToType?: string;
  relatedToId?: string;
}
