import { apiClient } from "@/lib/api-client";
import { Task } from "@/types";
import { PaginatedResponse, TasksFilters } from "@/types/api";

export const tasksService = {
  async getTasks(filters?: TasksFilters): Promise<PaginatedResponse<Task>> {
    return apiClient.get<PaginatedResponse<Task>>("/tasks", filters);
  },

  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    return apiClient.post<Task>("/tasks", data);
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, data);
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },
};
