import { apiClient } from "@/lib/api-client";
import { Contact } from "@/types";
import { PaginatedResponse, ContactsFilters } from "@/types/api";

export const contactsService = {
  async getContacts(
    filters?: ContactsFilters,
  ): Promise<PaginatedResponse<Contact>> {
    return apiClient.get<PaginatedResponse<Contact>>("/contacts", filters);
  },

  async getContact(id: string): Promise<Contact> {
    return apiClient.get<Contact>(`/contacts/${id}`);
  },

  async createContact(data: Partial<Contact>): Promise<Contact> {
    return apiClient.post<Contact>("/contacts", data);
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    return apiClient.put<Contact>(`/contacts/${id}`, data);
  },

  async deleteContact(id: string): Promise<void> {
    return apiClient.delete<void>(`/contacts/${id}`);
  },
};
